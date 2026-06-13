<?php
require_once __DIR__ . '/../admin-guard.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers.php';

$admin = requireAdmin();
checkModulePermission($admin, 'finance');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List payments
    $invoice_id = isset($_GET['invoice_id']) ? (int)$_GET['invoice_id'] : null;

    $query = "SELECT p.*, i.invoice_number, c.case_number 
              FROM crm_payments p 
              LEFT JOIN crm_invoices i ON p.invoice_id = i.id
              LEFT JOIN crm_cases c ON i.case_id = c.id
              WHERE 1=1";
    $params = [];
    $types = "";

    if ($invoice_id) {
        $query .= " AND p.invoice_id = ?";
        $params[] = $invoice_id;
        $types .= "i";
    }

    $query .= " ORDER BY p.payment_date DESC";

    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $payments = [];
    while ($row = $result->fetch_assoc()) {
        $payments[] = $row;
    }

    jsonResponse(true, ['payments' => $payments]);
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $invoice_id = isset($data['invoice_id']) ? (int)$data['invoice_id'] : null;
    $amount = isset($data['amount']) ? (float)$data['amount'] : 0.00;
    
    if (!$invoice_id || $amount <= 0) {
        jsonResponse(false, 'Invoice ID and valid amount are required', 400);
    }

    $payment_method = isset($data['payment_method']) ? $data['payment_method'] : 'bank_transfer';
    $transaction_id = isset($data['transaction_id']) ? $data['transaction_id'] : null;
    $payment_date = isset($data['payment_date']) ? $data['payment_date'] : date('Y-m-d');
    $notes = isset($data['notes']) ? $data['notes'] : '';

    $stmt = $conn->prepare("INSERT INTO crm_payments (invoice_id, amount, payment_method, transaction_id, payment_date, notes) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("idssss", $invoice_id, $amount, $payment_method, $transaction_id, $payment_date, $notes);
    
    if ($stmt->execute()) {
        $payment_id = $stmt->insert_id;
        logActivity($conn, 'payment', $payment_id, 'recorded', "Payment of $amount recorded for invoice #$invoice_id", $admin['id']);
        
        // Update total_collected_amount in case
        $conn->query("UPDATE crm_cases c 
                      JOIN crm_invoices i ON c.id = i.case_id 
                      SET c.total_collected_amount = c.total_collected_amount + $amount 
                      WHERE i.id = $invoice_id");

        jsonResponse(true, ['message' => 'Payment recorded successfully', 'id' => $payment_id]);
    } else {
        jsonResponse(false, 'Database error: ' . $stmt->error, 500);
    }
}

jsonResponse(false, 'Method not allowed', 405);
