<?php
// ============================================================
// CRM Users API (Team Management)
// GET /api/crm/users.php  POST  PUT  DELETE
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];

// Ensure only super_admin or owner can manage users
$currentRole = $_SESSION['admin_role'] ?? '';
if (!in_array($currentRole, ['super_admin', 'owner'])) {
    if ($method !== 'GET') { // Everyone can list users (for dropdowns)
        jsonResponse(false, null, 'Forbidden: You do not have permission to manage team members.', 403);
    }
}

// Helper to check if a user is trying to create/edit an admin role
function isTryingToManageAdmin($role) {
    return in_array($role, ['super_admin', 'owner', 'admin']);
}

if ($method === 'GET') {
    $userEmail = $_SESSION['admin_email'] ?? '';
    $whereClause = ($userEmail === 'cartoonfunonly@gmail.com') ? "" : "WHERE role != 'super_admin'";
    $stmt = $pdo->query("SELECT id, name, email, role, permissions, is_active, created_at, avatar FROM admins $whereClause ORDER BY name ASC");
    $users = $stmt->fetchAll();
    
    // Decode permissions JSON - ensure empty becomes object not array
    foreach ($users as &$u) {
        $decoded = $u['permissions'] ? json_decode($u['permissions'], true) : [];
        $u['permissions'] = is_array($decoded) && !empty($decoded) ? $decoded : (object)$decoded;
    }
    jsonResponse(true, ['users' => $users]);
}

if ($method === 'POST') {
    $input = getInput();
    $name = sanitizeInput($input['name'] ?? '', 'string');
    $email = sanitizeInput($input['email'] ?? '', 'email');
    $role = sanitizeInput($input['role'] ?? 'staff', 'string');
    $password = $input['password'] ?? 'Panya@2026';
    $permissions = isset($input['permissions']) && (is_array($input['permissions']) || is_object($input['permissions'])) ? json_encode($input['permissions']) : json_encode([]);
    $avatar = sanitizeInput($input['avatar'] ?? '', 'string');

    if (isTryingToManageAdmin($role) && !in_array($currentRole, ['super_admin', 'owner'])) {
        jsonResponse(false, null, 'Forbidden: Only a Super Admin can create admin roles.', 403);
    }

    if (empty($name) || empty($email)) {
        jsonResponse(false, null, 'Name and email are required.', 400);
    }

    try {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO admins (name, email, password_hash, role, permissions, avatar) VALUES (:n, :e, :h, :r, :p, :a)");
        $stmt->execute([':n' => $name, ':e' => $email, ':h' => $hash, ':r' => $role, ':p' => $permissions, ':a' => $avatar]);
        jsonResponse(true, ['id' => $pdo->lastInsertId(), 'message' => 'User created successfully']);
    } catch (PDOException $e) {
        $pdo->rollBack();
        if ($e->getCode() == 23000) { // Integrity constraint violation (duplicate email)
            jsonResponse(false, null, 'Email address is already in use by another user.', 409);
        }
        error_log('[Database Error] ' . $e->getMessage());
        $errMsg = (defined('APP_DEBUG') && APP_DEBUG) ? 'Database error: ' . $e->getMessage() : 'A database error occurred. Please try again.';
        jsonResponse(false, null, $errMsg, 500);
    }
}

if ($method === 'PUT') {
    $input = getInput();
    $id = (int)($input['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'User ID required', 400);

    $fields = [];
    $params = [':id' => $id];

    if (isset($input['name'])) { $fields[] = "name = :n"; $params[':n'] = sanitizeInput($input['name'], 'string'); }
    if (isset($input['email'])) { $fields[] = "email = :e"; $params[':e'] = sanitizeInput($input['email'], 'email'); }
    if (isset($input['avatar'])) { $fields[] = "avatar = :a"; $params[':a'] = sanitizeInput($input['avatar'], 'string'); }
    if (isset($input['role'])) { 
        $targetRole = sanitizeInput($input['role'], 'string');
        // Prevent non-super-admins from assigning admin roles
        if (isTryingToManageAdmin($targetRole) && !in_array($currentRole, ['super_admin', 'owner'])) {
             jsonResponse(false, null, 'Forbidden: Only a Super Admin can assign admin roles.', 403);
        }
        $fields[] = "role = :r"; 
        $params[':r'] = $targetRole; 
    }
    if (isset($input['is_active'])) {
        $fields[] = "is_active = :ia";
        $params[':ia'] = $input['is_active'] ? 1 : 0;
    }
    if (isset($input['permissions']) && (is_array($input['permissions']) || is_object($input['permissions']))) {
        $fields[] = "permissions = :perms";
        $params[':perms'] = json_encode($input['permissions']);
    }
    if (!empty($input['password'])) { 
        $fields[] = "password_hash = :p"; 
        $params[':p'] = password_hash($input['password'], PASSWORD_DEFAULT); 
    }

    if (empty($fields)) jsonResponse(false, null, 'No fields to update', 400);

    $sql = "UPDATE admins SET " . implode(', ', $fields) . " WHERE id = :id";
    $pdo->prepare($sql)->execute($params);
    jsonResponse(true, ['message' => 'User updated successfully']);
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if (!$id) jsonResponse(false, null, 'User ID required', 400);
    
    // Prevent self-deletion
    if ($id == ($_SESSION['admin_id'] ?? 0)) {
        jsonResponse(false, null, 'You cannot delete yourself.', 400);
    }

    $pdo->prepare("DELETE FROM admins WHERE id = :id")->execute([':id' => $id]);
    jsonResponse(true, ['message' => 'User deleted successfully']);
}

jsonResponse(false, null, 'Method not allowed', 405);
