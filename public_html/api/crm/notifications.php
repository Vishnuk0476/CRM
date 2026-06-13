<?php
// ============================================================
// CRM Notifications API
// GET    /api/crm/notifications.php              → List for current admin
// POST   /api/crm/notifications.php?action=mark_read       → Mark one read
// POST   /api/crm/notifications.php?action=mark_all_read   → Mark all read
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$method  = $_SERVER['REQUEST_METHOD'];
$action  = trim($_GET['action'] ?? '');
$adminId = (int)($_SESSION['admin_id'] ?? 0);

if ($method === 'GET') {
    $limit  = min(max((int)($_GET['limit'] ?? 30), 1), 100);
    $offset = max((int)($_GET['offset'] ?? 0), 0);
    $unreadOnly = isset($_GET['unread_only']) && $_GET['unread_only'] === '1';

    $where  = 'admin_id = :aid';
    $params = [':aid' => $adminId];
    if ($unreadOnly) { $where .= ' AND is_read = 0'; }

    $countStmt = $pdo->prepare("SELECT COUNT(*), SUM(is_read=0) FROM crm_notifications WHERE $where");
    $countStmt->execute($params);
    $row = $countStmt->fetch(PDO::FETCH_NUM);
    $total   = (int)$row[0];
    $unread  = (int)$row[1];

    $stmt = $pdo->prepare("
        SELECT * FROM crm_notifications 
        WHERE $where 
        ORDER BY created_at DESC 
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindValue(':aid', $adminId, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    jsonResponse(true, ['notifications' => $rows, 'total' => $total, 'unread_count' => $unread]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    if ($action === 'mark_read') {
        $id = (int)($input['id'] ?? 0);
        if (!$id) jsonResponse(false, null, 'Notification ID required', 400);
        $pdo->prepare("UPDATE crm_notifications SET is_read=1, read_at=NOW() WHERE id=:id AND admin_id=:aid")
            ->execute([':id'=>$id, ':aid'=>$adminId]);
        jsonResponse(true, null, 'Marked as read.');
    }

    if ($action === 'mark_all_read') {
        $pdo->prepare("UPDATE crm_notifications SET is_read=1, read_at=NOW() WHERE admin_id=:aid AND is_read=0")
            ->execute([':aid'=>$adminId]);
        jsonResponse(true, null, 'All notifications marked as read.');
    }
}

jsonResponse(false, null, 'Method not allowed', 405);
