<?php
// ============================================================
// Testimonials — Admin update (approve/reject/edit)
// POST /api/testimonials/update.php
// Body: { id, is_approved?, is_video?, image_url?, video_url?, helpful_count? }
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input = getInput();
$id    = sanitizeInput($input['id'] ?? '');

if (empty($id)) jsonResponse(false, null, 'Testimonial ID is required.', 400);

// Build dynamic SET clause
$fields = [];
$params = [':id' => $id];

$allowed = ['is_approved', 'is_video', 'image_url', 'video_url', 'avatar_url', 'media_urls', 'helpful_count', 'name', 'role', 'location', 'rating', 'content'];
foreach ($allowed as $field) {
    if (array_key_exists($field, $input)) {
        $fields[] = "$field = :$field";
        $params[":$field"] = $input[$field];
    }
}

if (empty($fields)) jsonResponse(false, null, 'No fields to update.', 400);
$fields[] = 'updated_at = NOW()';

$stmt = $pdo->prepare("UPDATE testimonials SET " . implode(', ', $fields) . " WHERE id = :id");
$stmt->execute($params);

if ($stmt->rowCount() === 0) {
    jsonResponse(false, null, 'Testimonial not found or no changes made.', 404);
}

$action = isset($input['is_approved'])
    ? ($input['is_approved'] ? 'TESTIMONIAL_APPROVED' : 'TESTIMONIAL_REJECTED')
    : 'TESTIMONIAL_UPDATED';
logActivity($pdo, $action, 'testimonial', $id);

jsonResponse(true, ['message' => 'Testimonial updated successfully.']);
