<?php
// ============================================================
// Contact Messages — Admin list + mark as read
// GET  /api/contact-messages/list.php?unread=1
// POST /api/contact-messages/list.php  { id, is_read: true }
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getInput();
    $id = sanitizeInput($input['id'] ?? '');
    $read = intval($input['is_read'] ?? 1);
    if (empty($id)) jsonResponse(false, null, 'ID required.', 400);
    $pdo->prepare("UPDATE contact_messages SET is_read = ? WHERE id = ?")->execute([$read, $id]);
    jsonResponse(true, ['message' => 'Updated.']);
}

$page   = max(1, intval($_GET['page'] ?? 1));
$limit  = min(100, max(1, intval($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;
$unreadSql = isset($_GET['unread']) ? 'WHERE is_read = :is_read' : '';

$stmt = $pdo->prepare("SELECT * FROM contact_messages $unreadSql ORDER BY created_at DESC LIMIT :l OFFSET :o");
if (isset($_GET['unread'])) {
    $stmt->bindValue(':is_read', 0, PDO::PARAM_INT);
}
$stmt->bindValue(':l', $limit, PDO::PARAM_INT);
$stmt->bindValue(':o', $offset, PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll();

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM contact_messages $unreadSql");
if (isset($_GET['unread'])) {
    $countStmt->bindValue(':is_read', 0, PDO::PARAM_INT);
}
$countStmt->execute();
$total = (int)$countStmt->fetchColumn();

foreach ($rows as &$r) $r['is_read'] = (bool)$r['is_read'];
jsonResponse(true, ['messages' => $rows, 'total' => $total, 'unread_count' => (int)$pdo->query("SELECT COUNT(*) FROM contact_messages WHERE is_read=0")->fetchColumn()]);
