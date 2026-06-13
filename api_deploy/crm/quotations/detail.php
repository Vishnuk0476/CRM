<?php
// ============================================================
// GET — /api/crm/quotations/detail.php
// Get quotation details
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$id = $_GET['id'] ?? null;

if (!$id) {
    jsonResponse(false, null, 'Quotation ID is required.', 400);
}

$stmt = $pdo->prepare("SELECT * FROM crm_quotations WHERE quotation_number = :qn OR id = :id_num");
$stmt->execute([':qn' => $id, ':id_num' => (int)$id]);
$quotation = $stmt->fetch();

if (!$quotation) {
    jsonResponse(false, null, 'Quotation not found.', 404);
}

$qid = $quotation['id'];

// Decode JSON fields
foreach (['move_details', 'insurances', 'inclusions', 'exclusions'] as $jsonField) {
    if (!empty($quotation[$jsonField]) && is_string($quotation[$jsonField])) {
        $decoded = json_decode($quotation[$jsonField], true);
        $quotation[$jsonField] = is_array($decoded) ? $decoded : [];
    } else {
        $quotation[$jsonField] = is_array($quotation[$jsonField]) ? $quotation[$jsonField] : [];
    }
}

$stmtLi = $pdo->prepare("SELECT * FROM crm_quotation_line_items WHERE quotation_id = :qid ORDER BY sort_order ASC, id ASC");
$stmtLi->execute(['qid' => $qid]);
$quotation['line_items'] = $stmtLi->fetchAll();

// In revision history, match all quotes that share the same base number
$baseNumber = preg_replace('/-V\d+$/', '', $quotation['quotation_number']);
$stmtRev = $pdo->prepare("
    SELECT id, quotation_number, version, status, created_at 
    FROM crm_quotations 
    WHERE quotation_number LIKE :base 
    ORDER BY version ASC
");
$stmtRev->execute(['base' => $baseNumber . '%']);
$quotation['revision_history'] = $stmtRev->fetchAll();

jsonResponse(true, $quotation);
