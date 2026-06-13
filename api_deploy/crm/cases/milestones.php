<?php
require_once '../../config.php';
require_once '../../admin-guard.php';
require_once '../../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    requirePermission('cases');
    
    $input = getInput();
    $caseId = (int)($input['case_id'] ?? 0);
    $milestone = sanitizeInput($input['milestone'] ?? '', 'string');
    $notes = sanitizeInput($input['notes'] ?? '', 'string');
    
    if (!$caseId || !$milestone) {
        jsonResponse(false, null, 'Case ID and Milestone are required.', 400);
    }
    
    $stmt = $pdo->prepare("INSERT INTO crm_case_milestones (case_id, milestone, milestone_date, notes, done_by) VALUES (?, ?, NOW(), ?, ?)");
    $stmt->execute([$caseId, $milestone, $notes, $_SESSION['admin_id']]);
    
    // Update current milestone in case
    $pdo->prepare("UPDATE crm_cases SET milestone = ? WHERE id = ?")->execute([$milestone, $caseId]);
    
    jsonResponse(true, ['id' => $pdo->lastInsertId()], 'Milestone added.', 201);
} else {
    jsonResponse(false, null, 'Method not allowed.', 405);
}
