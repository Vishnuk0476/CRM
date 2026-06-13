<?php
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];
$adminId = $_SESSION['admin_id'];

if ($method === 'GET') {
    $search = $_GET['search'] ?? '';
    
    $query = "
        SELECT cv.*, 
               c.case_number, 
               c.client_name,
               v.vendor_name,
               v.phone_primary as vendor_phone
        FROM crm_case_vendors cv
        LEFT JOIN crm_cases c ON c.id = cv.case_id
        LEFT JOIN crm_vendors v ON v.id = cv.vendor_id
        WHERE 1=1
    ";
    
    $params = [];
    if (!empty($search)) {
        $query .= " AND (v.vendor_name LIKE :search OR c.case_number LIKE :search OR cv.service_type LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    $query .= " ORDER BY cv.created_at DESC";
    
    $stmt = $pdo->prepare($query);
    foreach ($params as $key => &$val) {
        $stmt->bindParam($key, $val);
    }
    $stmt->execute();
    
    $vendors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $summaryStmt = $pdo->query("
        SELECT 
            SUM(agreed_amount) as total_agreed,
            SUM(amount_paid) as total_paid,
            SUM(amount_pending) as total_pending
        FROM crm_case_vendors
    ");
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);
    
    jsonResponse(true, ['case_vendors' => $vendors, 'summary' => $summary]);
}

if ($method === 'POST') {
    $data = getInput();
    
    $case_id = (int)($data['case_id'] ?? 0);
    $vendor_id = (int)($data['vendor_id'] ?? 0);
    $service_type = $data['service_type'] ?? '';
    $scope_of_work = $data['scope_of_work'] ?? '';
    $agreed_amount = (float)($data['agreed_amount'] ?? 0);
    $amount_paid = (float)($data['amount_paid'] ?? 0);
    $payment_mode = $data['payment_mode'] ?? '';
    
    if (!$vendor_id || !$agreed_amount) {
        jsonResponse(false, null, 'Vendor and Agreed Amount are required', 400);
    }
    
    $amount_pending = $agreed_amount - $amount_paid;
    $status = $amount_pending <= 0 ? 'paid' : ($amount_paid > 0 ? 'partial' : 'pending');
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO crm_case_vendors (
                case_id, vendor_id, service_type, scope_of_work,
                agreed_amount, amount_paid, amount_pending, payment_mode, status, created_by
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?
            )
        ");
        $stmt->execute([
            $case_id ?: null, $vendor_id, $service_type, $scope_of_work,
            $agreed_amount, $amount_paid, $amount_pending, $payment_mode, $status, $adminId
        ]);
        
        jsonResponse(true, ['message' => 'Vendor payment record created successfully']);
    } catch (Exception $e) {
        jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
}

if ($method === 'PUT') {
    $data = getInput();
    $id = (int)($data['id'] ?? 0);
    $add_payment = (float)($data['add_payment'] ?? 0);
    
    if (!$id || $add_payment <= 0) {
        jsonResponse(false, null, 'Invalid payment amount or ID', 400);
    }
    
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("SELECT agreed_amount, amount_paid FROM crm_case_vendors WHERE id = ?");
        $stmt->execute([$id]);
        $cv = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$cv) throw new Exception("Record not found");
        
        $new_paid = $cv['amount_paid'] + $add_payment;
        $new_pending = $cv['agreed_amount'] - $new_paid;
        $status = $new_pending <= 0 ? 'paid' : 'partial';
        
        $stmt = $pdo->prepare("UPDATE crm_case_vendors SET amount_paid = ?, amount_pending = ?, status = ? WHERE id = ?");
        $stmt->execute([$new_paid, $new_pending, $status, $id]);
        
        $pdo->commit();
        jsonResponse(true, ['message' => 'Payment recorded successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, null, 'Error: ' . $e->getMessage(), 500);
    }
}

if ($method === 'DELETE') {
    $data = getInput();
    $id = (int)($data['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'ID required', 400);
    
    $pdo->prepare("DELETE FROM crm_case_vendors WHERE id = ?")->execute([$id]);
    jsonResponse(true, ['message' => 'Record deleted']);
}

jsonResponse(false, null, 'Method not allowed', 405);
