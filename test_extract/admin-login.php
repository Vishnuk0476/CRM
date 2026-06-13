<?php
// ============================================================
// Admin Login — POST /api/admin-login.php
// Body: { "email": "...", "password": "..." }
// ============================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input    = getInput();
$email    = trim(filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL));
$password = $input['password'] ?? '';
$ip       = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

// ─── CSRF Token Validation ────────────────────────────────────────────────────
$clientCsrf = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
$sessionCsrf = $_SESSION['csrf_token'] ?? '';
if (empty($sessionCsrf) || !hash_equals($sessionCsrf, $clientCsrf)) {
    jsonResponse(false, null, 'Invalid CSRF token. Please refresh the page and try again.', 403);
}

// ─── Validate inputs ──────────────────────────────────────────────────────────
if (empty($email) || empty($password)) {
    jsonResponse(false, null, 'Email and password are required.', 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, null, 'Invalid email format.', 400);
}

// ─── Rate limiting check ─────────────────────────────────────────────────────
$stmt = $pdo->prepare("SELECT attempts, last_attempt FROM login_attempts WHERE ip_address = ? AND email = ?");
$stmt->execute([$ip, $email]);
$attempt = $stmt->fetch();

if ($attempt && $attempt['attempts'] >= 5) {
    $lockExpiry = strtotime($attempt['last_attempt']) + 900; // 15 min lock
    if (time() < $lockExpiry) {
        $remaining = ceil(($lockExpiry - time()) / 60);
        jsonResponse(false, null, "Too many failed attempts. Account locked for {$remaining} more minute(s).", 429);
    } else {
        // Lock expired — clear attempts
        $pdo->prepare("DELETE FROM login_attempts WHERE ip_address = ? AND email = ?")->execute([$ip, $email]);
    }
}

// ─── Lookup admin ────────────────────────────────────────────────────────────
$stmt = $pdo->prepare("SELECT id, name, email, password_hash, role, permissions, is_active FROM admins WHERE email = ?");
$stmt->execute([$email]);
$admin = $stmt->fetch();

if (!$admin) {
    jsonResponse(false, null, 'Invalid email or password.', 401);
}

// ─── Check account status ────────────────────────────────────────────────────
if (isset($admin['is_active']) && $admin['is_active'] == 0) {
    jsonResponse(false, null, 'Your account has been deactivated. Contact your administrator.', 403);
}

// ─── Verify password ─────────────────────────────────────────────────────────
if (!password_verify($password, $admin['password_hash'])) {
    // Record failed attempt
    $pdo->prepare(
        "INSERT INTO login_attempts (ip_address, email, attempts) VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE attempts = attempts + 1, last_attempt = NOW()"
    )->execute([$ip, $email]);
    jsonResponse(false, null, 'Invalid email or password.', 401);
}

// ─── Success — establish session ─────────────────────────────────────────────
session_regenerate_id(true);
$_SESSION['admin_id']    = $admin['id'];
$_SESSION['admin_email'] = $admin['email'];
$_SESSION['admin_name']  = $admin['name'] ?? $admin['email'];
$_SESSION['admin_role']  = $admin['role'];
$perms = $admin['permissions'] ? json_decode($admin['permissions'], true) : [];
$_SESSION['admin_permissions'] = is_array($perms) && !empty($perms) ? $perms : (object)$perms;
$_SESSION['login_time']  = time();
$_SESSION['last_activity'] = time();

// Clear any failed attempts
$pdo->prepare("DELETE FROM login_attempts WHERE ip_address = ? AND email = ?")->execute([$ip, $email]);

// Update last_login
$pdo->prepare("UPDATE admins SET last_login = NOW() WHERE id = ?")->execute([$admin['id']]);

// Log the login
logActivity($pdo, 'ADMIN_LOGIN', 'admin', (string)$admin['id'], $admin['email']);

// Generate a JWT token with 12 hours expiration (43200 seconds)
require_once __DIR__ . '/jwt-auth.php';
$jwtToken = generateJWT([
    'sub' => $admin['id'],
    'email' => $admin['email'],
    'app_metadata' => [
        'role' => $admin['role'],
        'name' => $admin['name'] ?? $admin['email'],
        'permissions' => $perms
    ]
], 43200);

// Set HttpOnly Cookie
setcookie('auth_token', $jwtToken, [
    'expires' => time() + 43200,
    'path' => '/',
    'domain' => $_SERVER['HTTP_HOST'] === 'localhost' ? '' : $_SERVER['HTTP_HOST'],
    'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
    'httponly' => true,
    'samesite' => 'Strict'
]);

jsonResponse(true, [
    'user' => [
        'id'          => $admin['id'],
        'name'        => $admin['name'],
        'email'       => $admin['email'],
        'role'        => $admin['role'],
        'permissions' => $perms,
    ]
]);