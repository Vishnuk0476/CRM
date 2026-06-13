<?php
// ============================================================
// Admin Check — GET /api/admin-check.php
// Returns current session user info
// ============================================================
require_once __DIR__ . '/admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

// Refresh from database to ensure admin still exists
$stmt = $pdo->prepare("SELECT id, name, email, role, permissions, last_login FROM admins WHERE id = ?");
$stmt->execute([$_SESSION['admin_id']]);
$admin = $stmt->fetch();

if (!$admin) {
    session_destroy();
    jsonResponse(false, null, 'Admin account not found', 401);
}

// Update session with latest permissions from database
$perms = $admin['permissions'] ? json_decode($admin['permissions'], true) : [];
$permissions = is_array($perms) && !empty($perms) ? $perms : (object)$perms;
$_SESSION['admin_permissions'] = $permissions;

jsonResponse(true, [
    'user' => [
        'id'          => $admin['id'],
        'name'        => $admin['name'],
        'email'       => $admin['email'],
        'role'        => $admin['role'],
        'permissions' => $permissions,
        'last_login'  => $admin['last_login'],
    ]
]);