<?php
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];
$adminId = $_SESSION['admin_id'];

if ($method === 'GET') {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    
    $query = "
        SELECT q.*, 
               c.case_number
        FROM crm_quotations q
        LEFT JOIN crm_cases c ON c.id = q.case_id
        ORDER BY q.created_at DESC 
        LIMIT :limit
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $quotations_db = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $quotations = [];
    foreach ($quotations_db as $q) {
        $quotations[] = [
            'id' => $q['id'],
            'quotation_number' => $q['quotation_number'],
            'status' => $q['status'],
            'case_number' => $q['case_number'],
            'client_name' => $q['client_name'],
            'client_phone' => $q['client_phone'],
            'origin_city' => $q['origin_city'],
            'destination_city' => $q['destination_city'],
            'move_date' => $q['move_date'],
            'grand_total' => $q['grand_total'],
            'created_at' => $q['created_at'],
            'internal_notes' => $q['internal_notes'],
            'assigned_sales_id' => $q['assigned_sales_id'],
            // New fields
            'is_move_date_confirmed' => (bool)$q['is_move_date_confirmed'],
            'lift_origin' => (bool)$q['lift_origin'],
            'lift_destination' => (bool)$q['lift_destination'],
            'lift_type' => $q['lift_type'],
            'car_declared_value' => (float)$q['car_declared_value'],
            'car_insurance_percentage' => (float)$q['car_insurance_percentage'],
            'gst_type' => $q['gst_type'],
            'inclusions' => $q['inclusions'] ? json_decode($q['inclusions'], true) : [],
            'exclusions' => $q['exclusions'] ? json_decode($q['exclusions'], true) : []
        ];
    }
    
    jsonResponse(true, ['quotations' => $quotations]);
}

if ($method === 'POST') {
    $action = $_GET['action'] ?? null;
    $data = getInput();
    
    if ($action === 'send') {
        $id = $data['id'] ?? null;
        if (!$id) jsonResponse(false, null, 'ID required', 400);
        
        $stmt = $pdo->prepare("UPDATE crm_quotations SET status = 'sent', sent_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(true, ['message' => 'Marked as sent']);
    }
    
    if ($action === 'update_crm') {
        $id = $data['id'] ?? null;
        if (!$id) jsonResponse(false, null, 'ID required', 400);
        
        $internal_notes = $data['internal_notes'] ?? null;
        $assigned_sales_id = !empty($data['assigned_sales_id']) ? (int)$data['assigned_sales_id'] : null;
        
        $stmt = $pdo->prepare("UPDATE crm_quotations SET internal_notes = ?, assigned_sales_id = ? WHERE id = ?");
        $stmt->execute([$internal_notes, $assigned_sales_id, $id]);
        
        jsonResponse(true, ['message' => 'CRM data updated']);
    }
    
    if ($action === 'convert') {
        $id = $data['id'] ?? null;
        if (!$id) jsonResponse(false, null, 'ID required', 400);
        
        $stmt = $pdo->prepare("SELECT * FROM crm_quotations WHERE id = ?");
        $stmt->execute([$id]);
        $q = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$q) jsonResponse(false, null, 'Quotation not found', 404);
        
        $countStmt = $pdo->query("SELECT COUNT(*) FROM crm_invoices");
        $count = $countStmt->fetchColumn() + 1;
        $invoice_number = 'INV-' . date('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
        
        try {
            $pdo->beginTransaction();
            
            // Mark quotation as converted/accepted
            $updQ = $pdo->prepare("UPDATE crm_quotations SET status = 'accepted', accepted_at = NOW() WHERE id = ?");
            $updQ->execute([$id]);
            
            // Insert Invoice
            $invStmt = $pdo->prepare("
                INSERT INTO crm_invoices (
                    invoice_number, quotation_id, case_id, lead_id, client_name, client_phone, client_email,
                    client_address, client_company, client_gst, origin_city, destination_city, bhk_type,
                    move_date, subtotal, discount_type, discount_value, discount_amount, cgst_rate, sgst_rate, igst_rate,
                    cgst_amount, sgst_amount, igst_amount, total_tax, grand_total, payment_terms, notes, terms_and_conditions,
                    status, created_by
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?,
                    'pending', ?
                )
            ");
            $invStmt->execute([
                $invoice_number, $q['id'], $q['case_id'], $q['lead_id'], $q['client_name'], $q['client_phone'], $q['client_email'],
                $q['client_address'], $q['client_company'], $q['client_gst'], $q['origin_city'], $q['destination_city'], $q['bhk_type'],
                $q['move_date'], $q['subtotal'], $q['discount_type'], $q['discount_value'], $q['discount_amount'], $q['cgst_rate'], $q['sgst_rate'], $q['igst_rate'],
                $q['cgst_amount'], $q['sgst_amount'], $q['igst_amount'], $q['total_tax'], $q['grand_total'], $q['payment_terms'], $q['notes'], $q['terms_and_conditions'],
                $adminId
            ]);
            $invoice_id = $pdo->lastInsertId();
            
            // Copy Line items
            $lineStmt = $pdo->prepare("SELECT * FROM crm_quotation_line_items WHERE quotation_id = ?");
            $lineStmt->execute([$id]);
            $lines = $lineStmt->fetchAll(PDO::FETCH_ASSOC);
            
            $insLine = $pdo->prepare("
                INSERT INTO crm_invoice_line_items (
                    invoice_id, sort_order, service_name, description, quantity, unit, unit_price, gst_rate, line_total
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            foreach ($lines as $l) {
                $insLine->execute([
                    $invoice_id, $l['sort_order'], $l['service_name'], $l['description'], $l['quantity'], $l['unit'], $l['unit_price'], $l['gst_rate'], $l['line_total']
                ]);
            }
            
            $pdo->commit();
            jsonResponse(true, ['message' => 'Converted to invoice', 'invoice_number' => $invoice_number, 'invoice_id' => $invoice_id]);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
        }
    }
    
    // Create new quotation
    $case_id = !empty($data['case_id']) ? (int)$data['case_id'] : null;
    $client_name = $data['client_name'] ?? '';
    
    if (!$client_name) jsonResponse(false, null, 'Client name is required', 400);
    
    // Totals calculations
    $line_items = $data['line_items'] ?? [];
    $subtotal = 0;
    foreach ($line_items as $li) {
        $subtotal += ($li['quantity'] * $li['unit_price']);
    }
    
    $discount_type = $data['discount_type'] ?? 'amount';
    $discount_value = (float)($data['discount_value'] ?? 0);
    $discount_amount = $discount_type === 'percent' ? ($subtotal * $discount_value / 100) : $discount_value;
    $taxable = max(0, $subtotal - $discount_amount);
    
    $sameState = false;
    if (!empty($data['origin_state']) && !empty($data['destination_state'])) {
        $sameState = strtolower(trim($data['origin_state'])) === strtolower(trim($data['destination_state']));
    }
    
    $cgst = $sameState ? ($taxable * 0.09) : 0;
    $sgst = $sameState ? ($taxable * 0.09) : 0;
    $igst = $sameState ? 0 : ($taxable * 0.18);
    $total_tax = $cgst + $sgst + $igst;
    $grand_total = $taxable + $total_tax;
    
    $countStmt = $pdo->query("SELECT COUNT(*) FROM crm_quotations");
    $count = $countStmt->fetchColumn() + 1;
    $quotation_number = 'QTN-' . date('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            INSERT INTO crm_quotations (
                quotation_number, case_id, client_name, client_phone, client_email, client_address, client_company, client_gst,
                origin_city, destination_city, bhk_type, move_date, valid_until,
                is_move_date_confirmed, lift_origin, lift_destination, lift_type,
                subtotal, discount_type, discount_value, discount_amount,
                gst_type, cgst_rate, sgst_rate, igst_rate, cgst_amount, sgst_amount, igst_amount, total_tax, grand_total,
                car_declared_value, car_insurance_percentage, inclusions, exclusions,
                payment_terms, notes, terms_and_conditions, internal_notes, assigned_sales_id, created_by,
                origin_pincode, destination_pincode, origin_address, destination_address, scope_intro_text
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?
            )
        ");
        
        $stmt->execute([
            $quotation_number, $case_id, $client_name, $data['client_phone']??'', $data['client_email']??'', $data['client_address']??'', $data['client_company']??'', $data['client_gst']??'',
            $data['origin_city']??'', $data['destination_city']??'', $data['bhk_type']??'', $data['move_date']?:null, $data['valid_until']?:null,
            isset($data['is_move_date_confirmed']) ? (int)$data['is_move_date_confirmed'] : 0,
            isset($data['lift_origin']) ? (int)$data['lift_origin'] : 0,
            isset($data['lift_destination']) ? (int)$data['lift_destination'] : 0,
            $data['lift_type'] ?? null,
            $subtotal, $discount_type, $discount_value, $discount_amount,
            $data['gst_type'] ?? '18',
            $sameState ? 9 : 0, $sameState ? 9 : 0, $sameState ? 0 : 18,
            $cgst, $sgst, $igst, $total_tax, $grand_total,
            $data['car_declared_value'] ?? 0,
            $data['car_insurance_percentage'] ?? 0,
            isset($data['inclusions']) ? json_encode($data['inclusions']) : null,
            isset($data['exclusions']) ? json_encode($data['exclusions']) : null,
            $data['payment_terms']??'', $data['notes']??'', $data['terms_and_conditions']??'',
            $data['internal_notes']??null, !empty($data['assigned_sales_id']) ? (int)$data['assigned_sales_id'] : null,
            $adminId,
            $data['origin_pincode'] ?? null,
            $data['destination_pincode'] ?? null,
            $data['origin_address'] ?? null,
            $data['destination_address'] ?? null,
            $data['scope_intro_text'] ?? null
        ]);
        
        $quotation_id = $pdo->lastInsertId();
        
        $insLine = $pdo->prepare("
            INSERT INTO crm_quotation_line_items (
                quotation_id, sort_order, service_name, description, quantity, unit, unit_price, gst_rate, line_total
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($line_items as $index => $l) {
            $l_total = $l['quantity'] * $l['unit_price'];
            $insLine->execute([
                $quotation_id, $index, $l['service_name'], $l['description']??'', $l['quantity'], $l['unit'], $l['unit_price'], $l['gst_rate'], $l_total
            ]);
        }
        
        $pdo->commit();
        jsonResponse(true, ['message' => 'Quotation saved', 'quotation_number' => $quotation_number, 'grand_total' => $grand_total]);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) jsonResponse(false, null, 'ID required', 400);
    
    $stmt = $pdo->prepare("DELETE FROM crm_quotations WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(true, ['message' => 'Deleted']);
}

jsonResponse(false, null, 'Method not allowed', 405);
