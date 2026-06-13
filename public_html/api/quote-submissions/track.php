<?php
// ============================================================
// Quote Submissions — Public track
// GET /api/quote-submissions/track.php?ref=PG20241230-abc12345
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

$ref = trim($_GET['ref'] ?? '');
if (empty($ref)) jsonResponse(false, null, 'Reference number required.', 400);

$stmt = $pdo->prepare("SELECT id, reference_number, name, email, phone, service_type, property_type, from_address, to_address, move_date, rooms, status, status_message, created_at, updated_at FROM quote_submissions WHERE reference_number = ?");
$stmt->execute([$ref]);
$row = $stmt->fetch();

if (!$row) jsonResponse(false, null, 'Quote not found. Please check the reference number.', 404);

jsonResponse(true, ['quote' => $row]);
