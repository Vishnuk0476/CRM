<?php
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];
$adminId = $_SESSION['admin_id'];

// Check admin role
$stmt = $pdo->prepare("SELECT role FROM admins WHERE id = ?");
$stmt->execute([$adminId]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!in_array($admin['role'], ['owner', 'super_admin'])) {
    jsonResponse(false, null, 'Unauthorized: Settings require owner/super_admin role', 403);
}

if ($method === 'GET') {
    // Return default empty settings if not present
    $defaults = [
        'company_name' => 'Panya Global Relocation',
        'company_email' => 'info@panyaglobal.com',
        'company_phone' => '+91-9876543210',
        'company_address' => 'New Delhi, India',
        'invoice_prefix' => 'INV',
        'gst_default' => '18',
        'terms_and_conditions' => 'Standard terms apply.'
    ];

    // Read from json file instead of table for simplicity or create table if it doesn't exist
    // We will just create/use crm_app_settings table in postgres.
    
    // Create table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS crm_app_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT,
        updated_by INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM crm_app_settings");
    $settings = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    $merged_settings = array_merge($defaults, $settings);

    jsonResponse(true, ['settings' => $merged_settings]);
}

if ($method === 'POST') {
    $data = getInput();
    $settings = $data['settings'] ?? [];
    
    if (empty($settings) || !is_array($settings)) {
        jsonResponse(false, null, 'Settings payload is invalid', 400);
    }

    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            INSERT INTO crm_app_settings (setting_key, setting_value, updated_by, updated_at) 
            VALUES (:key, :value, :admin_id, CURRENT_TIMESTAMP)
            ON CONFLICT (setting_key) 
            DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_by = EXCLUDED.updated_by, updated_at = CURRENT_TIMESTAMP
        ");
        
        foreach ($settings as $key => $value) {
            $val_str = (string)$value;
            $stmt->execute([
                ':key' => $key,
                ':value' => $val_str,
                ':admin_id' => $adminId
            ]);
        }

        $pdo->commit();
        jsonResponse(true, ['message' => 'Settings updated successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log('[Database Error] ' . $e->getMessage());
        $errMsg = (defined('APP_DEBUG') && APP_DEBUG) ? 'Database error: ' . $e->getMessage() : 'A database error occurred. Please try again.';
        jsonResponse(false, null, $errMsg, 500);
    }
}

jsonResponse(false, null, 'Method not allowed', 405);
