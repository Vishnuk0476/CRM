<?php
// ============================================================
// POST — /api/client/accept-quotation.php
// Accept a quotation from the public client view
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
$qtNumber = $data['quotation_number'] ?? null;

if (!$qtNumber) {
    jsonResponse(false, null, 'Quotation Number is required.', 400);
}

try {
    $stmt = $pdo->prepare("SELECT id, status, case_id FROM crm_quotations WHERE quotation_number = :qt");
    $stmt->execute(['qt' => $qtNumber]);
    $quotation = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$quotation) {
        jsonResponse(false, null, 'Quotation not found.', 404);
    }
    
    if ($quotation['status'] === 'accepted') {
        jsonResponse(true, ['message' => 'Quotation is already accepted']);
    }

    $pdo->beginTransaction();

    $updateStmt = $pdo->prepare("UPDATE crm_quotations SET status = 'accepted', accepted_at = NOW() WHERE id = :id");
    $updateStmt->execute(['id' => $quotation['id']]);

    // Update case milestone if case_id exists
    $caseId = $quotation['case_id'];
    if ($caseId) {
        $pdo->prepare("UPDATE crm_cases SET milestone = 'quotation_accepted' WHERE id = ?")->execute([$caseId]);
    }

    logActivity($pdo, 'accepted_quotation', 'quotation', $quotation['id'], $qtNumber, ['source' => 'Client Portal']);

    $pdo->commit();
    jsonResponse(true, ['message' => 'Quotation accepted successfully']);
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
