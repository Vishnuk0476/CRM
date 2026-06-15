<?php
// ============================================================
// Admin Guard — Include at top of ALL admin-only endpoints
// ============================================================

// JWT middleware must be loaded first so it can populate $_SESSION
// before config.php / helpers.php run any session-dependent logic.
require_once __DIR__ . '/jwt-auth.php';

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

// Session is already started by config.php (or jwt-auth.php as fallback)

// ─── Authentication check — PHP session OR valid JWT ──────────────────────────
//
// Priority:
//   1. Existing PHP session (admin logged in via admin-login.php)
//   2. Supabase JWT Bearer token (SPA / API client requests)
//
// If neither path succeeds, return 401 immediately.
if (!isset($_SESSION['admin_id'])) {
    // Attempt JWT authentication as fallback
    if (!authenticateJWT()) {
        jsonResponse(false, null, 'Authentication required', 401);
    }
    // authenticateJWT() returned true → $_SESSION is now populated; continue.
}

// ─── Absolute session timeout (8 hours from login) ───────────────────────────
if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > 28800) {
    session_destroy();
    setcookie('auth_token', '', time() - 3600, '/');
    jsonResponse(false, null, 'Session expired. Please log in again.', 401);
}

// ─── Idle timeout (30 minutes of inactivity) ─────────────────────────────────
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > 1800) {
    session_destroy();
    setcookie('auth_token', '', time() - 3600, '/');
    jsonResponse(false, null, 'Session timed out due to inactivity. Please log in again.', 401);
}
$_SESSION['last_activity'] = time();

// ─── Role-based access helper function ───────────────────────────────────────
function requireRole(string ...$roles): void {
    $current = $_SESSION['admin_role'] ?? '';
    // super_admin and owner always have access
    if ($current === 'super_admin' || $current === 'owner') return;
    if (!in_array($current, $roles, true)) {
        \jsonResponse(false, null, 'Insufficient permissions for this action.', 403);
    }
}

// ─── Permission-based access helper function ─────────────────────────────────
function requirePermission(string ...$requiredPermissions): void {
    $currentRole = $_SESSION['admin_role'] ?? '';
    // super_admin and owner always have access
    if ($currentRole === 'super_admin' || $currentRole === 'owner') return;
    
    // Get user's explicit permissions from session
    $userPermissions = $_SESSION['admin_permissions'] ?? [];
    if (is_object($userPermissions)) {
        $userPermissions = (array)$userPermissions;
    } elseif (!is_array($userPermissions)) {
        $userPermissions = [];
    }
    
    // Check if user has any of the required permissions
    foreach ($requiredPermissions as $perm) {
        if (in_array($perm, $userPermissions, true)) {
            return; // User has at least one required permission
        }
    }
    
    \jsonResponse(false, null, 'You do not have permission to access this module.', 403);
}

// ─── Get user permissions from session ─────────────────────────────────────
function getUserPermissions(): array {
    $currentRole = $_SESSION['admin_role'] ?? '';
    if ($currentRole === 'super_admin' || $currentRole === 'owner') {
        return ['pipeline', 'leads', 'cases', 'surveys', 'follow-ups', 'invoices', 'payments', 'expenses', 'gst-report', 'orders', 'fleet', 'team-tasks', 'users', 'vendors', 'properties', 'social', 'attendance', 'reports', 'settings'];
    }
    return $_SESSION['admin_permissions'] ?? [];
}

// ─── Check if user has permission (returns boolean) ─────────────────────────
function hasPermission(string $permission): bool {
    $currentRole = $_SESSION['admin_role'] ?? '';
    if ($currentRole === 'super_admin' || $currentRole === 'owner') return true;
    
    $userPermissions = $_SESSION['admin_permissions'] ?? [];
    if (is_object($userPermissions)) {
        $userPermissions = (array)$userPermissions;
    } elseif (!is_array($userPermissions)) {
        $userPermissions = [];
    }
    
    return in_array($permission, $userPermissions, true);
}

// Close session write to allow concurrent API requests
session_write_close();