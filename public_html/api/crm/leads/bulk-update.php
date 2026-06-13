<?php
require_once '../../config.php';
require_once '../../admin-guard.php';
require_once '../../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'PUT') {
    requirePermission('leads');
    
    $input = getInput();
    $leadIds = $input['lead_ids'] ?? [];
    $status = sanitizeInput($input['status'] ?? '', 'string');
    $temperature = sanitizeInput($input['temperature'] ?? '', 'string');
    
    if (empty($leadIds) || !is_array($leadIds)) {
        jsonResponse(false, null, 'No leads selected.', 400);
    }
    
    $updateFields = [];
    $params = [];
    
    if ($status) {
        $updateFields[] = "status = ?";
        $params[] = $status;
    }
    
    if ($temperature) {
        $updateFields[] = "temperature = ?";
        $params[] = $temperature;
    }
    
    if (empty($updateFields)) {
        jsonResponse(false, null, 'No fields to update.', 400);
    }
    
    $setClause = implode(', ', $updateFields);
    $placeholders = str_repeat('?,', count($leadIds) - 1) . '?';
    $sql = "UPDATE crm_leads SET $setClause WHERE id IN ($placeholders)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array_merge($params, $leadIds));
    
    jsonResponse(true, null, 'Leads updated successfully.', 200);
} else {
    jsonResponse(false, null, 'Method not allowed.', 405);
}
