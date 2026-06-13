<?php
require_once '../../config.php';
require_once '../../admin-guard.php';
require_once '../../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    requirePermission('surveys');
    
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Survey ID required.', 400);
    
    $stmt = $pdo->prepare("
        SELECT s.*,
               a.name AS team_lead_name,
               a2.name AS created_by_name
        FROM crm_surveys s
        LEFT JOIN admins a ON a.id = s.team_lead_id
        LEFT JOIN admins a2 ON a2.id = s.created_by
        WHERE s.id = :id
    ");
    $stmt->execute([':id' => $id]);
    $survey = $stmt->fetch();
    
    if (!$survey) jsonResponse(false, null, 'Survey not found.', 404);
    
    // IDOR Check
    $adminRole = $_SESSION['admin_role'] ?? '';
    $adminId = $_SESSION['admin_id'] ?? 0;
    if (!in_array($adminRole, ['owner', 'super_admin', 'manager'])) {
        if ($survey['team_lead_id'] != $adminId) {
            jsonResponse(false, null, 'Access denied. You do not own this survey.', 403);
        }
    }
    
    // Items
    $iStmt = $pdo->prepare("SELECT * FROM crm_survey_items WHERE survey_id = ?");
    $iStmt->execute([$id]);
    $items = $iStmt->fetchAll();
    
    // Photos
    $pStmt = $pdo->prepare("SELECT * FROM crm_survey_photos WHERE survey_id = ?");
    $pStmt->execute([$id]);
    $photos = $pStmt->fetchAll();
    
    jsonResponse(true, [
        'survey' => $survey,
        'items' => $items,
        'photos' => $photos
    ]);
} else {
    jsonResponse(false, null, 'Method not allowed.', 405);
}
