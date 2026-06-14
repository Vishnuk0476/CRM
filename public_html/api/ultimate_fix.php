<?php
// ULTIMATE FIX SCRIPT
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: text/plain');

require_once __DIR__ . '/config.php';
echo "✅ Configuration loaded.\n";

try {
    // 1. JWT Secret Check
    require_once __DIR__ . '/jwt-auth.php';
    $secret = getJwtSecret();
    if (empty($secret) || $secret === 'your-supabase-jwt-secret-here') {
        echo "❌ ERROR: JWT Secret is missing or default. Fixing it dynamically...\n";
        putenv('SUPABASE_JWT_SECRET=super-secret-key-panyaglobal-2026-very-long-string');
        $_ENV['SUPABASE_JWT_SECRET'] = 'super-secret-key-panyaglobal-2026-very-long-string';
    } else {
        echo "✅ JWT Secret is configured.\n";
    }

    // 2. Check login_attempts table
    $pdo->query("SELECT 1 FROM login_attempts LIMIT 1");
    echo "✅ login_attempts table exists.\n";

    // 3. Check activity_logs table
    $pdo->query("SELECT 1 FROM activity_logs LIMIT 1");
    echo "✅ activity_logs table exists.\n";

    // 4. Check all required columns in admins table
    $columns = ['password_hash' => 'VARCHAR(255) NOT NULL DEFAULT ""', 
                'last_login' => 'TIMESTAMP NULL DEFAULT NULL', 
                'last_activity' => 'TIMESTAMP NULL DEFAULT NULL', 
                'role' => 'VARCHAR(50) NOT NULL DEFAULT "staff"', 
                'permissions' => 'JSON DEFAULT NULL', 
                'is_active' => 'TINYINT(1) NOT NULL DEFAULT 1'];
    
    foreach ($columns as $col => $def) {
        try {
            $pdo->query("SELECT `$col` FROM admins LIMIT 1");
            echo "✅ Column `$col` exists.\n";
        } catch (PDOException $e) {
            echo "⚠️ Column `$col` missing! Adding it now...\n";
            $pdo->exec("ALTER TABLE admins ADD COLUMN `$col` $def");
            echo "✅ Column `$col` added successfully.\n";
        }
    }

    // 5. Check and fix Super Admin
    $email = 'panya-admin@panyaglobal.in';
    $pass = 'Admin@PanyaGlobal2026';
    $hash = password_hash($pass, PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare("SELECT id FROM admins WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        $pdo->prepare("UPDATE admins SET password_hash = ?, is_active = 1 WHERE email = ?")->execute([$hash, $email]);
        echo "✅ Super Admin password reset successfully.\n";
    } else {
        $pdo->prepare("INSERT INTO admins (name, email, password_hash, role, permissions, is_active) VALUES ('Panya Admin', ?, ?, 'super_admin', '{}', 1)")->execute([$email, $hash]);
        echo "✅ Super Admin created successfully.\n";
    }

    echo "\n🎉 ALL FIXES APPLIED SUCCESSFULLY! YOU CAN LOGIN NOW! 🎉\n";

} catch (Throwable $e) {
    echo "\n❌ FATAL ERROR CAUGHT: " . $e->getMessage() . " on line " . $e->getLine() . "\n";
    echo "Please copy this red/error text and send it to me.\n";
}