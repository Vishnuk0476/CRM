<?php
require_once __DIR__ . '/../customer-guard.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT id, name, email, phone, designation, company, account_tier, created_at FROM customers WHERE id = :id");
    $stmt->execute(['id' => $_SESSION['customer_id']]);
    $customer = $stmt->fetch();
    jsonResponse(true, ['customer' => $customer]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = getInput();
    $name = sanitizeInput($input['name'] ?? '');
    $phone = sanitizeInput($input['phone'] ?? '');
    $designation = sanitizeInput($input['designation'] ?? '');
    $company = sanitizeInput($input['company'] ?? '');
    
    if (!$name) {
        jsonResponse(false, null, 'Name is required.', 400);
    }
    
    $stmt = $pdo->prepare("UPDATE customers SET name = :name, phone = :phone, designation = :designation, company = :company WHERE id = :id");
    $stmt->execute([
        'name' => $name,
        'phone' => $phone,
        'designation' => $designation,
        'company' => $company,
        'id' => $_SESSION['customer_id']
    ]);
    
    jsonResponse(true, ['message' => 'Profile updated successfully.']);
}

jsonResponse(false, null, 'Method not allowed', 405);
?>
