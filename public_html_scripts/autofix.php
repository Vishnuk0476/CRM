<?php
// ============================================================
// AUTO FIX SCRIPT v2 — Panya Global CRM
// Upload to: /public_html/api/autofix.php
// Open in browser ONCE, then DELETE immediately!
// ============================================================
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config.php';

$results = [];
$errors = [];

function run_sql($pdo, $label, $sql) {
    global $results, $errors;
    try {
        $pdo->exec($sql);
        $results[] = "✅ " . $label;
    } catch (PDOException $e) {
        // Ignore "already exists" type errors
        if (strpos($e->getMessage(), 'Duplicate') !== false || 
            strpos($e->getMessage(), 'already exists') !== false) {
            $results[] = "⏭️ " . $label . " (already exists - OK)";
        } else {
            $errors[] = "❌ " . $label . " → " . $e->getMessage();
        }
    }
}

function add_column_if_missing($pdo, $table, $column, $definition) {
    global $results, $errors;
    try {
        $cols = $pdo->query("SHOW COLUMNS FROM `$table` LIKE '$column'")->fetchAll();
        if (count($cols) == 0) {
            $pdo->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
            $results[] = "✅ Added column: $column to $table";
        } else {
            $results[] = "⏭️ Column $column already exists in $table";
        }
    } catch (PDOException $e) {
        $errors[] = "❌ Failed adding column $column to $table → " . $e->getMessage();
    }
}

// ── FIX 1: Create login_attempts table ──────────────────────
run_sql($pdo, "Create login_attempts table", "
CREATE TABLE IF NOT EXISTS login_attempts (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    ip_address   VARCHAR(45) NOT NULL,
    email        VARCHAR(150) NOT NULL,
    attempts     INT NOT NULL DEFAULT 1,
    last_attempt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_ip_email (ip_address, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// ── FIX 2, 3, 4: Add columns to admins safely ───────────────
add_column_if_missing($pdo, 'admins', 'last_login', 'TIMESTAMP NULL DEFAULT NULL');
add_column_if_missing($pdo, 'admins', 'last_activity', 'TIMESTAMP NULL DEFAULT NULL');
add_column_if_missing($pdo, 'admins', 'password_hash', "VARCHAR(255) NOT NULL DEFAULT ''");

// ── FIX 5: Reset admin password ────────────────────────────
$email   = 'panya-admin@panyaglobal.in';
$newPass = 'Admin@PanyaGlobal2026';
$hash    = password_hash($newPass, PASSWORD_BCRYPT, ['cost' => 10]);

try {
    // Check if admin exists
    $stmt = $pdo->prepare("SELECT id, email FROM admins WHERE email = ?");
    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    if ($admin) {
        // Update password hash
        $pdo->prepare("UPDATE admins SET password_hash = ?, is_active = 1 WHERE email = ?")
            ->execute([$hash, $email]);
        $results[] = "✅ Password reset for: $email";
    } else {
        // Insert new super admin
        $pdo->prepare("
            INSERT INTO admins (name, email, password_hash, role, permissions, is_active)
            VALUES ('Panya Admin', ?, ?, 'super_admin', ?, 1)
        ")->execute([
            $email,
            $hash,
            json_encode([
                "dashboard"=>"execute","consignments"=>"execute","quotes"=>"execute",
                "inquiries"=>"execute","testimonials"=>"execute","blog"=>"execute",
                "newsletter"=>"execute","brochures"=>"execute","logs"=>"execute",
                "users"=>"execute","analytics"=>"execute","pipeline"=>"execute",
                "leads"=>"execute","orders"=>"execute","invoices"=>"execute",
                "payments"=>"execute","expenses"=>"execute","followups"=>"execute",
                "tasks"=>"execute","fleet"=>"execute","packing"=>"execute",
                "calllogs"=>"execute","gst"=>"execute"
            ])
        ]);
        $results[] = "✅ New super admin created: $email";
    }
} catch (PDOException $e) {
    $errors[] = "❌ Password fix failed → " . $e->getMessage();
}

// ── FIX 6: Create activity_logs table if missing ────────────
run_sql($pdo, "Create activity_logs table", "
CREATE TABLE IF NOT EXISTS activity_logs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    admin_id    INT DEFAULT NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) DEFAULT NULL,
    entity_id   VARCHAR(50) DEFAULT NULL,
    ip_address  VARCHAR(45) DEFAULT NULL,
    details     JSON DEFAULT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// ── OUTPUT ──────────────────────────────────────────────────
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Panya CRM Auto Fix</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
  .card { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  h2 { color: #1B3A6B; }
  .success { color: #16a34a; margin: 5px 0; }
  .error { color: #dc2626; margin: 5px 0; background: #fee2e2; padding: 8px; border-radius: 5px; }
  .login-box { background: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; margin-top: 20px; }
  .warn { background: #fef3c7; border: 2px solid #d97706; border-radius: 8px; padding: 15px; margin-top: 15px; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  td, th { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
  th { background: #1B3A6B; color: white; }
</style>
</head>
<body>
<div class="card">
  <h2>🔧 Panya CRM — Auto Fix Results</h2>
  
  <?php if (empty($errors)): ?>
    <h3 style="color:green;">All fixes applied successfully! ✅</h3>
  <?php else: ?>
    <h3 style="color:orange;">Completed with some issues:</h3>
    <?php foreach ($errors as $e): ?>
      <p class="error"><?= htmlspecialchars($e) ?></p>
    <?php endforeach; ?>
  <?php endif; ?>

  <h3>Steps completed:</h3>
  <?php foreach ($results as $r): ?>
    <p class="<?= strpos($r, '✅') !== false ? 'success' : '' ?>"><?= htmlspecialchars($r) ?></p>
  <?php endforeach; ?>

  <div class="login-box">
    <h3>🔑 Admin Login Credentials:</h3>
    <table>
      <tr><th>Field</th><th>Value</th></tr>
      <tr><td>URL</td><td><a href="https://crm-demo-vishnu.netlify.app/admin/login" target="_blank">crm-demo-vishnu.netlify.app/admin/login</a></td></tr>
      <tr><td>Email</td><td><strong>panya-admin@panyaglobal.in</strong></td></tr>
      <tr><td>Password</td><td><strong>Admin@PanyaGlobal2026</strong></td></tr>
    </table>
  </div>

  <div class="warn">
    ⚠️ SECURITY: DELETE this file (autofix.php) from cPanel File Manager immediately after use!<br>
    Path: public_html/api/autofix.php
  </div>
</div>
</body>
</html>
