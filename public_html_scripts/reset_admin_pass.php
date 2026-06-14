<?php
// =============================================================
// TEMPORARY PASSWORD RESET SCRIPT
// Upload to: your_cpanel_domain/api/reset_admin_pass.php
// Run ONCE in browser, then DELETE this file immediately!
// =============================================================

// Load config (database connection)
require_once __DIR__ . '/config.php';

$email    = 'panya-admin@panyaglobal.in';
$newPass  = 'Admin@PanyaGlobal2026';

// Generate fresh bcrypt hash
$hash = password_hash($newPass, PASSWORD_BCRYPT, ['cost' => 10]);

// Try updating both possible column names (password_hash OR password)
$updated = false;
$errors  = [];

// Check which column exists
$cols = $pdo->query("SHOW COLUMNS FROM admins LIKE 'password_hash'")->fetchAll();
$col  = count($cols) ? 'password_hash' : 'password';

$stmt = $pdo->prepare("UPDATE admins SET `{$col}` = ? WHERE email = ?");
$stmt->execute([$hash, $email]);
$rows = $stmt->rowCount();

if ($rows > 0) {
    echo "<h2 style='color:green;'>✅ Password reset successfully!</h2>";
    echo "<p>Email: <b>{$email}</b></p>";
    echo "<p>New Password: <b>{$newPass}</b></p>";
    echo "<p>Column updated: <b>{$col}</b></p>";
    echo "<hr><p style='color:red;'><b>⚠️ IMPORTANT: Delete this file from cPanel immediately after use!</b></p>";
} else {
    echo "<h2 style='color:orange;'>⚠️ No rows updated — checking email...</h2>";
    
    // Show what emails exist
    $admins = $pdo->query("SELECT id, name, email, `{$col}` FROM admins ORDER BY id")->fetchAll();
    echo "<h3>Existing admins in table:</h3><table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Has Password</th></tr>";
    foreach ($admins as $a) {
        echo "<tr><td>{$a['id']}</td><td>{$a['name']}</td><td>{$a['email']}</td><td>" . (!empty($a[$col]) ? '✅ Yes' : '❌ Empty') . "</td></tr>";
    }
    echo "</table>";
    echo "<br><p>Try running the UPDATE below in phpMyAdmin for your exact email:</p>";
    echo "<pre>UPDATE admins SET `{$col}` = '" . htmlspecialchars($hash) . "' WHERE email = 'YOUR_EMAIL_HERE';</pre>";
}
?>
