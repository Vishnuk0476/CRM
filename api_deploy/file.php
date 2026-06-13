<?php
// ============================================================
// Secure File Server — GET /api/file.php?name=filename.ext
// ============================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt-auth.php';

// Requires authentication (either via HttpOnly Cookie or Bearer)
if (!authenticateJWT()) {
    http_response_code(401);
    die('Unauthorized access.');
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    die('Method not allowed.');
}

$filename = $_GET['name'] ?? '';
if (empty($filename) || preg_match('/[^a-zA-Z0-9_\-\.]/', $filename)) {
    http_response_code(400);
    die('Invalid filename.');
}

$filepath = __DIR__ . '/../../private_uploads/' . $filename;

if (!file_exists($filepath)) {
    http_response_code(404);
    die('File not found.');
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $filepath);
finfo_close($finfo);

header('Content-Type: ' . $mimeType);
header('Content-Length: ' . filesize($filepath));
header('Cache-Control: private, max-age=86400'); // Cache for 24 hours privately

readfile($filepath);
exit;
?>
