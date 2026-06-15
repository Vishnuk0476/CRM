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

$stmtC = $pdo->prepare("SELECT case_id, lead_id FROM crm_quotations WHERE id = ?");
$stmtC->execute([$id]);
$row = $stmtC->fetch(PDO::FETCH_ASSOC);

if ($row) {
    if (!empty($row['case_id'])) {
        $pdo->prepare("UPDATE crm_cases SET milestone = 'quotation_accepted' WHERE id = ?")->execute([$row['case_id']]);
    }
    if (!empty($row['lead_id'])) {
        $pdo->prepare("UPDATE crm_leads SET status = 'confirmed' WHERE id = ? AND status = 'quoted'")->execute([$row['lead_id']]);
    }
}

logActivity($pdo, 'accepted_quotation', 'quotation', $id);

jsonResponse(true, ['message' => 'Quotation accepted successfully']);
