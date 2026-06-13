<?php
// ============================================================
// GET /api/admins/list.php
// Super Admin only: List all admin accounts
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

// Only super_admin can list/manage admins
requireRole('super_admin');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

try {
    $stmt = $pdo->query("SELECT id, name AS full_name, email, role, created_at FROM admins ORDER BY created_at DESC");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, $admins);
} catch (Exception $e) {
    jsonResponse(false, null, 'Failed to fetch admin list.', 500);
}
?>
