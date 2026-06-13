<?php
// ============================================================
// POST /api/consignments/save-lr.php
// Admin: Save a base64-encoded LR PDF to the server
// and record the file path on the consignment row
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input = getInput();
$id     = trim($input['id']         ?? '');
$pdf_b64= trim($input['pdf_base64'] ?? '');  // data:application/pdf;base64,...

if (empty($id) || empty($pdf_b64)) {
    jsonResponse(false, null, 'id and pdf_base64 are required.', 400);
}

// Verify consignment exists
$row = $pdo->prepare("SELECT id, lr_number FROM consignments WHERE id = :id LIMIT 1");
$row->execute([':id' => $id]);
$c = $row->fetch();
if (!$c) {
    jsonResponse(false, null, 'Consignment not found.', 404);
}

// Decode base64
$pdfData = $pdf_b64;
if (strpos($pdfData, 'base64,') !== false) {
    $pdfData = substr($pdfData, strpos($pdfData, 'base64,') + 7);
}
$binary = base64_decode($pdfData, true);
if ($binary === false || strlen($binary) < 100) {
    jsonResponse(false, null, 'Invalid PDF data.', 400);
}
// Validate PDF magic bytes to prevent polyglot file uploads
if (substr($binary, 0, 5) !== '%PDF-') {
    jsonResponse(false, null, 'Uploaded file is not a valid PDF.', 400);
}

// Save to uploads/lr/
$uploadsDir = __DIR__ . '/../../uploads/lr';
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

$safeNum  = preg_replace('/[^A-Za-z0-9]/', '', $c['lr_number'] ?? $id);
$filename = 'LR_' . $safeNum . '.pdf';
$filePath = $uploadsDir . '/' . $filename;
$webPath  = '/uploads/lr/' . $filename;

if (file_put_contents($filePath, $binary) === false) {
    jsonResponse(false, null, 'Failed to save PDF file.', 500);
}

// Store path in DB (add column if needed via upgrade_v4.sql)
$pdo->prepare("UPDATE consignments SET lr_pdf_path = :path WHERE id = :id")
    ->execute([':path' => $webPath, ':id' => $id]);

jsonResponse(true, [
    'path'         => $webPath,
    'download_url' => 'https://panyaglobal.in' . $webPath,
    'filename'     => $filename,
]);
?>
