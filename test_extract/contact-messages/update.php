<?php
// ============================================================
// Contact Messages — Update (mark as read/unread)
// POST /api/contact-messages/update.php
// Body: { "id": 1, "is_read": true }
//    OR { "ids": [1,2,3], "is_read": true }   (bulk)
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input  = getInput();
$isRead = isset($input['is_read']) ? (bool)$input['is_read'] : true;

// Bulk update support
if (!empty($input['ids']) && is_array($input['ids'])) {
    $ids = array_filter(array_map('intval', $input['ids']));
    if (empty($ids)) {
        jsonResponse(false, null, 'No valid IDs provided.', 400);
    }
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $params       = $ids;
    array_unshift($params, (int)$isRead);
    $pdo->prepare("UPDATE contact_messages SET is_read = ? WHERE id IN ($placeholders)")
        ->execute($params);
    logActivity($pdo, $isRead ? 'MARK_MESSAGES_READ' : 'MARK_MESSAGES_UNREAD', 'contact_messages', implode(',', $ids));
    jsonResponse(true, ['updated' => count($ids), 'is_read' => $isRead]);
}

// Single update
$id = intval($input['id'] ?? 0);
if (!$id) {
    jsonResponse(false, null, 'Message ID is required.', 400);
}

$stmt = $pdo->prepare("UPDATE contact_messages SET is_read = ? WHERE id = ?");
$stmt->execute([(int)$isRead, $id]);

if ($stmt->rowCount() === 0) {
    jsonResponse(false, null, 'Message not found.', 404);
}

logActivity($pdo, $isRead ? 'MARK_MESSAGE_READ' : 'MARK_MESSAGE_UNREAD', 'contact_messages', (string)$id);
jsonResponse(true, ['id' => $id, 'is_read' => $isRead]);
