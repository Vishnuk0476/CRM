<?php
// ============================================================
// Testimonials — Admin delete
// POST /api/testimonials/delete.php
// Body: { id }
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

requireRole('admin', 'super_admin');
requireRole('super_admin', 'admin');

$input = getInput();
$id    = sanitizeInput($input['id'] ?? '');
if (empty($id)) jsonResponse(false, null, 'ID required.', 400);

$stmt = $pdo->prepare("DELETE FROM testimonials WHERE id = ?");
$stmt->execute([$id]);

if ($stmt->rowCount() === 0) jsonResponse(false, null, 'Testimonial not found.', 404);

logActivity($pdo, 'TESTIMONIAL_DELETED', 'testimonial', $id);
jsonResponse(true, ['message' => 'Testimonial deleted.']);
