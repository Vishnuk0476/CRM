<?php
// ============================================================
// Admin Logout — POST /api/admin-logout.php
// ============================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

// Log before destroying session
if (isset($_SESSION['admin_id'])) {
    logActivity($pdo, 'ADMIN_LOGOUT', 'admin', (string)$_SESSION['admin_id'], $_SESSION['admin_email'] ?? '');
}

$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(), '', time() - 42000,
        $params['path'], $params['domain'],
        $params['secure'], $params['httponly']
    );
}

// Clear auth_token cookie
setcookie('auth_token', '', [
    'expires' => time() - 3600,
    'path' => '/',
    'domain' => $_SERVER['HTTP_HOST'] === 'localhost' ? '' : $_SERVER['HTTP_HOST'],
    'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
    'httponly' => true,
    'samesite' => 'Strict'
]);

session_destroy();

jsonResponse(true, ['message' => 'Logged out successfully']);
