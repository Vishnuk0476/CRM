<?php
// ============================================================
// GET / PUT — /api/crm/settings/company.php
// Manages company profile settings
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT setting_key, setting_value FROM crm_app_settings WHERE setting_group = 'company'");
    $stmt->execute();
    $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    
    jsonResponse(true, $settings);
} 
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        jsonResponse(false, null, 'Invalid JSON payload.', 400);
    }
    
    $admin_id = $_SESSION['admin_id'] ?? null;
    
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("
            INSERT INTO crm_app_settings (setting_key, setting_value, setting_group, updated_by) 
            VALUES (:key, :val, 'company', :uid)
            ON DUPLICATE KEY UPDATE 
                setting_value = :val2,
                updated_by = :uid2
        ");
        
        foreach ($data as $key => $val) {
            $stmt->execute([
                'key' => $key,
                'val' => $val,
                'uid' => $admin_id,
                'val2' => $val,
                'uid2' => $admin_id
            ]);
        }
        $pdo->commit();
        jsonResponse(true, ['message' => 'Company settings updated successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
} else {
    jsonResponse(false, null, 'Method not allowed.', 405);
}
