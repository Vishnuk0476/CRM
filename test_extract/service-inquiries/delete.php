<?php
// ============================================================
// Service Inquiries — Admin delete
// POST /api/service-inquiries/delete.php
// Body: { id: string }
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

// Admin guard — must be logged in
if (!isset($_SESSION['admin_id'])) {
    jsonResponse(false, null, 'Authentication required', 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input = getInput();
$id    = sanitizeInput($input['id'] ?? '');
if (empty($id)) jsonResponse(false, null, 'ID is required.', 400);

// Fetch inquiry first for activity log
$stmt = $pdo->prepare("SELECT reference_number FROM service_inquiries WHERE id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) jsonResponse(false, null, 'Inquiry not found.', 404);

$pdo->prepare("DELETE FROM service_inquiries WHERE id = ?")->execute([$id]);

// Log the action (correct argument order: pdo, action, entityType, entityId, entityRef, details)
logActivity($pdo, 'deleted', 'service_inquiry', (string)$id, $row['reference_number'], [
    'deleted_at' => date('Y-m-d H:i:s'),
]);

jsonResponse(true, null, null, 200);
