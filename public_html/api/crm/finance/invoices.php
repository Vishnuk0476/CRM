<?php
require_once __DIR__ . '/../admin-guard.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers.php';

$admin = requireAdmin();
checkModulePermission($admin, 'finance');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List invoices
    $case_id = isset($_GET['case_id']) ? (int)$_GET['case_id'] : null;
    $status = isset($_GET['status']) ? $_GET['status'] : null;

    $query = "SELECT i.*, c.case_number, l.customer_name 
              FROM crm_invoices i 
              LEFT JOIN crm_cases c ON i.case_id = c.id
              LEFT JOIN crm_leads l ON c.lead_id = l.id
              WHERE 1=1";
    $params = [];
    $types = "";

    if ($case_id) {
        $query .= " AND i.case_id = ?";
        $params[] = $case_id;
        $types .= "i";
    }
    if ($status) {
        $query .= " AND i.status = ?";
        $params[] = $status;
        $types .= "s";
    }

    $query .= " ORDER BY i.created_at DESC";

    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $invoices = [];
    while ($row = $result->fetch_assoc()) {
        $row['items'] = json_decode($row['items'], true);
        $invoices[] = $row;
    }

    jsonResponse(true, ['invoices' => $invoices]);
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $case_id = isset($data['case_id']) ? (int)$data['case_id'] : null;
    
    if (!$case_id) {
        jsonResponse(false, 'Case ID is required', 400);
    }

    $invoice_number = 'INV-' . date('Ym') . '-' . rand(1000, 9999);
    $total_amount = isset($data['total_amount']) ? (float)$data['total_amount'] : 0.00;
    $tax_amount = isset($data['tax_amount']) ? (float)$data['tax_amount'] : 0.00;
    $net_amount = isset($data['net_amount']) ? (float)$data['net_amount'] : 0.00;
    $due_date = isset($data['due_date']) ? $data['due_date'] : null;
    $items = isset($data['items']) ? json_encode($data['items']) : '[]';

    $stmt = $conn->prepare("INSERT INTO crm_invoices (case_id, invoice_number, total_amount, tax_amount, net_amount, due_date, items, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')");
    $stmt->bind_param("isdddss", $case_id, $invoice_number, $total_amount, $tax_amount, $net_amount, $due_date, $items);
    
    if ($stmt->execute()) {
        $invoice_id = $stmt->insert_id;
        logActivity($conn, 'invoice', $invoice_id, 'created', "Invoice $invoice_number created", $admin['id']);
        jsonResponse(true, ['message' => 'Invoice created', 'id' => $invoice_id, 'invoice_number' => $invoice_number]);
    } else {
        jsonResponse(false, 'Database error: ' . $stmt->error, 500);
    }
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = isset($data['id']) ? (int)$data['id'] : null;
    $status = isset($data['status']) ? $data['status'] : null;
    
    if (!$id || !$status) {
        jsonResponse(false, 'ID and status are required', 400);
    }

    $stmt = $conn->prepare("UPDATE crm_invoices SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $id);
    
    if ($stmt->execute()) {
        logActivity($conn, 'invoice', $id, 'status_updated', "Invoice status updated to $status", $admin['id']);
        jsonResponse(true, ['message' => 'Status updated']);
    } else {
        jsonResponse(false, 'Failed to update status', 500);
    }
}

jsonResponse(false, 'Method not allowed', 405);
