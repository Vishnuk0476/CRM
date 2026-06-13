<?php
require_once __DIR__ . '/../customer-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$customerId = $_SESSION['customer_id'];
$customerEmail = $_SESSION['customer_email'];

// Fetch customer details to get phone
$stmt = $pdo->prepare("SELECT phone, account_tier FROM customers WHERE id = :id");
$stmt->execute(['id' => $customerId]);
$customer = $stmt->fetch();
$customerPhone = $customer['phone'] ?? '';
$accountTier = $customer['account_tier'] ?? 'free';

// Fetch Quotes
$quotesStmt = $pdo->prepare("
    SELECT id, quotation_number, relocation_type, move_date, quotation_date, grand_total, status, origin_city, destination_city
    FROM crm_quotations
    WHERE client_email = :email OR (client_phone = :phone AND client_phone != '')
    ORDER BY created_at DESC
");
$quotesStmt->execute([
    'email' => $customerEmail,
    'phone' => $customerPhone
]);
$quotes = $quotesStmt->fetchAll();

// Fetch Consignments
$consignmentsStmt = $pdo->prepare("
    SELECT id, consignment_number, lr_number, awb_number, origin, destination, service_type, estimated_delivery, status, created_at
    FROM consignments
    WHERE customer_email = :email OR (customer_phone = :phone AND customer_phone != '')
    ORDER BY created_at DESC
");
$consignmentsStmt->execute([
    'email' => $customerEmail,
    'phone' => $customerPhone
]);
$consignments = $consignmentsStmt->fetchAll();

jsonResponse(true, [
    'account_tier' => $accountTier,
    'quotes' => $quotes,
    'consignments' => $consignments
]);
?>
