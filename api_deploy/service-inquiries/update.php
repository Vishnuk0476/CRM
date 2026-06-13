<?php
// ============================================================
// Service Inquiries — Admin update (status + message)
// POST /api/service-inquiries/update.php
// Body: { id, status, status_message? }
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(false, null, 'Method not allowed', 405);

$input  = getInput();
$id     = sanitizeInput($input['id'] ?? '');
if (empty($id)) jsonResponse(false, null, 'ID required.', 400);

$oldRow = $pdo->prepare("SELECT status, reference_number, name, email, service_name, service_type FROM service_inquiries WHERE id = ?");
$oldRow->execute([$id]);
$old = $oldRow->fetch();
if (!$old) jsonResponse(false, null, 'Service inquiry not found.', 404);

$newStatus  = $input['status'] ?? $old['status'];
$newMessage = array_key_exists('status_message', $input) ? ($input['status_message'] ?: null) : null;

$pdo->prepare("UPDATE service_inquiries SET status = ?, status_message = ?, updated_at = NOW() WHERE id = ?")
    ->execute([$newStatus, $newMessage, $id]);

$statusChanged = $newStatus !== $old['status'];
logActivity($pdo, $statusChanged ? 'SERVICE_INQUIRY_STATUS_UPDATED' : 'SERVICE_INQUIRY_UPDATED', 'service_inquiry', $id, $old['reference_number'], [
    'old_status' => $old['status'],
    'new_status' => $newStatus,
]);

// Email notification if status changed
if ($statusChanged) {
    $body = "<p>Dear <strong>" . htmlspecialchars($old['name']) . "</strong>,</p>
    <p>The status of your service inquiry has been updated.</p>
    <div class='field'><div class='label'>Reference</div><div class='value'>" . htmlspecialchars($old['reference_number']) . "</div></div>
    <div class='field'><div class='label'>Service</div><div class='value'>" . htmlspecialchars($old['service_name']) . "</div></div>
    <div class='field'><div class='label'>New Status</div><div class='value'>" . htmlspecialchars(ucfirst(str_replace('_', ' ', $newStatus))) . "</div></div>" .
    ($newMessage ? "<div class='field'><div class='label'>Message</div><div class='value'>" . htmlspecialchars($newMessage) . "</div></div>" : "") . "
    <div class='alert'>You can track your inquiry at any time on our website.</div>";
    sendEmail($old['email'], 'Service Inquiry Status Update — ' . $old['reference_number'], emailTemplate('Inquiry Status Updated', $body));
}

jsonResponse(true, ['message' => 'Service inquiry updated.']);
