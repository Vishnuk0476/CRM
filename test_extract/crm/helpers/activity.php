<?php
// ============================================================
// CRM Activity Logger Helper
// Usage: require_once __DIR__ . '/../helpers/activity.php';
//        logCrmActivity($pdo, $leadId, $caseId, $adminId, 'note_added', 'Note Added', 'Admin added a note');
// ============================================================

function logCrmActivity(
    PDO    $pdo,
    ?int   $leadId,
    ?int   $caseId,
    ?int   $adminId,
    string $activityType,
    string $title,
    string $description = '',
    array  $metadata = []
): void {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO crm_activities 
                (lead_id, case_id, admin_id, activity_type, title, description, metadata, created_at)
            VALUES 
                (:lead_id, :case_id, :admin_id, :type, :title, :desc, :meta, NOW())
        ");
        $stmt->execute([
            ':lead_id' => $leadId ?: null,
            ':case_id' => $caseId ?: null,
            ':admin_id'=> $adminId ?: null,
            ':type'    => $activityType,
            ':title'   => $title,
            ':desc'    => $description,
            ':meta'    => !empty($metadata) ? json_encode($metadata) : null,
        ]);
    } catch (Exception $e) {
        // Non-fatal — log silently
        error_log('[CRM Activity] ' . $e->getMessage());
    }
}
