<?php
require_once __DIR__ . '/../../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

requireRole('owner', 'super_admin', 'manager', 'salesperson', 'surveyor');

$input = getInput();
$surveyId = (int)($input['survey_id'] ?? 0);

if (!$surveyId) {
    jsonResponse(false, null, 'Survey ID is required.', 400);
}

$estimatedVolume = $input['estimated_volume_cft'] ?? null;
$inventoryNotes = $input['inventory_notes'] ?? null;
$specialRequirements = $input['special_requirements'] ?? null;

if (!$estimatedVolume) {
    jsonResponse(false, null, 'Estimated Volume is required to complete check-in.', 400);
}

$stmt = $pdo->prepare("SELECT * FROM crm_surveys WHERE id = :id");
$stmt->execute([':id' => $surveyId]);
$survey = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$survey) {
    jsonResponse(false, null, 'Survey not found.', 404);
}

try {
    $pdo->beginTransaction();

    // 1. Update Survey to Completed
    $updateSurvey = $pdo->prepare("
        UPDATE crm_surveys 
        SET survey_status = 'completed', 
            completed_at = NOW(), 
            total_area_sqft = :volume,
            general_notes = :notes,
            special_packing_notes = :reqs,
            updated_at = NOW() 
        WHERE id = :id
    ");
    $updateSurvey->execute([
        ':volume' => $estimatedVolume,
        ':notes' => $inventoryNotes,
        ':reqs' => $specialRequirements,
        ':id' => $surveyId
    ]);

    // 2. Update parent Case to reflect volume
    if ($survey['case_id']) {
        $updateCase = $pdo->prepare("
            UPDATE crm_cases 
            SET approx_area_sqft = :volume,
                special_requirements = :reqs,
                updated_at = NOW() 
            WHERE id = :case_id
        ");
        $updateCase->execute([
            ':volume' => $estimatedVolume,
            ':reqs' => json_encode(['survey_requirements' => $specialRequirements]),
            ':case_id' => $survey['case_id']
        ]);
        
        // Add milestone for case
        $mStmt = $pdo->prepare("INSERT INTO crm_case_milestones (case_id, milestone, milestone_date, notes, done_by) VALUES (?, 'survey_completed', NOW(), CONCAT('Survey check-in completed. Volume: ', ?), ?)");
        $mStmt->execute([$survey['case_id'], $estimatedVolume, $_SESSION['admin_id'] ?? null]);
        
        // Update case milestone tracker
        $cStmt = $pdo->prepare("UPDATE crm_cases SET milestone = 'survey_completed' WHERE id = ?");
        $cStmt->execute([$survey['case_id']]);
    }

    $pdo->commit();

    jsonResponse(true, null, 'Survey completed successfully.');
} catch (Exception $e) {
    $pdo->rollBack();
    error_log('[Database Error] ' . $e->getMessage());
    $errMsg = (defined('APP_DEBUG') && APP_DEBUG) ? 'Error completing survey: ' . $e->getMessage() : 'An error occurred while completing the survey. Please try again.';
    jsonResponse(false, null, $errMsg, 500);
}
