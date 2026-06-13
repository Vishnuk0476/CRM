<?php
// ============================================================
// CLI / GET — /api/crm/quotations/check-expiry.php
// Cron job to expire quotes
// ============================================================
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers.php';

if (php_sapi_name() !== 'cli' && empty($_GET['cron_key'])) {
    jsonResponse(false, null, 'Unauthorized.', 401);
}

try {
    $stmt = $pdo->prepare("UPDATE crm_quotations SET status = 'expired' WHERE status = 'sent' AND valid_until < CURDATE()");
    $stmt->execute();
    $expiredCount = $stmt->rowCount();
    
    if ($expiredCount > 0) {
        logActivity($pdo, 'cron_expired_quotations', 'system', null, null, ['count' => $expiredCount], 0, 'system', 'Cron Job');
    }
    
    // We try to catch crm_notifications if table exists
    $notifCount = 0;
    try {
        $stmtSoon = $pdo->prepare("SELECT id, quotation_number, created_by FROM crm_quotations WHERE status = 'sent' AND valid_until BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 2 DAY)");
        $stmtSoon->execute();
        $expiringSoon = $stmtSoon->fetchAll();
        
        $stmtNotif = $pdo->prepare("INSERT IGNORE INTO crm_notifications (user_id, title, message, link) VALUES (:uid, :title, :msg, :link)");
        foreach ($expiringSoon as $q) {
            if ($q['created_by']) {
                $stmtNotif->execute([
                    'uid' => $q['created_by'],
                    'title' => "Quotation Expiring Soon",
                    'msg' => "Quotation {$q['quotation_number']} is expiring within 48 hours.",
                    'link' => "/admin/accounts/quotations/{$q['id']}"
                ]);
                $notifCount++;
            }
        }
    } catch (Exception $e) {
        // Silently ignore if notifications table doesn't match
    }
    
    jsonResponse(true, [
        'expired_count' => $expiredCount,
        'notifications_created' => $notifCount,
        'message' => 'Expiry check completed.'
    ]);
} catch (Exception $e) {
    jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
