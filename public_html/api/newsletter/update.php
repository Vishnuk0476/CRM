<?php
// ============================================================
// Newsletter — Admin update subscriber
// POST /api/newsletter/update.php  { id, is_active }
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(false, null, 'Method not allowed', 405);

$input = getInput();
$id       = $input['id'] ?? null;
$isActive = isset($input['is_active']) ? (int)(bool)$input['is_active'] : null;

if (empty($id)) jsonResponse(false, null, 'Subscriber ID required.', 400);
if ($isActive === null) jsonResponse(false, null, 'is_active field required.', 400);

$stmt = $pdo->prepare("UPDATE newsletter_subscribers SET is_active = :active WHERE id = :id");
$stmt->execute([':active' => $isActive, ':id' => $id]);

if ($stmt->rowCount() === 0) jsonResponse(false, null, 'Subscriber not found.', 404);

jsonResponse(true, ['message' => 'Subscriber updated.']);
