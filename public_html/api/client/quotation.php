<?php
// ============================================================
// GET — /api/client/quotation.php?id=QT-XXX
// Fetch quotation details for public client view (no auth required)
// ============================================================

// CORS — allow public access for client portal
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$qtNumber = $_GET['id'] ?? null;

if (!$qtNumber) {
    jsonResponse(false, null, 'Quotation ID is required.', 400);
}

try {
    $stmt = $pdo->prepare("SELECT * FROM crm_quotations WHERE quotation_number = :qt");
    $stmt->execute(['qt' => $qtNumber]);
    $quotation = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$quotation) {
        jsonResponse(false, null, 'Quotation not found.', 404);
    }
    
    // Fetch line items
    $liStmt = $pdo->prepare("SELECT * FROM crm_quotation_line_items WHERE quotation_id = :id ORDER BY sort_order ASC, id ASC");
    $liStmt->execute(['id' => $quotation['id']]);
    $quotation['line_items'] = $liStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Parse JSON fields
    if (!empty($quotation['inclusions'])) {
        $quotation['inclusions'] = json_decode($quotation['inclusions'], true);
    }
    if (!empty($quotation['exclusions'])) {
        $quotation['exclusions'] = json_decode($quotation['exclusions'], true);
    }
    if (!empty($quotation['move_details'])) {
        $quotation['move_details'] = json_decode($quotation['move_details'], true);
    }
    if (!empty($quotation['insurances'])) {
        $quotation['insurances'] = json_decode($quotation['insurances'], true);
    }

    // Hide some internal fields if necessary, but we are just sending standard data
    unset($quotation['internal_notes']);

    jsonResponse(true, ['quotation' => $quotation]);
} catch (Exception $e) {
    jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
