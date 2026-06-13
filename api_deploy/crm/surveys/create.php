<?php
require_once '../../config.php';
require_once '../../admin-guard.php';
require_once '../../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    requirePermission('surveys', 'cases');
    
    $input = getInput();
    
    $caseId = isset($input['case_id']) ? (int)$input['case_id'] : null;
    $leadId = isset($input['lead_id']) ? (int)$input['lead_id'] : null;
    $clientName = sanitizeInput($input['client_name'] ?? '', 'string');
    $clientPhone = sanitizeInput($input['client_phone'] ?? '', 'string');
    $address = sanitizeInput($input['survey_address'] ?? '', 'string');
    $date = sanitizeInput($input['scheduled_date'] ?? '', 'date');
    $time = sanitizeInput($input['scheduled_time'] ?? '', 'string');
    
    if (!$clientName || !$clientPhone || !$address || !$date || !$time) {
        jsonResponse(false, null, 'Required fields missing.', 400);
    }
    
    $year = date('Y');
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_surveys WHERE survey_number LIKE :pattern");
    $countStmt->execute([':pattern' => "SRV-$year-%"]);
    $count = $countStmt->fetchColumn() + 1;
    $surveyNum = sprintf("SRV-%s-%04d", $year, $count);
    
    $sql = "INSERT INTO crm_surveys (
        survey_number, case_id, lead_id, client_name, client_phone, survey_address,
        scheduled_date, scheduled_time, team_lead_id, survey_type, created_by
    ) VALUES (
        :snum, :case_id, :lead_id, :name, :phone, :address,
        :date, :time, :lead, :type, :created_by
    )";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':snum' => $surveyNum,
        ':case_id' => $caseId,
        ':lead_id' => $leadId,
        ':name' => $clientName,
        ':phone' => $clientPhone,
        ':address' => $address,
        ':date' => $date,
        ':time' => $time,
        ':lead' => isset($input['team_lead_id']) ? (int)$input['team_lead_id'] : null,
        ':type' => sanitizeInput($input['survey_type'] ?? 'pre_move', 'string'),
        ':created_by' => $_SESSION['admin_id']
    ]);
    
    $newId = $pdo->lastInsertId();
    logActivity($pdo, 'SURVEY_SCHEDULED', 'crm_survey', (string)$newId, null, ['survey_number' => $surveyNum, 'date' => $date]);

    // Send email to Team Lead / Surveyor
    $teamLeadId = isset($input['team_lead_id']) ? (int)$input['team_lead_id'] : null;
    if ($teamLeadId) {
        $surveyorInfo = getAdminById($pdo, $teamLeadId);
        if ($surveyorInfo && !empty($surveyorInfo['email'])) {
            $body = "<p>Hello <strong>{$surveyorInfo['name']}</strong>,</p>";
            $body .= "<p>A new survey has been assigned to you. Here are the details:</p>";
            $body .= "<table style='width:100%;border-collapse:collapse;margin-top:15px;margin-bottom:15px;'>";
            $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;width:35%;'>Survey No.</td><td style='padding:10px;border:1px solid #e2e8f0;'>{$surveyNum}</td></tr>";
            $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;'>Customer</td><td style='padding:10px;border:1px solid #e2e8f0;'>" . htmlspecialchars($clientName) . "</td></tr>";
            $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;'>Phone</td><td style='padding:10px;border:1px solid #e2e8f0;'>" . htmlspecialchars($clientPhone) . "</td></tr>";
            $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;'>Date & Time</td><td style='padding:10px;border:1px solid #e2e8f0;'>{$date} at {$time}</td></tr>";
            $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;'>Address</td><td style='padding:10px;border:1px solid #e2e8f0;'>" . nl2br(htmlspecialchars($address)) . "</td></tr>";
            $body .= "</table>";
            $body .= "<p style='margin-top:25px;'><a href='https://panyaglobal.in/admin/surveys' style='display:inline-block;padding:12px 24px;background-color:#0f172a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;'>View Survey</a></p>";

            sendEmail(
                $surveyorInfo['email'], 
                "Survey Assigned: {$surveyNum}", 
                crmEmailTemplate('New Survey Assigned', $body)
            );
        }
    }
    
    jsonResponse(true, ['id' => $newId, 'survey_number' => $surveyNum], 'Survey scheduled.', 201);
} else {
    jsonResponse(false, null, 'Method not allowed.', 405);
}
