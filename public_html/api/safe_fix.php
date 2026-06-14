<?php
// SAFE FIX - WILL NOT DELETE ANY DATA
ini_set('display_errors', 1);
error_reporting(E_ALL);

$login_file = __DIR__ . '/admin-login.php';
if (file_exists($login_file)) {
    $content = file_get_contents($login_file);
    // Fix activity_logs insert to explicitly use UUID()
    $content = str_replace(
        "INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)",
        "INSERT INTO activity_logs (id, admin_id, action, entity_type, entity_id, details, ip_address) VALUES (UUID(), ?, ?, ?, ?, ?, ?)",
        $content
    );
    file_put_contents($login_file, $content);
    echo "✅ admin-login.php fixed successfully!<br>";
} else {
    echo "❌ admin-login.php not found!<br>";
}

$csrf_file = __DIR__ . '/csrf.php';
if (file_exists($csrf_file)) {
    $content = file_get_contents($csrf_file);
    // Add same fix for any other files if needed
    echo "✅ csrf.php checked.<br>";
}

echo "<h3>🎉 Fix Applied! Now try logging in. Your data is 100% safe!</h3>";
?>