<?php
// ============================================================
// Blog — Admin delete
// POST /api/blog/delete.php  |  Body: { id }
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

requireRole('admin', 'super_admin');
requireRole('super_admin', 'admin');

$input = getInput();
$id    = sanitizeInput($input['id'] ?? '');
if (empty($id)) jsonResponse(false, null, 'Post ID required.', 400);

// Get slug before delete for log
$slugRow = $pdo->prepare("SELECT slug FROM blog_posts WHERE id = ?");
$slugRow->execute([$id]);
$slug = $slugRow->fetchColumn();

$stmt = $pdo->prepare("DELETE FROM blog_posts WHERE id = ?");
$stmt->execute([$id]);
if ($stmt->rowCount() === 0) jsonResponse(false, null, 'Post not found.', 404);

logActivity($pdo, 'BLOG_POST_DELETED', 'blog_post', $id, $slug ?: $id);
jsonResponse(true, ['message' => 'Blog post deleted.']);
