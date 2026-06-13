<?php
// ============================================================
// Blog — Admin update
// POST /api/blog/update.php
// Body: { id, [any updatable fields] }
// ============================================================
require_once __DIR__ . '/../admin-guard.php';
requireRole('super_admin', 'admin', 'editor');

$input = getInput();
$id    = sanitizeInput($input['id'] ?? '');
if (empty($id)) jsonResponse(false, null, 'Post ID required.', 400);

$allowed = ['slug','title','excerpt','content','category','author','image','read_time','featured','published'];
$fields  = [];
$params  = [':id' => $id];

foreach ($allowed as $field) {
    if (array_key_exists($field, $input)) {
        $fields[]        = "$field = :$field";
        $params[":$field"] = $input[$field];
    }
}
if (empty($fields)) jsonResponse(false, null, 'No fields to update.', 400);
$fields[] = 'updated_at = NOW()';

try {
    $stmt = $pdo->prepare("UPDATE blog_posts SET " . implode(', ', $fields) . " WHERE id = :id");
    $stmt->execute($params);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') jsonResponse(false, null, 'Slug already exists.', 409);
    throw $e;
}

logActivity($pdo, 'BLOG_POST_UPDATED', 'blog_post', $id);
jsonResponse(true, ['message' => 'Blog post updated.']);
