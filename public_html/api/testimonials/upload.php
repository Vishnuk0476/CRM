<?php
// ============================================================
// Testimonials — File upload (avatar, photos, videos)
// POST /api/testimonials/upload.php
// Accepts multipart/form-data with files[]
// Max 100MB per file, images (jpg/png/webp/gif) + videos (mp4/webm/mov)
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

// Rate limit uploads
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
rateLimit($pdo, 'testimonial_upload:' . $ip, 10, 300);

$uploadDir = __DIR__ . '/../../uploads/testimonials/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
$allowedTypes = array_merge($allowedImageTypes, $allowedVideoTypes);
$maxFileSize = 100 * 1024 * 1024; // 100MB

$uploadType = $_POST['type'] ?? 'media'; // 'avatar' or 'media'

$uploadedUrls = [];

// Handle single avatar upload
if ($uploadType === 'avatar' && isset($_FILES['avatar'])) {
    $file = $_FILES['avatar'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        jsonResponse(false, null, 'Upload error: ' . $file['error'], 400);
    }

    $mime = mime_content_type($file['tmp_name']);
    if (!in_array($mime, $allowedImageTypes)) {
        jsonResponse(false, null, 'Avatar must be an image (JPG, PNG, WebP, GIF).', 400);
    }

    if ($file['size'] > 5 * 1024 * 1024) { // 5MB for avatar
        jsonResponse(false, null, 'Avatar must be under 5MB.', 400);
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
    $filename = 'avatar_' . bin2hex(random_bytes(8)) . '_' . time() . '.' . $ext;
    $destPath = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        jsonResponse(false, null, 'Failed to save avatar.', 500);
    }

    $uploadedUrls[] = '/uploads/testimonials/' . $filename;

    jsonResponse(true, [
        'avatar_url' => '/uploads/testimonials/' . $filename,
    ]);
}

// Handle multiple media uploads (photos + videos)
if (!isset($_FILES['files'])) {
    jsonResponse(false, null, 'No files uploaded.', 400);
}

$files = $_FILES['files'];
$fileCount = is_array($files['name']) ? count($files['name']) : 1;

if ($fileCount > 10) {
    jsonResponse(false, null, 'Maximum 10 files allowed per upload.', 400);
}

$errors = [];

for ($i = 0; $i < $fileCount; $i++) {
    $name     = is_array($files['name'])     ? $files['name'][$i]     : $files['name'];
    $tmpName  = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
    $error    = is_array($files['error'])    ? $files['error'][$i]    : $files['error'];
    $size     = is_array($files['size'])     ? $files['size'][$i]     : $files['size'];

    if ($error !== UPLOAD_ERR_OK) {
        $errors[] = "{$name}: Upload error ({$error})";
        continue;
    }

    if ($size > $maxFileSize) {
        $errors[] = "{$name}: File too large (max 100MB)";
        continue;
    }

    $mime = mime_content_type($tmpName);
    if (!in_array($mime, $allowedTypes)) {
        $errors[] = "{$name}: Unsupported file type ({$mime})";
        continue;
    }

    $isVideo = in_array($mime, $allowedVideoTypes);
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION)) ?: ($isVideo ? 'mp4' : 'jpg');
    $prefix = $isVideo ? 'vid_' : 'img_';
    $filename = $prefix . bin2hex(random_bytes(8)) . '_' . time() . '.' . $ext;
    $destPath = $uploadDir . $filename;

    if (!move_uploaded_file($tmpName, $destPath)) {
        $errors[] = "{$name}: Failed to save";
        continue;
    }

    $uploadedUrls[] = [
        'url'  => '/uploads/testimonials/' . $filename,
        'type' => $isVideo ? 'video' : 'image',
        'name' => $name,
        'size' => $size,
    ];
}

jsonResponse(true, [
    'files'  => $uploadedUrls,
    'errors' => $errors,
]);
