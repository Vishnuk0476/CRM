<?php
// ============================================================
// GET — /api/client/invoice.php?id=INV-XXX
// Fetch invoice details for public client view
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$invNumber = $_GET['id'] ?? null;

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
    
    // Fetch line items
    $liStmt = $pdo->prepare("SELECT * FROM crm_invoice_line_items WHERE invoice_id = :id ORDER BY id ASC");
    $liStmt->execute(['id' => $invoice['id']]);
    $invoice['items'] = $liStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Check if we need origin/destination from case if we want to show it on invoice
    if ($invoice['case_id']) {
        $cStmt = $pdo->prepare("SELECT origin_city, destination_city FROM crm_cases WHERE id = ?");
        $cStmt->execute([$invoice['case_id']]);
        $case = $cStmt->fetch(PDO::FETCH_ASSOC);
        if ($case) {
            $invoice['origin_city'] = $case['origin_city'];
            $invoice['destination_city'] = $case['destination_city'];
        }
    }

    jsonResponse(true, ['invoice' => $invoice]);
} catch (Exception $e) {
    jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
