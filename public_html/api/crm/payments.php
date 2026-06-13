<?php
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];
$adminId = $_SESSION['admin_id'];

if ($method === 'GET') {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

    $query = "
        SELECT p.*, 
               i.invoice_number,
               i.client_name as customer_name
        FROM crm_payments p
        LEFT JOIN crm_invoices i ON i.id = p.invoice_id
        ORDER BY p.payment_date DESC, p.created_at DESC 
        LIMIT :limit
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $payments_db = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Total collected
    $summaryStmt = $pdo->query("SELECT SUM(amount) as total_collected FROM crm_payments WHERE status = 'confirmed'");
    $total_collected = (float) $summaryStmt->fetchColumn();
    
    $payments = [];
    foreach ($payments_db as $p) {
        $payments[] = [
            'id' => $p['id'],
            'amount' => (float) $p['amount'],
            'payment_method' => $p['payment_mode'] ?: $p['payment_method'],
            'transaction_id' => $p['reference_number'] ?: $p['transaction_id'],
            'customer_name' => $p['customer_name'] ?: $p['client_name'],
            'invoice_number' => $p['invoice_number'] ?: 'N/A',
            'payment_date_formatted' => date('d M Y', strtotime($p['payment_date']))
        ];
    }
    
    jsonResponse(true, ['payments' => $payments, 'total_collected' => $total_collected]);
}

if ($method === 'POST') {
    $data = getInput();
    
    $invoice_id = $data['invoice_id'] ?? null;
    $amount = (float)($data['amount'] ?? 0);
    $payment_method = $data['payment_method'] ?? 'other';
    $transaction_id = $data['transaction_id'] ?? null;
    $payment_date = $data['payment_date'] ?? date('Y-m-d');
    $notes = $data['notes'] ?? null;
    
    if (!$invoice_id || !$amount) {
        jsonResponse(false, null, 'Invoice ID and amount are required', 400);
    }
    
    // Check invoice
    $stmt = $pdo->prepare("SELECT * FROM crm_invoices WHERE id = ?");
    $stmt->execute([$invoice_id]);
    $invoice = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$invoice) {
        jsonResponse(false, null, 'Invoice not found', 404);
    }
    
    // Generate Payment Number
    $countStmt = $pdo->query("SELECT COUNT(*) FROM crm_payments");
    $count = $countStmt->fetchColumn() + 1;
    $payment_number = 'PAY-' . date('Y') . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            INSERT INTO crm_payments (
                payment_number, invoice_id, case_id, client_name, payment_date, amount,
                payment_mode, payment_method, reference_number, transaction_id, received_by, notes, status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
        ");
        
        $stmt->execute([
            $payment_number, $invoice_id, $invoice['case_id'], $invoice['client_name'], $payment_date, $amount,
            $payment_method, $payment_method, $transaction_id, $transaction_id, $adminId, $notes, $adminId
        ]);
        
        $payment_id = $pdo->lastInsertId();
        
        // Update Invoice
        $new_amount_paid = (float)$invoice['amount_paid'] + $amount;
        $new_balance_due = (float)$invoice['grand_total'] - $new_amount_paid;
        
        $new_status = 'partial';
        if ($new_balance_due <= 0) {
            $new_status = 'paid';
            $new_balance_due = 0; // Avoid negative balance
        }
        
        $updateInv = $pdo->prepare("
            UPDATE crm_invoices 
            SET amount_paid = ?, balance_due = ?, status = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $updateInv->execute([$new_amount_paid, $new_balance_due, $new_status, $invoice_id]);
        
        $pdo->commit();
        jsonResponse(true, ['message' => 'Payment recorded successfully', 'payment_id' => $payment_id]);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
}

if ($method === 'DELETE') {
    $data = getInput();
    $id = (int)($data['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Payment ID required', 400);

    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("SELECT * FROM crm_payments WHERE id = ?");
        $stmt->execute([$id]);
        $payment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($payment) {
            $pdo->prepare("DELETE FROM crm_payments WHERE id = ?")->execute([$id]);
            
            // Adjust invoice balance
            $invStmt = $pdo->prepare("SELECT * FROM crm_invoices WHERE id = ?");
            $invStmt->execute([$payment['invoice_id']]);
            $invoice = $invStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($invoice) {
                $new_paid = max(0, $invoice['amount_paid'] - $payment['amount']);
                $new_balance = $invoice['grand_total'] - $new_paid;
                $new_status = $new_balance >= $invoice['grand_total'] ? 'pending' : ($new_balance <= 0 ? 'paid' : 'partial');
                
                $pdo->prepare("UPDATE crm_invoices SET amount_paid = ?, balance_due = ?, status = ? WHERE id = ?")
                    ->execute([$new_paid, $new_balance, $new_status, $invoice['id']]);
            }
        }
        
        $pdo->commit();
        jsonResponse(true, ['message' => 'Payment deleted successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, null, 'Delete error: ' . $e->getMessage(), 500);
    }
}

jsonResponse(false, null, 'Method not allowed', 405);
