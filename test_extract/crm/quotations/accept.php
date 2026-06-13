<?php
// ============================================================
// POST — /api/crm/quotations/accept.php
// Accept a quotation
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';
require_once __DIR__ . '/../../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$data = getInput();
$id = $data['id'] ?? null;

if (!$id) jsonResponse(false, null, 'Quotation ID is required.', 400);

$stmt = $pdo->prepare("UPDATE crm_quotations SET status = 'accepted', accepted_at = NOW() WHERE id = :id");
$stmt->execute(['id' => $id]);

$stmtC = $pdo->prepare("SELECT case_id FROM crm_quotations WHERE id = ?");
$stmtC->execute([$id]);
$caseId = $stmtC->fetchColumn();
if ($caseId) {
    $pdo->prepare("UPDATE crm_cases SET milestone = 'quotation_accepted' WHERE id = ?")->execute([$caseId]);
}

logActivity($pdo, 'accepted_quotation', 'quotation', $id);

jsonResponse(true, ['message' => 'Quotation accepted successfully']);
