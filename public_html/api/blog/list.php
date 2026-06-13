<?php
// ============================================================
// Blog — List (public = published only | admin = all)
// GET /api/blog/list.php?page=1&limit=20&category=...&featured=1
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

$page     = max(1, intval($_GET['page'] ?? 1));
$limit    = min(100, max(1, intval($_GET['limit'] ?? 20)));
$offset   = ($page - 1) * $limit;
$category = trim($_GET['category'] ?? '');
$featured = isset($_GET['featured']) ? intval($_GET['featured']) : null;
$slug     = trim($_GET['slug'] ?? '');
$isAdmin  = isset($_SESSION['admin_id']);

// Single post by slug
if ($slug) {
    $conditions = $isAdmin ? 'slug = :slug' : 'slug = :slug AND published = 1';
    $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE $conditions LIMIT 1");
    $stmt->execute([':slug' => $slug]);
    $post = $stmt->fetch();
    if (!$post) jsonResponse(false, null, 'Blog post not found.', 404);
    $post['featured']  = (bool)$post['featured'];
    $post['published'] = (bool)$post['published'];
    jsonResponse(true, ['post' => $post]);
}

// Multiple posts
$where = $isAdmin ? [] : ['published = 1'];
$params = [];

if ($category) { $where[] = 'category = :category'; $params[':category'] = $category; }
if ($featured !== null) { $where[] = 'featured = :featured'; $params[':featured'] = $featured; }

$whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$stmt = $pdo->prepare("SELECT * FROM blog_posts $whereClause ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
foreach ($params as $k => $v) $stmt->bindValue($k, $v);
$stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$posts = $stmt->fetchAll();

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM blog_posts $whereClause");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

foreach ($posts as &$post) {
    $post['featured']  = (bool)$post['featured'];
    $post['published'] = (bool)$post['published'];
}

jsonResponse(true, [
    'posts'      => $posts,
    'pagination' => ['current_page' => $page, 'per_page' => $limit, 'total' => $total, 'total_pages' => ceil($total / $limit)]
]);
