<?php
// ============================================================
// POST /api/admins/update.php
// Super Admin only: Create, update role, or delete admin accounts
// Actions: create | update_role | delete
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

// ONLY super_admin can manage admin accounts
requireRole('super_admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input = getInput();
$action = sanitizeInput($input['action'] ?? 'update_role');

$validRoles = ['super_admin', 'admin', 'staff', 'owner', 'manager', 'salesperson', 'operations', 'accountant', 'digital_marketing'];

try {
    // ─── CREATE NEW ADMIN ──────────────────────────────────────
    if ($action === 'create') {
        $name     = sanitizeInput($input['name'] ?? '');
        $email    = sanitizeInput($input['email'] ?? '', 'email');
        $password = $input['password'] ?? '';
        $role     = sanitizeInput($input['role'] ?? 'staff');

        if (empty($name) || !$email || empty($password)) {
            jsonResponse(false, null, 'Name, valid email, and password are required.', 400);
        }
        if (strlen($password) < 8) {
            jsonResponse(false, null, 'Password must be at least 8 characters.', 400);
        }
        if (!in_array($role, $validRoles)) {
            jsonResponse(false, null, 'Invalid role provided.', 400);
        }

        // Check if email already exists
        $check = $pdo->prepare("SELECT id FROM admins WHERE email = :email LIMIT 1");
        $check->execute([':email' => $email]);
        if ($check->fetch()) {
            jsonResponse(false, null, 'An admin with this email already exists.', 409);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $pdo->prepare("INSERT INTO admins (name, email, password_hash, role) VALUES (:name, :email, :hash, :role)");
        $stmt->execute([
            ':name'  => $name,
            ':email' => $email,
            ':hash'  => $hash,
            ':role'  => $role,
        ]);

        logActivity($pdo, 'Admin Created', 'admin', $pdo->lastInsertId(), "Created admin: $email with role: $role");

        jsonResponse(true, ['message' => "Admin account created for $email."]);
    }

    // ─── UPDATE ROLE ───────────────────────────────────────────
    elseif ($action === 'update_role') {
        $id   = sanitizeInput($input['id'] ?? '');
        $role = sanitizeInput($input['role'] ?? '');

        if (empty($id) || empty($role)) {
            jsonResponse(false, null, 'Admin ID and role are required.', 400);
        }
        if (!in_array($role, $validRoles)) {
            jsonResponse(false, null, 'Invalid role provided.', 400);
        }

        // Prevent modifying own account role
        if ((string)$id === (string)$_SESSION['admin_id']) {
            jsonResponse(false, null, 'You cannot change your own role.', 403);
        }

        // Verify target exists to protect main super admin
        $check = $pdo->prepare("SELECT email FROM admins WHERE id = :id LIMIT 1");
        $check->execute([':id' => $id]);
        $target = $check->fetch();
        if ($target && $target['email'] === 'cartoonfunonly@gmail.com' && $role !== 'super_admin') {
            jsonResponse(false, null, 'The main Super Admin role cannot be downgraded.', 403);
        }

        $stmt = $pdo->prepare("UPDATE admins SET role = :role WHERE id = :id");
        $stmt->execute([':role' => $role, ':id' => $id]);

        logActivity($pdo, 'Role Updated', 'admin', (string)$id, "Role set to $role");

        jsonResponse(true, ['message' => 'Admin role updated successfully.']);
    }

    // ─── DELETE ADMIN ──────────────────────────────────────────
    elseif ($action === 'delete') {
        $id = sanitizeInput($input['id'] ?? '');

        if (empty($id)) {
            jsonResponse(false, null, 'Admin ID is required.', 400);
        }

        // Prevent self-deletion
        if ((string)$id === (string)$_SESSION['admin_id']) {
            jsonResponse(false, null, 'You cannot delete your own account.', 403);
        }

        // Verify target exists
        $check = $pdo->prepare("SELECT email, role FROM admins WHERE id = :id LIMIT 1");
        $check->execute([':id' => $id]);
        $target = $check->fetch();
        if (!$target) {
            jsonResponse(false, null, 'Admin not found.', 404);
        }

        if ($target['email'] === 'cartoonfunonly@gmail.com') {
            jsonResponse(false, null, 'The main Super Admin cannot be deleted.', 403);
        }

        $pdo->prepare("DELETE FROM admins WHERE id = :id")->execute([':id' => $id]);

        logActivity($pdo, 'Admin Deleted', 'admin', (string)$id, "Deleted admin: {$target['email']}");

        jsonResponse(true, ['message' => "Admin {$target['email']} deleted."]);
    }

    // ─── RESET PASSWORD ────────────────────────────────────
    elseif ($action === 'reset_password') {
        $id       = sanitizeInput($input['id'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($id) || empty($password)) {
            jsonResponse(false, null, 'Admin ID and new password are required.', 400);
        }
        if (strlen($password) < 8) {
            jsonResponse(false, null, 'Password must be at least 8 characters.', 400);
        }

        // Verify target exists
        $check = $pdo->prepare("SELECT email FROM admins WHERE id = :id LIMIT 1");
        $check->execute([':id' => $id]);
        $target = $check->fetch();
        if (!$target) {
            jsonResponse(false, null, 'Admin not found.', 404);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $pdo->prepare("UPDATE admins SET password_hash = :hash WHERE id = :id")->execute([':hash' => $hash, ':id' => $id]);

        logActivity($pdo, 'Password Reset', 'admin', (string)$id, "Password reset for: {$target['email']}");

        jsonResponse(true, ['message' => "Password updated for {$target['email']}."]);
    }

    // ─── UPDATE PERMISSIONS ──────────────────────────────────
    elseif ($action === 'update_permissions') {
        $id          = sanitizeInput($input['id'] ?? '');
        $permissions = $input['permissions'] ?? [];

        if (empty($id)) {
            jsonResponse(false, null, 'Admin ID is required.', 400);
        }

        // Verify target exists
        $check = $pdo->prepare("SELECT email FROM admins WHERE id = :id LIMIT 1");
        $check->execute([':id' => $id]);
        $target = $check->fetch();
        if (!$target) {
            jsonResponse(false, null, 'Admin not found.', 404);
        }

        $permsJson = json_encode($permissions);
        $pdo->prepare("UPDATE admins SET permissions = :perms WHERE id = :id")->execute([':perms' => $permsJson, ':id' => $id]);

        logActivity($pdo, 'Permissions Updated', 'admin', (string)$id, "Permissions updated for: {$target['email']}");

        jsonResponse(true, ['message' => "Permissions updated for {$target['email']}."]);
    }

    else {
        jsonResponse(false, null, 'Invalid action. Allowed: create, update_role, delete, reset_password.', 400);
    }

} catch (Exception $e) {
    jsonResponse(false, null, 'Operation failed.', 500);
}
?>
