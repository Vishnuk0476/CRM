<?php
// ============================================================
// Service Inquiries — Admin list
// GET /api/service-inquiries/list.php?page=1&limit=20&status=...
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$page   = max(1, intval($_GET['page'] ?? 1));
$limit  = min(100, max(1, intval($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;
$status = trim($_GET['status'] ?? '');
$search = trim($_GET['search'] ?? '');

$where  = [];
$params = [];

if ($status) { $where[] = 'status = :status'; $params[':status'] = $status; }
if ($search) {
    $where[] = '(name LIKE :s OR email LIKE :s2 OR reference_number LIKE :s3 OR service_name LIKE :s4)';
    $like = "%$search%";
    $params[':s'] = $like; $params[':s2'] = $like; $params[':s3'] = $like; $params[':s4'] = $like;
}

$whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$stmt = $pdo->prepare("SELECT * FROM service_inquiries $whereClause ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
foreach ($params as $k => $v) $stmt->bindValue($k, $v);
$stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll();

// Decode JSON form_data
foreach ($rows as &$row) {
    $row['form_data'] = json_decode($row['form_data'], true) ?? [];
}

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM service_inquiries $whereClause");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

jsonResponse(true, [
    'inquiries'  => $rows,
    'pagination' => ['current_page' => $page, 'per_page' => $limit, 'total' => $total, 'total_pages' => ceil($total / $limit)]
]);
