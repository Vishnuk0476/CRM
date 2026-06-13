<?php
// ============================================================
// Newsletter — Admin list endpoint
// GET /api/newsletter/list.php
// Query params: ?page=1&limit=50&active=1
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$page   = max(1, intval($_GET['page']  ?? 1));
$limit  = min(100, max(1, intval($_GET['limit'] ?? 50)));
$offset = ($page - 1) * $limit;

// Build where clause safely
$where  = '';
$params = [];
if (isset($_GET['active']) && $_GET['active'] !== '') {
    $where    = 'WHERE is_active = :active';
    $params[':active'] = intval($_GET['active']);
}

// Optional search
if (!empty($_GET['search'])) {
    $search = '%' . sanitizeInput($_GET['search']) . '%';
    $where  = $where ? $where . ' AND (email LIKE :s OR name LIKE :s)' : 'WHERE (email LIKE :s OR name LIKE :s)';
    $params[':s'] = $search;
}

$stmt = $pdo->prepare("SELECT id, email, name, is_active, subscribed_at FROM newsletter_subscribers $where ORDER BY subscribed_at DESC LIMIT :l OFFSET :o");
foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v);
}
$stmt->bindValue(':l', $limit, PDO::PARAM_INT);
$stmt->bindValue(':o', $offset, PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll();

// Get total count
$countStmt = $pdo->prepare("SELECT COUNT(*) FROM newsletter_subscribers $where");
foreach ($params as $k => $v) {
    $countStmt->bindValue($k, $v);
}
$countStmt->execute();
$total = (int)$countStmt->fetchColumn();

foreach ($rows as &$r) {
    $r['is_active'] = (bool)$r['is_active'];
}

jsonResponse(true, [
    'subscribers' => $rows,
    'total'       => $total,
    'page'        => $page,
    'limit'       => $limit,
    'pages'       => $limit > 0 ? ceil($total / $limit) : 1,
]);
