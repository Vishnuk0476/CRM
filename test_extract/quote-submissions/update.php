<?php
// ============================================================
// Quote Submissions — Admin update + public track
// POST /api/quote-submissions/update.php  { id, status, status_message? }
// GET  /api/quote-submissions/track.php?ref=...
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

// Public track by reference
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $ref = trim($_GET['ref'] ?? '');
    if (empty($ref)) jsonResponse(false, null, 'Reference number required.', 400);
    $stmt = $pdo->prepare("SELECT reference_number, name, service_type, property_type, status, status_message, created_at FROM quote_submissions WHERE reference_number = ?");
    $stmt->execute([$ref]);
    $row = $stmt->fetch();
    if (!$row) jsonResponse(false, null, 'Quote not found.', 404);
    jsonResponse(true, ['quote' => $row]);
}

// Admin update (requires session)
require_once __DIR__ . '/../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(false, null, 'Method not allowed', 405);

$input = getInput();
$id    = sanitizeInput($input['id'] ?? '');
if (empty($id)) jsonResponse(false, null, 'ID required.', 400);

$oldRow = $pdo->prepare("SELECT status, reference_number, name, email FROM quote_submissions WHERE id = ?");
$oldRow->execute([$id]);
$old = $oldRow->fetch();
if (!$old) jsonResponse(false, null, 'Quote not found.', 404);

$newStatus  = $input['status'] ?? $old['status'];
$newMessage = $input['status_message'] ?? null;

$pdo->prepare("UPDATE quote_submissions SET status = ?, status_message = ?, updated_at = NOW() WHERE id = ?")
    ->execute([$newStatus, $newMessage, $id]);

logActivity($pdo, 'QUOTE_STATUS_UPDATED', 'quote_submission', $id, $old['reference_number'], ['old_status'=>$old['status'],'new_status'=>$newStatus]);

if ($newStatus !== $old['status']) {
    $body = "<p>Dear <strong>" . htmlspecialchars($old['name']) . "</strong>,</p>
        <p>Your quote request status has been updated.</p>
        <div class='field'><div class='label'>Reference</div><div class='value'>" . htmlspecialchars($old['reference_number']) . "</div></div>
        <div class='field'><div class='label'>Status</div><div class='value'>" . htmlspecialchars(ucfirst(str_replace('_',' ',$newStatus))) . "</div></div>" .
        ($newMessage ? "<div class='field'><div class='label'>Message</div><div class='value'>" . htmlspecialchars($newMessage) . "</div></div>" : '') . "
        <div class='alert'>Track your quote at any time on our website.</div>";
    sendEmail($old['email'], "Quote Status Update — " . $old['reference_number'], emailTemplate('Quote Status Updated', $body));
}

jsonResponse(true, ['message' => 'Quote updated.']);
