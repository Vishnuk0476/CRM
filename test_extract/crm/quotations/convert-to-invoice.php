<?php
// ============================================================
// POST — /api/crm/quotations/convert-to-invoice.php
// Convert an accepted quotation into an invoice
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';
require_once __DIR__ . '/../../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$data = getInput();
$id = $data['id'] ?? null;
$admin_id = $_SESSION['admin_id'] ?? 1; // Fallback to 1 if testing without auth

if (!$id) jsonResponse(false, null, 'Quotation ID is required.', 400);

$stmt = $pdo->prepare("SELECT * FROM crm_quotations WHERE id = :id");
$stmt->execute(['id' => $id]);
$quotation = $stmt->fetch();

if (!$quotation) jsonResponse(false, null, 'Quotation not found.', 404);
if ($quotation['status'] !== 'accepted') jsonResponse(false, null, 'Only accepted quotations can be converted.', 400);

// Check if already converted by checking if invoice exists for this quotation
$stmtCheck = $pdo->prepare("SELECT id FROM crm_invoices WHERE quotation_id = :id");
$stmtCheck->execute(['id' => $id]);
if ($stmtCheck->fetch()) {
    jsonResponse(false, null, 'Quotation has already been converted to an invoice.', 400);
}

// Fetch CRM settings for invoice prefix
$stmtSettings = $pdo->query("SELECT * FROM crm_app_settings");
$settingsRows = $stmtSettings->fetchAll();
$settings = [];
foreach ($settingsRows as $row) {
    $settings[$row['setting_key']] = $row['setting_value'];
}
$prefix = $settings['invoice_prefix'] ?? 'INV';
$year = date('Y');
$invoice_number = $prefix . '-' . $year . '-' . str_pad($id, 4, '0', STR_PAD_LEFT);

$pdo->beginTransaction();
try {
    // 1. Insert into crm_invoices
    $stmtInv = $pdo->prepare("
        INSERT INTO crm_invoices (
            quotation_id, invoice_number, case_id, client_name, client_phone, client_email, 
            client_address, client_company, client_gst, origin_city, origin_state, 
            destination_city, destination_state, bhk_type, move_date, discount_type, 
            discount_value, subtotal, discount_amount, taxable_amount, cgst_amount, 
            sgst_amount, igst_amount, grand_total, payment_terms, terms_and_conditions, 
            notes, status, created_by, balance_due
        ) VALUES (
            :quotation_id, :invoice_number, :case_id, :client_name, :client_phone, :client_email, 
            :client_address, :client_company, :client_gst, :origin_city, :origin_state, 
            :destination_city, :destination_state, :bhk_type, :move_date, :discount_type, 
            :discount_value, :subtotal, :discount_amount, :taxable_amount, :cgst_amount, 
            :sgst_amount, :igst_amount, :grand_total, :payment_terms, :terms_and_conditions, 
            :notes, 'draft', :created_by, :balance_due
        )
    ");
    
    $stmtInv->execute([
        'quotation_id' => $quotation['id'],
        'invoice_number' => $invoice_number,
        'case_id' => $quotation['case_id'],
        'client_name' => $quotation['client_name'],
        'client_phone' => $quotation['client_phone'],
        'client_email' => $quotation['client_email'],
        'client_address' => $quotation['client_address'],
        'client_company' => $quotation['client_company'],
        'client_gst' => $quotation['client_gst'],
        'origin_city' => $quotation['origin_city'],
        'origin_state' => $quotation['origin_state'] ?? null,
        'destination_city' => $quotation['destination_city'] ?? null,
        'destination_state' => $quotation['destination_state'] ?? null,
        'bhk_type' => $quotation['bhk_type'] ?? null,
        'move_date' => $quotation['move_date'] ?? null,
        'discount_type' => $quotation['discount_type'] ?? null,
        'discount_value' => $quotation['discount_value'] ?? 0,
        'subtotal' => $quotation['subtotal'] ?? 0,
        'discount_amount' => $quotation['discount_amount'] ?? 0,
        'taxable_amount' => $quotation['taxable_amount'] ?? 0,
        'cgst_amount' => $quotation['cgst_amount'] ?? 0,
        'sgst_amount' => $quotation['sgst_amount'] ?? 0,
        'igst_amount' => $quotation['igst_amount'] ?? 0,
        'grand_total' => $quotation['grand_total'],
        'payment_terms' => $quotation['payment_terms'],
        'terms_and_conditions' => $quotation['terms_and_conditions'],
        'notes' => $quotation['notes'],
        'created_by' => $admin_id,
        'balance_due' => $quotation['grand_total']
    ]);
    
    $invoice_id = $pdo->lastInsertId();
    
    // 2. Fetch and Clone Line Items
    $stmtItems = $pdo->prepare("SELECT * FROM crm_quotation_line_items WHERE quotation_id = :qid");
    $stmtItems->execute(['qid' => $id]);
    $lineItems = $stmtItems->fetchAll();
    
    $stmtInsertItem = $pdo->prepare("
        INSERT INTO crm_invoice_line_items (
            invoice_id, service_name, description, quantity, unit, unit_price, gst_rate, line_total
        ) VALUES (
            :invoice_id, :service_name, :description, :quantity, :unit, :unit_price, :gst_rate, :line_total
        )
    ");
    
    foreach ($lineItems as $item) {
        $stmtInsertItem->execute([
            'invoice_id' => $invoice_id,
            'service_name' => $item['service_name'],
            'description' => $item['description'],
            'quantity' => $item['quantity'],
            'unit' => $item['unit'],
            'unit_price' => $item['unit_price'],
            'gst_rate' => $item['gst_rate'],
            'line_total' => $item['line_total']
        ]);
    }
    
    // 3. Update Quotation Status
    $pdo->prepare("UPDATE crm_quotations SET status = 'converted' WHERE id = :id")->execute(['id' => $id]);
    
    // 4. Log the activity
    logActivity($pdo, 'converted_to_invoice', 'quotation', $id);
    
    $pdo->commit();
    jsonResponse(true, [
        'message' => 'Quotation successfully converted to Invoice!',
        'invoice_id' => $invoice_id,
        'invoice_number' => $invoice_number
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
