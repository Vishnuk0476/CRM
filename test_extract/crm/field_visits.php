<?php
// ============================================================
// Field Visits API — Track field visits linked to cases/surveys
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$adminId = $_SESSION['admin_id'];

// ================================================================
//   GET ENDPOINTS
// ================================================================
if ($method === 'GET') {

    // ── My field visits ─────────────────────────────────────
    if ($action === 'my_visits') {
        $days = isset($_GET['days']) ? min((int)$_GET['days'], 90) : 30;
        $stmt = $pdo->prepare("
            SELECT fv.*, c.case_number, c.client_name as case_client,
                   s.survey_number, s.client_name as survey_client
            FROM crm_field_visits fv
            LEFT JOIN crm_cases c ON c.id = fv.case_id
            LEFT JOIN crm_surveys s ON s.id = fv.survey_id
            WHERE fv.admin_id = :admin_id
            ORDER BY fv.created_at DESC
            LIMIT :lim
        ");
        $stmt->bindValue(':admin_id', $adminId, PDO::PARAM_INT);
        $stmt->bindValue(':lim', $days, PDO::PARAM_INT);
        $stmt->execute();
        $visits = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($visits as &$v) {
            $v['checkin_formatted'] = $v['checkin_time'] ? date('h:i A', strtotime($v['checkin_time'])) : null;
            $v['checkout_formatted'] = $v['checkout_time'] ? date('h:i A', strtotime($v['checkout_time'])) : null;
            $v['date_formatted'] = date('d M Y', strtotime($v['visit_date']));
            $v['photos'] = $v['photos'] ? json_decode($v['photos'], true) : [];
        }

        jsonResponse(true, ['visits' => $visits]);
    }

    // ── All field visits (admin only) ───────────────────────
    if ($action === 'all_visits') {
        requireRole('owner', 'super_admin', 'manager');
        $month = $_GET['month'] ?? date('Y-m');

        $stmt = $pdo->prepare("
            SELECT fv.*, a.name as employee_name, a.role,
                   c.case_number, c.client_name as case_client,
                   s.survey_number, s.client_name as survey_client
            FROM crm_field_visits fv
            LEFT JOIN admins a ON a.id = fv.admin_id
            LEFT JOIN crm_cases c ON c.id = fv.case_id
            LEFT JOIN crm_surveys s ON s.id = fv.survey_id
            WHERE DATE_FORMAT(fv.visit_date, '%Y-%m') = :month
            ORDER BY fv.visit_date DESC, fv.created_at DESC
        ");
        $stmt->execute([':month' => $month]);
        $visits = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($visits as &$v) {
            $v['checkin_formatted'] = $v['checkin_time'] ? date('h:i A', strtotime($v['checkin_time'])) : null;
            $v['checkout_formatted'] = $v['checkout_time'] ? date('h:i A', strtotime($v['checkout_time'])) : null;
            $v['date_formatted'] = date('d M Y', strtotime($v['visit_date']));
            $v['photos'] = $v['photos'] ? json_decode($v['photos'], true) : [];
        }

        jsonResponse(true, ['visits' => $visits, 'month' => $month]);
    }

    // ── Travel reimbursement report (admin only) ────────────
    if ($action === 'travel_report') {
        requireRole('owner', 'super_admin', 'manager');
        $month = $_GET['month'] ?? date('Y-m');

        $stmt = $pdo->prepare("
            SELECT a.id, a.name, a.role,
                   COUNT(fv.id) as total_visits,
                   COALESCE(SUM(fv.kilometers_traveled), 0) as total_km,
                   COALESCE(SUM(TIMESTAMPDIFF(MINUTE, fv.checkin_time, fv.checkout_time)), 0) as total_minutes
            FROM admins a
            LEFT JOIN crm_field_visits fv ON fv.admin_id = a.id AND DATE_FORMAT(fv.visit_date, '%Y-%m') = :month
            WHERE a.is_active = true
            GROUP BY a.id
            HAVING total_visits > 0
            ORDER BY total_km DESC
        ");
        $stmt->execute([':month' => $month]);
        $report = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($report as &$r) {
            $r['total_hours'] = round($r['total_minutes'] / 60, 1);
        }

        jsonResponse(true, ['report' => $report, 'month' => $month]);
    }

    jsonResponse(false, null, 'Invalid action', 400);
}

// ================================================================
//   POST ENDPOINTS
// ================================================================
if ($method === 'POST') {
    $isMultipart = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false;
    $input = $isMultipart ? $_POST : getInput();

    // ── Start field visit ───────────────────────────────────
    if ($action === 'start_visit') {
        $caseId = isset($input['case_id']) ? (int)$input['case_id'] : null;
        $surveyId = isset($input['survey_id']) ? (int)$input['survey_id'] : null;
        $clientName = sanitizeInput($input['client_name'] ?? '', 'string');
        $purpose = sanitizeInput($input['visit_purpose'] ?? '', 'string');
        $lat = isset($input['latitude']) ? (float)$input['latitude'] : null;
        $lng = isset($input['longitude']) ? (float)$input['longitude'] : null;

        if (empty($clientName) && !$caseId && !$surveyId) {
            jsonResponse(false, null, 'Please specify a case, survey, or client name.', 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO crm_field_visits 
                (admin_id, case_id, survey_id, visit_date, checkin_time, checkin_latitude, checkin_longitude, client_name, visit_purpose) 
            VALUES 
                (:admin_id, :case_id, :survey_id, CURRENT_DATE, NOW(), :lat, :lng, :client_name, :purpose)
        ");
        $stmt->execute([
            ':admin_id' => $adminId,
            ':case_id' => $caseId,
            ':survey_id' => $surveyId,
            ':lat' => $lat,
            ':lng' => $lng,
            ':client_name' => $clientName,
            ':purpose' => $purpose
        ]);

        $visitId = $pdo->lastInsertId();
        logActivity($pdo, 'field_visit_started', 'field_visit', (string)$visitId, null, [
            'client' => $clientName, 'lat' => $lat, 'lng' => $lng
        ]);

        jsonResponse(true, ['visit_id' => $visitId, 'message' => 'Field visit started.']);
    }

    // ── End field visit ─────────────────────────────────────
    if ($action === 'end_visit') {
        $visitId = (int)($input['visit_id'] ?? 0);
        if (!$visitId) jsonResponse(false, null, 'Visit ID required.', 400);

        $lat = isset($input['latitude']) ? (float)$input['latitude'] : null;
        $lng = isset($input['longitude']) ? (float)$input['longitude'] : null;
        $km = isset($input['kilometers_traveled']) ? (float)$input['kilometers_traveled'] : null;
        $notes = sanitizeInput($input['visit_notes'] ?? '', 'string');

        $stmt = $pdo->prepare("
            UPDATE crm_field_visits 
            SET checkout_time = NOW(), checkout_latitude = :lat, checkout_longitude = :lng,
                kilometers_traveled = :km, visit_notes = :notes
            WHERE id = :id AND admin_id = :admin_id AND checkout_time IS NULL
        ");
        $stmt->execute([
            ':lat' => $lat, ':lng' => $lng, ':km' => $km, ':notes' => $notes,
            ':id' => $visitId, ':admin_id' => $adminId
        ]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(false, null, 'Visit not found or already ended.', 400);
        }

        logActivity($pdo, 'field_visit_ended', 'field_visit', (string)$visitId, null, ['km' => $km]);

        jsonResponse(true, null, 'Field visit completed.');
    }

    // ── Upload visit photos ─────────────────────────────────
    if ($action === 'upload_photos') {
        $visitId = (int)($_POST['visit_id'] ?? 0);
        if (!$visitId) jsonResponse(false, null, 'Visit ID required.', 400);

        // Check visit belongs to user
        $stmt = $pdo->prepare("SELECT photos FROM crm_field_visits WHERE id = :id AND admin_id = :admin_id");
        $stmt->execute([':id' => $visitId, ':admin_id' => $adminId]);
        $visit = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$visit) jsonResponse(false, null, 'Visit not found.', 404);

        $existingPhotos = $visit['photos'] ? json_decode($visit['photos'], true) : [];
        $uploadDir = __DIR__ . '/../../uploads/field_visit_photos/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

        $newPhotos = [];
        if (isset($_FILES['photos'])) {
            $files = $_FILES['photos'];
            $fileCount = is_array($files['name']) ? count($files['name']) : 1;

            for ($i = 0; $i < $fileCount; $i++) {
                $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
                $tmpName = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
                $error = is_array($files['error']) ? $files['error'][$i] : $files['error'];

                if ($error !== UPLOAD_ERR_OK) continue;

                $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) continue;

                $filename = 'fv_' . $visitId . '_' . uniqid() . '.' . $ext;
                if (move_uploaded_file($tmpName, $uploadDir . $filename)) {
                    $newPhotos[] = '/uploads/field_visit_photos/' . $filename;
                }
            }
        }

        $allPhotos = array_merge($existingPhotos, $newPhotos);
        $pdo->prepare("UPDATE crm_field_visits SET photos = :photos WHERE id = :id")
            ->execute([':photos' => json_encode($allPhotos), ':id' => $visitId]);

        jsonResponse(true, ['photos' => $allPhotos, 'message' => count($newPhotos) . ' photo(s) uploaded.']);
    }

    jsonResponse(false, null, 'Invalid action', 400);
}

jsonResponse(false, null, 'Method not allowed', 405);
