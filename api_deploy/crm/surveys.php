<?php
// ============================================================
// CRM Surveys API
// GET    /api/crm/surveys.php              → List surveys
// GET    /api/crm/surveys.php?id=X         → Single survey detail
// POST   /api/crm/surveys.php              → Create survey
// PUT    /api/crm/surveys.php              → Update survey
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];

// ─── GET — List or single survey ─────────────────────────────
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

    if ($id) {
        $stmt = $pdo->prepare("
            SELECT s.*, 
                   a.name AS surveyor_name,
                   c.case_number
            FROM crm_surveys s 
            LEFT JOIN admins a ON a.id = s.team_lead_id 
            LEFT JOIN crm_cases c ON c.id = s.case_id
            WHERE s.id = :id
        ");
        $stmt->execute([':id' => $id]);
        $survey = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$survey) jsonResponse(false, null, 'Survey not found', 404);

        // Fetch team members
        $mStmt = $pdo->prepare("SELECT tm.*, a.name, a.role AS admin_role FROM crm_survey_team_members tm LEFT JOIN admins a ON a.id = tm.admin_id WHERE tm.survey_id = :id");
        $mStmt->execute([':id' => $id]);
        $survey['team_members'] = $mStmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch items
        $iStmt = $pdo->prepare("SELECT * FROM crm_survey_items WHERE survey_id = :id ORDER BY room_name");
        $iStmt->execute([':id' => $id]);
        $survey['items'] = $iStmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch photos
        $pStmt = $pdo->prepare("SELECT * FROM crm_survey_photos WHERE survey_id = :id ORDER BY uploaded_at DESC");
        $pStmt->execute([':id' => $id]);
        $survey['photos'] = $pStmt->fetchAll(PDO::FETCH_ASSOC);

        jsonResponse(true, ['survey' => $survey]);
    }

    $status       = trim($_GET['status'] ?? '');
    $search       = trim($_GET['search'] ?? '');
    $limit        = min(max((int)($_GET['limit'] ?? 100), 1), 500);
    $offset       = max((int)($_GET['offset'] ?? 0), 0);

    $where  = ['1=1'];
    $params = [];

    if (!empty($status)) {
        $where[]  = 's.survey_status = :status';
        $params[':status'] = $status;
    }

    if (!empty($search)) {
        $escaped = str_replace(['%', '_'], ['\\%', '\\_'], $search);
        $where[] = "(s.client_name LIKE :search OR s.client_phone LIKE :search OR s.survey_number LIKE :search OR c.case_number LIKE :search)";
        $params[':search'] = '%' . $escaped . '%';
    }

    $whereClause = implode(' AND ', $where);

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_surveys s LEFT JOIN crm_cases c ON c.id = s.case_id WHERE $whereClause");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $sql = "
        SELECT s.*,
               a.name AS surveyor_name,
               c.case_number,
               s.survey_status AS status,
               DATE_FORMAT(s.scheduled_date, '%d %b %Y') AS scheduled_date_formatted
        FROM crm_surveys s
        LEFT JOIN admins a ON a.id = s.team_lead_id
        LEFT JOIN crm_cases c ON c.id = s.case_id
        WHERE $whereClause
        ORDER BY s.scheduled_date DESC, s.scheduled_time DESC
        LIMIT $limit OFFSET $offset
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $surveys = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, [
        'surveys'  => $surveys,
        'total'  => $total,
        'limit'  => $limit,
        'offset' => $offset,
    ]);
}

// ─── POST — Create survey ────────────────────────────────────
if ($method === 'POST') {
    requireRole('owner', 'super_admin', 'manager', 'salesperson');
    $input = getInput();

    $clientName = sanitizeInput($input['client_name'] ?? '', 'string');
    $clientPhone = sanitizeInput($input['client_phone'] ?? '', 'string');
    $scheduledDate = sanitizeInput($input['scheduled_date'] ?? '', 'string');
    
    if (empty($clientName) || empty($scheduledDate)) {
        jsonResponse(false, null, 'Client Name and Scheduled Date are required.', 400);
    }

    $surveyNumber = 'S-' . date('ymd') . rand(100, 999);

    $stmt = $pdo->prepare("
        INSERT INTO crm_surveys (
            survey_number, case_id, lead_id, client_name, client_phone, survey_address, survey_pincode, destination_address, google_maps_link,
            scheduled_date, scheduled_time, survey_type, survey_status, team_lead_id, vehicle_assigned,
            bhk_type, created_by
        ) VALUES (
            :survey_number, :case_id, :lead_id, :client_name, :client_phone, :survey_address, :survey_pincode, :destination_address, :google_maps_link,
            :scheduled_date, :scheduled_time, :survey_type, :survey_status, :team_lead_id, :vehicle_assigned,
            :bhk_type, :created_by
        )
    ");

    $stmt->execute([
        ':survey_number' => $surveyNumber,
        ':case_id' => $input['case_id'] ?? null,
        ':lead_id' => $input['lead_id'] ?? null,
        ':client_name' => $clientName,
        ':client_phone' => $clientPhone,
        ':survey_address' => $input['survey_address'] ?? '',
        ':survey_pincode' => $input['survey_pincode'] ?? null,
        ':destination_address' => $input['destination_address'] ?? null,
        ':google_maps_link' => $input['google_maps_link'] ?? null,
        ':scheduled_date' => $scheduledDate,
        ':scheduled_time' => $input['scheduled_time'] ?? '09:00:00',
        ':survey_type' => $input['survey_type'] ?? 'pre_move',
        ':survey_status' => $input['survey_status'] ?? 'scheduled',
        ':team_lead_id' => $input['team_lead_id'] ?? null,
        ':vehicle_assigned' => $input['vehicle_assigned'] ?? null,
        ':bhk_type' => $input['bhk_type'] ?? null,
        ':created_by' => $_SESSION['admin_id'] ?? null
    ]);

    jsonResponse(true, ['id' => $pdo->lastInsertId(), 'survey_number' => $surveyNumber], null, 201);
}

// ─── PUT — Update survey ─────────────────────────────────────
if ($method === 'PUT') {
    requireRole('owner', 'super_admin', 'manager', 'salesperson');
    $input = getInput();
    $id = (int)($input['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Survey ID is required.', 400);

    $stmt = $pdo->prepare("SELECT * FROM crm_surveys WHERE id = :id");
    $stmt->execute([':id' => $id]);
    if (!$stmt->fetch()) jsonResponse(false, null, 'Survey not found.', 404);

    $updateFields = [];
    $params = [':id' => $id];
    
    $fields = [
        'client_name', 'client_phone', 'survey_address', 'survey_pincode', 'destination_address', 'google_maps_link',
        'scheduled_date', 'scheduled_time', 'survey_type', 'survey_status', 'team_lead_id',
        'vehicle_assigned', 'estimated_travel_minutes', 'bhk_type', 'total_area_sqft',
        'origin_floor', 'destination_floor', 'building_type', 'origin_elevator', 'destination_elevator',
        'origin_parking', 'destination_parking', 'access_road_condition', 'access_challenges',
        'total_boxes_estimated', 'total_items_count', 'special_packing_needed', 'special_packing_notes',
        'general_notes', 'client_special_instructions', 'risk_items',
        'checkin_latitude', 'checkin_longitude', 'checkin_time', 'checkout_time'
    ];

    foreach ($fields as $field) {
        if (array_key_exists($field, $input)) {
            $val = $input[$field];
            if (in_array($field, ['origin_parking', 'destination_parking', 'special_packing_needed'])) {
                $val = $val ? 1 : 0;
            }
            
            $updateFields[] = "$field = :$field";
            $params[":$field"] = $val;
            
            if ($field === 'survey_status' && $val === 'completed') {
                $updateFields[] = "completed_at = NOW()";
                
                // Update case milestone
                $stmtC = $pdo->prepare("SELECT case_id FROM crm_surveys WHERE id = ?");
                $stmtC->execute([$id]);
                $caseId = $stmtC->fetchColumn();
                if ($caseId) {
                    $pdo->prepare("UPDATE crm_cases SET milestone = 'survey_completed' WHERE id = ?")->execute([$caseId]);
                }
            }
        }
    }

    if (empty($updateFields)) jsonResponse(false, null, 'No fields to update.', 400);

    $updateFields[] = "updated_at = NOW()";
    $sql = "UPDATE crm_surveys SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $pdo->prepare($sql)->execute($params);

    jsonResponse(true, ['id' => $id, 'updated' => true]);
}

if ($method === 'DELETE') {
    $input = getInput();
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    if (!$id) jsonResponse(false, null, 'Survey ID is required.', 400);

    try {
        $pdo->beginTransaction();
        
        // Delete related items and photos
        $pdo->prepare("DELETE FROM crm_survey_items WHERE survey_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM crm_survey_photos WHERE survey_id = ?")->execute([$id]);
        
        // Delete the survey
        $pdo->prepare("DELETE FROM crm_surveys WHERE id = ?")->execute([$id]);
        
        $pdo->commit();
        jsonResponse(true, null, 'Survey deleted successfully.');
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, null, 'Error deleting survey: ' . $e->getMessage(), 500);
    }
}

jsonResponse(false, null, 'Method not allowed', 405);
