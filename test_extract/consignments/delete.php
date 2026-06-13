<?php
// ============================================================
// POST /api/consignments/delete.php
// Admin: Delete a consignment permanently
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../admin-guard.php';

requireRole('admin', 'super_admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

// Only admin or super_admin can delete consignments
requireRole('admin', 'super_admin');

$input = getInput();
$id = sanitizeInput($input['id'] ?? '');

if (empty($id)) {
    jsonResponse(false, null, 'Consignment ID is required.', 400);
}

$fetchStmt = $pdo->prepare("SELECT consignment_number FROM consignments WHERE id = :id LIMIT 1");
$fetchStmt->execute([':id' => $id]);
$consignment = $fetchStmt->fetch();

if (!$consignment) {
    jsonResponse(false, null, 'Consignment not found.', 404);
}

$delStmt = $pdo->prepare("DELETE FROM consignments WHERE id = :id");
$delStmt->execute([':id' => $id]);

try {
    logActivity($pdo, 'delete', 'consignment', $id, $consignment['consignment_number'], ['action' => 'Consignment record permanently deleted']);
} catch (Exception $e) { /* Non-fatal */ }

jsonResponse(true, ['message' => 'Consignment deleted successfully.']);
?>
