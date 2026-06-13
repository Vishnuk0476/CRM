<?php
require_once __DIR__ . '/../admin-guard.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers.php';

$admin = requireAdmin();
checkModulePermission($admin, 'finance');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $case_id = isset($_GET['case_id']) ? (int)$_GET['case_id'] : null;
    $status = isset($_GET['status']) ? $_GET['status'] : null;

    $query = "SELECT e.*, c.case_number 
              FROM crm_expenses e 
              LEFT JOIN crm_cases c ON e.case_id = c.id
              WHERE 1=1";
    $params = [];
    $types = "";

    if ($case_id) {
        $query .= " AND e.case_id = ?";
        $params[] = $case_id;
        $types .= "i";
    }
    if ($status) {
        $query .= " AND e.status = ?";
        $params[] = $status;
        $types .= "s";
    }

    $query .= " ORDER BY e.created_at DESC";

    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $expenses = [];
    while ($row = $result->fetch_assoc()) {
        $expenses[] = $row;
    }

    jsonResponse(true, ['expenses' => $expenses]);
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $case_id = isset($data['case_id']) ? (int)$data['case_id'] : null;
    $expense_category = isset($data['expense_category']) ? $data['expense_category'] : 'other';
    $amount = isset($data['amount']) ? (float)$data['amount'] : 0.00;
    
    if ($amount <= 0) {
        jsonResponse(false, 'Valid amount is required', 400);
    }

    $expense_date = isset($data['expense_date']) ? $data['expense_date'] : date('Y-m-d');
    $vendor_id = isset($data['vendor_id']) ? (int)$data['vendor_id'] : null;
    $description = isset($data['description']) ? $data['description'] : '';

    $stmt = $conn->prepare("INSERT INTO crm_expenses (case_id, vendor_id, expense_category, amount, expense_date, description, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->bind_param("iisdss", $case_id, $vendor_id, $expense_category, $amount, $expense_date, $description);
    
    if ($stmt->execute()) {
        $expense_id = $stmt->insert_id;
        logActivity($conn, 'expense', $expense_id, 'recorded', "Expense of $amount recorded", $admin['id']);
        jsonResponse(true, ['message' => 'Expense recorded successfully', 'id' => $expense_id]);
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

    $stmt = $conn->prepare("UPDATE crm_expenses SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $id);
    
    if ($stmt->execute()) {
        logActivity($conn, 'expense', $id, 'status_updated', "Expense status updated to $status", $admin['id']);
        jsonResponse(true, ['message' => 'Status updated']);
    } else {
        jsonResponse(false, 'Failed to update status', 500);
    }
}

jsonResponse(false, 'Method not allowed', 405);
