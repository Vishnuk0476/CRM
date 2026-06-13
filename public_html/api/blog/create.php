<?php
// ============================================================
// Blog — Admin create
// POST /api/blog/create.php
// Body: { slug, title, excerpt, content, category, author?, image?, read_time?, featured?, published? }
// ============================================================
require_once __DIR__ . '/../admin-guard.php';
requireRole('super_admin', 'admin', 'editor');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(false, null, 'Method not allowed', 405);

$input = getInput();
$required = ['slug', 'title', 'excerpt', 'content', 'category'];
foreach ($required as $field) {
    if (empty(sanitizeInput($input[$field] ?? ''))) jsonResponse(false, null, "Field '$field' is required.", 400);
}

$stmt = $pdo->prepare("
    INSERT INTO blog_posts (slug, title, excerpt, content, category, author, image, read_time, featured, published)
    VALUES (:slug, :title, :excerpt, :content, :category, :author, :image, :read_time, :featured, :published)
");

try {
    $stmt->execute([
        ':slug'      => sanitizeInput($input['slug']),
        ':title'     => sanitizeInput($input['title']),
        ':excerpt'   => sanitizeInput($input['excerpt']),
        ':content'   => $input['content'],
        ':category'  => sanitizeInput($input['category']),
        ':author'    => sanitizeInput($input['author'] ?? 'Panya Team'),
        ':image'     => sanitizeInput($input['image'] ?? '') ?: null,
        ':read_time' => sanitizeInput($input['read_time'] ?? '5 min read'),
        ':featured'  => intval($input['featured'] ?? 0),
        ':published' => intval($input['published'] ?? 1),
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        jsonResponse(false, null, 'A post with this slug already exists.', 409);
    }
    throw $e;
}

$id = $pdo->lastInsertId();
logActivity($pdo, 'BLOG_POST_CREATED', 'blog_post', (string)$id, $input['slug'] ?? '');
jsonResponse(true, ['id' => $id, 'message' => 'Blog post created successfully.'], null, 201);
