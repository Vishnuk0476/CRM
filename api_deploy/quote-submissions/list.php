<?php
// ============================================================
// Quote Submissions — Admin list
// GET /api/quote-submissions/list.php?status=...
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$page   = max(1, intval($_GET['page'] ?? 1));
$limit  = min(100, max(1, intval($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;
$status = trim($_GET['status'] ?? '');
$search = trim($_GET['search'] ?? '');

$where = []; $params = [];
if ($status) { $where[] = 'status = :status'; $params[':status'] = $status; }
if ($search) {
    $like = "%$search%";
    $where[] = '(name LIKE :s OR email LIKE :s2 OR reference_number LIKE :s3)';
    $params[':s'] = $like; $params[':s2'] = $like; $params[':s3'] = $like;
}
$clause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$stmt = $pdo->prepare("SELECT * FROM quote_submissions $clause ORDER BY created_at DESC LIMIT :l OFFSET :o");
foreach ($params as $k => $v) $stmt->bindValue($k, $v);
$stmt->bindValue(':l', $limit, PDO::PARAM_INT);
$stmt->bindValue(':o', $offset, PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll();

$cStmt = $pdo->prepare("SELECT COUNT(*) FROM quote_submissions $clause");
$cStmt->execute($params);
$total = (int)$cStmt->fetchColumn();

jsonResponse(true, ['quotes' => $rows, 'pagination' => ['current_page'=>$page,'per_page'=>$limit,'total'=>$total,'total_pages'=>ceil($total/$limit)]]);
