<?php
// ============================================================
// File Upload Endpoint ?" POST /api/upload.php
// Handles Image and Video uploads for Admin
// ============================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/admin-guard.php';

// Allow any manager or admin to upload files
requireRole('admin', 'manager', 'super_admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $err = $_FILES['file']['error'] ?? 'Unknown error';
    jsonResponse(false, null, "File upload failed with error code $err", 400);
}

$file = $_FILES['file'];
$fileName = basename($file['name']);
$fileSize = $file['size'];
$tmpName = $file['tmp_name'];

// Detect mime type securely
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $tmpName);
finfo_close($finfo);

// Define allowed mime types and max sizes
$allowedMimes = [
    // Images
    'image/jpeg' => 5 * 1024 * 1024, // 5MB
    'image/png' => 5 * 1024 * 1024,
    'image/webp' => 5 * 1024 * 1024,
    // Videos
    'video/mp4' => 5 * 1024 * 1024, // 5MB
    'video/webm' => 5 * 1024 * 1024,
    // Documents
    'application/pdf' => 5 * 1024 * 1024
];

if (!array_key_exists($mimeType, $allowedMimes)) {
    jsonResponse(false, null, 'Invalid file type. Only JPG, PNG, WEBP, MP4, WEBM, and PDF are allowed.', 400);
}

$maxSize = $allowedMimes[$mimeType];
if ($fileSize > $maxSize) {
    $mbLimit = $maxSize / (1024 * 1024);
    jsonResponse(false, null, "File is too large. Maximum size for this type is {$mbLimit}MB.", 400);
}

// Generate unique filename to prevent overwriting
$ext = pathinfo($fileName, PATHINFO_EXTENSION);
if (empty($ext)) {
    // Guess extension
    $extMap = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'video/mp4' => 'mp4',
        'video/webm' => 'webm',
        'application/pdf' => 'pdf'
    ];
    $ext = $extMap[$mimeType] ?? 'bin';
}

$newFileName = uniqid('upload_', true) . '.' . $ext;
$uploadDir = __DIR__ . '/../../private_uploads/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$targetPath = $uploadDir . $newFileName;

if (!move_uploaded_file($tmpName, $targetPath)) {
    jsonResponse(false, null, 'Failed to move uploaded file.', 500);
}

// Ensure the frontend can access the file via secure proxy
$publicUrl = '/api/file.php?name=' . $newFileName;

try {
    logActivity($pdo, 'upload', 'file', null, $newFileName, ['size' => $fileSize, 'mime' => $mimeType]);
} catch (Exception $e) { /* ignore */ }

jsonResponse(true, [
    'url' => $publicUrl,
    'filename' => $newFileName,
    'mime_type' => $mimeType,
    'size' => $fileSize
], 'File uploaded successfully.');
?>
