<?php
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        jsonResponse(false, null, 'Invoice ID is required', 400);
    }
    
    $stmt = $pdo->prepare("
        SELECT i.*, 
               c.case_number as order_number,
               c.client_name as c_client_name,
               c.client_phone as c_client_phone,
               c.client_email as c_client_email
        FROM crm_invoices i
        LEFT JOIN crm_cases c ON c.id = i.case_id
        WHERE i.id = ?
    ");
    $stmt->execute([$id]);
    $invoice = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$invoice) {
        jsonResponse(false, null, 'Invoice not found', 404);
    }
    
    $itemStmt = $pdo->prepare("SELECT * FROM crm_invoice_line_items WHERE invoice_id = ? ORDER BY id ASC");
    $itemStmt->execute([$id]);
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    
    jsonResponse(true, ['invoice' => $invoice, 'items' => $items]);
}

jsonResponse(false, null, 'Method not allowed', 405);
