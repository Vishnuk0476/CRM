<?php
require_once __DIR__ . '/../admin-guard.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers.php';

$admin = requireAdmin();
checkModulePermission($admin, 'finance');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List quotations
    $case_id = isset($_GET['case_id']) ? (int)$_GET['case_id'] : null;
    $lead_id = isset($_GET['lead_id']) ? (int)$_GET['lead_id'] : null;
    $status = isset($_GET['status']) ? $_GET['status'] : null;

    $query = "SELECT q.*, c.case_number, l.customer_name 
              FROM crm_quotations q 
              LEFT JOIN crm_cases c ON q.case_id = c.id
              LEFT JOIN crm_leads l ON c.lead_id = l.id
              WHERE 1=1";
    $params = [];
    $types = "";

    if ($case_id) {
        $query .= " AND q.case_id = ?";
        $params[] = $case_id;
        $types .= "i";
    }
    if ($lead_id) {
        $query .= " AND c.lead_id = ?";
        $params[] = $lead_id;
        $types .= "i";
    }
    if ($status) {
        $query .= " AND q.status = ?";
        $params[] = $status;
        $types .= "s";
    }

    $query .= " ORDER BY q.created_at DESC";

    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $quotations = [];
    while ($row = $result->fetch_assoc()) {
        $row['items'] = json_decode($row['items'], true);
        $quotations[] = $row;
    }

    jsonResponse(true, ['quotations' => $quotations]);
}

if ($method === 'POST') {
    // Create new quotation
    $data = json_decode(file_get_contents('php://input'), true);
    $case_id = isset($data['case_id']) ? (int)$data['case_id'] : null;
    
    if (!$case_id) {
        jsonResponse(false, 'Case ID is required', 400);
    }

    $quotation_number = 'QT-' . date('Ym') . '-' . rand(1000, 9999);
    $total_amount = isset($data['total_amount']) ? (float)$data['total_amount'] : 0.00;
    $tax_amount = isset($data['tax_amount']) ? (float)$data['tax_amount'] : 0.00;
    $net_amount = isset($data['net_amount']) ? (float)$data['net_amount'] : 0.00;
    $items = isset($data['items']) ? json_encode($data['items']) : '[]';
    $terms = isset($data['terms_conditions']) ? $data['terms_conditions'] : '';

    $stmt = $conn->prepare("INSERT INTO crm_quotations (case_id, quotation_number, total_amount, tax_amount, net_amount, items, terms_conditions, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')");
    $stmt->bind_param("isdddss", $case_id, $quotation_number, $total_amount, $tax_amount, $net_amount, $items, $terms);
    
    if ($stmt->execute()) {
        $quotation_id = $stmt->insert_id;
        logActivity($conn, 'quotation', $quotation_id, 'created', "Quotation $quotation_number created", $admin['id']);
        jsonResponse(true, ['message' => 'Quotation created successfully', 'id' => $quotation_id, 'quotation_number' => $quotation_number]);
    } else {
        jsonResponse(false, 'Database error: ' . $stmt->error, 500);
    }
}

if ($method === 'PUT') {
    // Update quotation status
    $data = json_decode(file_get_contents('php://input'), true);
    $id = isset($data['id']) ? (int)$data['id'] : null;
    $status = isset($data['status']) ? $data['status'] : null;
    
    if (!$id || !$status) {
        jsonResponse(false, 'ID and status are required', 400);
    }

    $stmt = $conn->prepare("UPDATE crm_quotations SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $id);
    
    if ($stmt->execute()) {
        logActivity($conn, 'quotation', $id, 'status_updated', "Quotation status updated to $status", $admin['id']);
        jsonResponse(true, ['message' => 'Status updated']);
    } else {
        jsonResponse(false, 'Failed to update status', 500);
    }
}

jsonResponse(false, 'Method not allowed', 405);
