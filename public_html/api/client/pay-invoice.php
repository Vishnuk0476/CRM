<?php
// ============================================================
// POST — /api/client/pay-invoice.php
// Mock payment endpoint to mark invoice as paid
// ============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$data = getInput();
$invNumber = $data['invoice_number'] ?? null;
// Mock transaction ID from client
$transactionId = $data['transaction_id'] ?? 'TXN-' . time();

if (!$invNumber) {
    jsonResponse(false, null, 'Invoice Number is required.', 400);
}

try {
    $stmt = $pdo->prepare("SELECT * FROM crm_invoices WHERE invoice_number = :inv");
    $stmt->execute(['inv' => $invNumber]);
    $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$invoice) {
        jsonResponse(false, null, 'Invoice not found.', 404);
    }
    
    if ($invoice['status'] === 'paid') {
        jsonResponse(true, ['message' => 'Invoice is already paid']);
    }

    $pdo->beginTransaction();

    $grandTotal = (float)$invoice['grand_total'];
    $amountPaid = $grandTotal; // Full payment for mock

    $updateStmt = $pdo->prepare("UPDATE crm_invoices SET status = 'paid', amount_paid = :paid, balance_due = 0 WHERE id = :id");
    $updateStmt->execute(['paid' => $amountPaid, 'id' => $invoice['id']]);

    // Insert payment record
    // Ensure crm_payments exists, if not, skip inserting to avoid crash
    $tableExists = $pdo->query("SHOW TABLES LIKE 'crm_payments'")->rowCount() > 0;
    if ($tableExists) {
        $payStmt = $pdo->prepare("
            INSERT INTO crm_payments (
                invoice_id, amount, payment_date, payment_method, reference_no, status, created_by
            ) VALUES (
                ?, ?, NOW(), 'online', ?, 'completed', NULL
            )
        ");
        $payStmt->execute([$invoice['id'], $amountPaid, $transactionId]);
    }

    // Update case milestone if case_id exists
    // (We could set it to something, but maybe leave it alone since "in_transit" or "delivered" are manual usually)
    // We will just log activity
    logActivity($pdo, 'payment_received', 'invoice', $invoice['id'], $invNumber, ['amount' => $amountPaid, 'txn' => $transactionId]);

    $pdo->commit();
    jsonResponse(true, ['message' => 'Payment successful', 'transaction_id' => $transactionId]);
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
