<?php
require_once '../../config.php';
require_once '../../admin-guard.php';
require_once '../../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'PUT') {
    requirePermission('surveys');
    
    $input = getInput();
    $id = (int)($input['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Survey ID required.', 400);
    
    // IDOR Check
    $stmt = $pdo->prepare("SELECT team_lead_id FROM crm_surveys WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $survey = $stmt->fetch();
    
    if (!$survey) jsonResponse(false, null, 'Survey not found.', 404);
    
    $adminRole = $_SESSION['admin_role'] ?? '';
    $adminId = $_SESSION['admin_id'] ?? 0;
    if (!in_array($adminRole, ['owner', 'super_admin', 'manager'])) {
        if ($survey['team_lead_id'] != $adminId) {
            jsonResponse(false, null, 'Access denied. You do not own this survey.', 403);
        }
    }
    
    $allowed = [
        'survey_status', 'team_lead_id', 'vehicle_assigned', 'estimated_travel_minutes',
        'bhk_type', 'total_area_sqft', 'origin_floor', 'destination_floor', 'building_type',
        'origin_elevator', 'destination_elevator', 'origin_parking', 'destination_parking',
        'access_road_condition', 'access_challenges', 'total_boxes_estimated', 'total_items_count',
        'special_packing_needed', 'special_packing_notes', 'general_notes', 'client_special_instructions',
        'risk_items', 'completed_at'
    ];
    
    $updateFields = [];
    $params = [':id' => $id];
    
    foreach ($allowed as $field) {
        if (array_key_exists($field, $input)) {
            $updateFields[] = "$field = :$field";
            $params[":$field"] = $input[$field];
        }
    }
    
    if (empty($updateFields)) jsonResponse(false, null, 'No fields to update.', 400);
    
    $setClause = implode(', ', $updateFields);
    $sql = "UPDATE crm_surveys SET $setClause WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    jsonResponse(true, null, 'Survey updated.', 200);
} else {
    jsonResponse(false, null, 'Method not allowed.', 405);
}
