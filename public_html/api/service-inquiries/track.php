<?php
// ============================================================
// Service Inquiries — Public track
// GET /api/service-inquiries/track.php?ref=SI20250101-abc12345
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

$ref = trim($_GET['ref'] ?? '');
if (empty($ref)) jsonResponse(false, null, 'Reference number required.', 400);

$stmt = $pdo->prepare("SELECT id, reference_number, service_name, service_type, name, status, status_message, form_data, created_at, updated_at FROM service_inquiries WHERE reference_number = ?");
$stmt->execute([$ref]);
$row = $stmt->fetch();

if (!$row) jsonResponse(false, null, 'Inquiry not found. Please check the reference number.', 404);

$row['form_data'] = json_decode($row['form_data'] ?? '{}', true) ?: [];

jsonResponse(true, ['inquiry' => $row]);
