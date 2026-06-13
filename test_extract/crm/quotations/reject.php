<?php
// ============================================================
// POST — /api/crm/quotations/reject.php
// Reject a quotation
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';
require_once __DIR__ . '/../../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$data = getInput();
$id = $data['id'] ?? null;
$reason = $data['reason'] ?? 'No reason provided';

if (!$id) jsonResponse(false, null, 'Quotation ID is required.', 400);

$stmt = $pdo->prepare("UPDATE crm_quotations SET status = 'rejected', rejected_at = NOW(), rejection_reason = :reason WHERE id = :id");
$stmt->execute(['id' => $id, 'reason' => $reason]);

logActivity($pdo, 'rejected_quotation', 'quotation', $id, null, ['reason' => $reason]);

jsonResponse(true, ['message' => 'Quotation rejected successfully']);
