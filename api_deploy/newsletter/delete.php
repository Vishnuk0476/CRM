<?php
// ============================================================
// Newsletter — Admin delete subscriber
// POST /api/newsletter/delete.php  { id }
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

requireRole('admin', 'super_admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(false, null, 'Method not allowed', 405);

$input = getInput();
$id = $input['id'] ?? null;

if (empty($id)) jsonResponse(false, null, 'Subscriber ID required.', 400);

$stmt = $pdo->prepare("DELETE FROM newsletter_subscribers WHERE id = :id");
$stmt->execute([':id' => $id]);

if ($stmt->rowCount() === 0) jsonResponse(false, null, 'Subscriber not found.', 404);

jsonResponse(true, ['message' => 'Subscriber deleted.']);
