<?php
require_once '../../config.php';
require_once '../../admin-guard.php';
require_once '../../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    requirePermission('cases');
    
    $input = getInput();
    $clientName = sanitizeInput($input['client_name'] ?? '', 'string');
    $clientPhone = sanitizeInput($input['client_phone'] ?? '', 'string');
    
    if (!$clientName || !$clientPhone) {
        jsonResponse(false, null, 'Client name and phone are required.', 400);
    }
    
    // Generate case number
    $year = date('Y');
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_cases WHERE case_number LIKE :pattern");
    $countStmt->execute([':pattern' => "PG-$year-%"]);
    $count = $countStmt->fetchColumn() + 1;
    $caseNumber = sprintf("PG-%s-%04d", $year, $count);
    
    try {
        $pdo->beginTransaction();
        
        $sql = "INSERT INTO crm_cases (
            case_number, client_name, client_phone, client_email, company_name,
            relocation_type, origin_city, destination_city, move_date_expected,
            bhk_type, assigned_consultant_id, is_gulf_nri, notes, created_by
        ) VALUES (
            :case_num, :name, :phone, :email, :company,
            :reloc_type, :o_city, :d_city, :move_date,
            :bhk, :assigned, :gulf, :notes, :created_by
        )";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':case_num' => $caseNumber,
            ':name' => $clientName,
            ':phone' => $clientPhone,
            ':email' => sanitizeInput($input['client_email'] ?? '', 'email'),
            ':company' => sanitizeInput($input['company_name'] ?? '', 'string'),
            ':reloc_type' => sanitizeInput($input['relocation_type'] ?? '', 'string'),
            ':o_city' => sanitizeInput($input['origin_city'] ?? '', 'string'),
            ':d_city' => sanitizeInput($input['destination_city'] ?? '', 'string'),
            ':move_date' => sanitizeInput($input['move_date_expected'] ?? null, 'date'),
            ':bhk' => sanitizeInput($input['bhk_type'] ?? '', 'string'),
            ':assigned' => isset($input['assigned_consultant_id']) ? (int)$input['assigned_consultant_id'] : $_SESSION['admin_id'],
            ':gulf' => isset($input['is_gulf_nri']) ? (int)$input['is_gulf_nri'] : 0,
            ':notes' => sanitizeInput($input['notes'] ?? '', 'string'),
            ':created_by' => $_SESSION['admin_id']
        ]);
        
        $caseId = $pdo->lastInsertId();
        
        $insertMilestone = $pdo->prepare("INSERT INTO crm_case_milestones (case_id, milestone, notes, done_by) VALUES (?, ?, ?, ?)");
        $insertMilestone->execute([$caseId, 'inquiry_received', 'Case created manually.', $_SESSION['admin_id']]);
        
        logActivity($pdo, 'CASE_CREATED', 'crm_case', (string)$caseId, null, ['case_number' => $caseNumber]);
        
        $pdo->commit();
        jsonResponse(true, ['id' => $caseId, 'case_number' => $caseNumber], 'Case created successfully.', 201);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log('[Database Error] ' . $e->getMessage());
        $errMsg = (defined('APP_DEBUG') && APP_DEBUG) ? 'Failed to create case: ' . $e->getMessage() : 'A database error occurred while creating the case. Please try again.';
        jsonResponse(false, null, $errMsg, 500);
    }
} else {
    jsonResponse(false, null, 'Method not allowed.', 405);
}
