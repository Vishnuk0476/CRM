<?php
// ============================================================
// Contact Messages — Admin delete
// POST /api/contact-messages/delete.php
// Body: { id: string }
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

if (!isset($_SESSION['admin_id'])) jsonResponse(false, null, 'Authentication required', 401);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(false, null, 'Method not allowed', 405);

$input = getInput();
$id    = sanitizeInput($input['id'] ?? '');
if (empty($id)) jsonResponse(false, null, 'ID is required.', 400);

$stmt = $pdo->prepare("SELECT name, subject FROM contact_messages WHERE id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) jsonResponse(false, null, 'Message not found.', 404);

$pdo->prepare("DELETE FROM contact_messages WHERE id = ?")->execute([$id]);

logActivity($pdo, 'deleted', 'contact_message', $id, $row['subject'], [
    'from' => $row['name'],
    'deleted_at' => date('Y-m-d H:i:s'),
]);

jsonResponse(true, null, null, 200);
