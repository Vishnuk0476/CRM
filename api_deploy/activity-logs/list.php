<?php
// ============================================================
// Activity Logs — Admin list
// GET /api/activity-logs/list.php?page=1&limit=50&entity_type=...
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$page       = max(1, intval($_GET['page'] ?? 1));
$limit      = min(200, max(1, intval($_GET['limit'] ?? 50)));
$offset     = ($page - 1) * $limit;
$entityType = trim($_GET['entity_type'] ?? '');
$action     = trim($_GET['action'] ?? '');

$where = []; $params = [];
if ($entityType) { $where[] = 'l.entity_type = :entity_type'; $params[':entity_type'] = $entityType; }
if ($action)     { $where[] = 'l.action LIKE :action'; $params[':action'] = "%$action%"; }

$clause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$stmt = $pdo->prepare("
    SELECT l.*, a.name AS admin_name_join
    FROM activity_logs l
    LEFT JOIN admins a ON l.admin_id = a.id
    $clause
    ORDER BY l.created_at DESC
    LIMIT :l OFFSET :o
");
foreach ($params as $k => $v) $stmt->bindValue($k, $v);
$stmt->bindValue(':l', $limit, PDO::PARAM_INT);
$stmt->bindValue(':o', $offset, PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll();

// Map field names for frontend + use JOIN fallback for name
foreach ($rows as &$r) {
    $r['details'] = $r['details'] ? json_decode($r['details'], true) : null;
    // Frontend expects user_name / user_email — map from admin_name / admin_email
    $r['user_name']  = $r['admin_name'] ?: $r['admin_name_join'] ?: null;
    $r['user_email'] = $r['admin_email'] ?: null;
}

$cStmt = $pdo->prepare("SELECT COUNT(*) FROM activity_logs $clause");
$cStmt->execute($params);
$total = (int)$cStmt->fetchColumn();

jsonResponse(true, [
    'logs'       => $rows,
    'pagination' => ['current_page'=>$page,'per_page'=>$limit,'total'=>$total,'total_pages'=>ceil($total/$limit)]
]);
