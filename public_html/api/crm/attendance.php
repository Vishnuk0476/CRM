<?php
// ============================================================
// Attendance & Leave Management API
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$adminId = $_SESSION['admin_id'];
$adminRole = $_SESSION['admin_role'] ?? '';

// ─── Helper: Fetch a setting from crm_app_settings ─────────
function getSetting(PDO $pdo, string $key, $default = null) {
    $stmt = $pdo->prepare("SELECT setting_value FROM crm_app_settings WHERE setting_key = :key LIMIT 1");
    $stmt->execute([':key' => $key]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? $row['setting_value'] : $default;
}

// ─── Helper: Auto-detect attendance status ──────────────────
function detectStatus(PDO $pdo, string $checkInTime): string {
    $officeStart = getSetting($pdo, 'office_start_time', '10:00');
    $checkInObj = new DateTime($checkInTime);
    $officeStartObj = new DateTime(date('Y-m-d') . ' ' . $officeStart);

    if ($checkInObj > $officeStartObj) {
        return 'late';
    }
    return 'present';
}

// ─── Helper: Calculate total hours from check-in/out ────────
function calculateHours(?string $checkIn, ?string $checkOut): float {
    if (!$checkIn || !$checkOut) return 0;
    $in = new DateTime($checkIn);
    $out = new DateTime($checkOut);
    $diff = $out->getTimestamp() - $in->getTimestamp();
    return round($diff / 3600, 2);
}

// ─── Helper: Check if today is a holiday ────────────────────
function isHoliday(PDO $pdo, string $date): ?array {
    $stmt = $pdo->prepare("SELECT * FROM crm_holidays WHERE holiday_date = :d AND is_active = 1 LIMIT 1");
    $stmt->execute([':d' => $date]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

// ─── Helper: Handle selfie file upload ──────────────────────
function handleSelfieUpload(): ?string {
    if (!isset($_FILES['selfie']) || $_FILES['selfie']['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $file = $_FILES['selfie'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array($ext, $allowed)) return null;

    $uploadDir = __DIR__ . '/../../uploads/attendance_selfies/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $filename = 'selfie_' . uniqid() . '_' . time() . '.' . $ext;
    $filepath = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return '/uploads/attendance_selfies/' . $filename;
    }
    return null;
}

// ─── Helper: Get leave balance for a user ───────────────────
function getLeaveBalance(PDO $pdo, int $adminId): array {
    $year = date('Y');
    $types = ['casual', 'sick', 'earned', 'compensatory', 'unpaid'];
    $balance = [];

    foreach ($types as $type) {
        $quota = (int) getSetting($pdo, $type . '_leave_quota', 0);

        $stmt = $pdo->prepare("
            SELECT COALESCE(SUM(days_count), 0) as used 
            FROM crm_leave_requests 
            WHERE admin_id = :aid AND leave_type = :lt AND status = 'approved' AND YEAR(from_date) = :yr
        ");
        $stmt->execute([':aid' => $adminId, ':lt' => $type, ':yr' => $year]);
        $used = (float) $stmt->fetchColumn();

        $balance[] = [
            'type' => $type,
            'label' => ucfirst($type) . ' Leave',
            'quota' => $quota,
            'used' => $used,
            'remaining' => max(0, $quota - $used)
        ];
    }
    return $balance;
}

// ================================================================
//   GET ENDPOINTS
// ================================================================
if ($method === 'GET') {

    // ── Today's attendance for current user ─────────────────
    if ($action === 'today') {
        $holiday = isHoliday($pdo, date('Y-m-d'));

        $stmt = $pdo->prepare("SELECT * FROM crm_attendance WHERE admin_id = :admin_id AND attendance_date = CURRENT_DATE");
        $stmt->execute([':admin_id' => $adminId]);
        $attendance = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($attendance) {
            $attendance['time_in'] = $attendance['check_in_time'] ? date('h:i A', strtotime($attendance['check_in_time'])) : null;
            $attendance['time_out'] = $attendance['check_out_time'] ? date('h:i A', strtotime($attendance['check_out_time'])) : null;
            $attendance['hours_worked'] = calculateHours($attendance['check_in_time'], $attendance['check_out_time']);
        }

        jsonResponse(true, [
            'attendance' => $attendance,
            'holiday' => $holiday,
            'is_holiday' => $holiday !== null
        ]);
    }

    // ── Attendance history for current user ─────────────────
    if ($action === 'history') {
        $days = isset($_GET['days']) ? min((int)$_GET['days'], 90) : 30;
        $stmt = $pdo->prepare("
            SELECT * FROM crm_attendance 
            WHERE admin_id = :admin_id 
            ORDER BY attendance_date DESC 
            LIMIT :lim
        ");
        $stmt->bindValue(':admin_id', $adminId, PDO::PARAM_INT);
        $stmt->bindValue(':lim', $days, PDO::PARAM_INT);
        $stmt->execute();
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($history as &$record) {
            $record['date'] = date('d M Y', strtotime($record['attendance_date']));
            $record['day_name'] = date('l', strtotime($record['attendance_date']));
            $record['time_in'] = $record['check_in_time'] ? date('h:i A', strtotime($record['check_in_time'])) : null;
            $record['time_out'] = $record['check_out_time'] ? date('h:i A', strtotime($record['check_out_time'])) : null;
            $record['hours_worked'] = calculateHours($record['check_in_time'], $record['check_out_time']);
        }

        jsonResponse(true, ['history' => $history]);
    }

    // ── Team attendance (admin only) ────────────────────────
    if ($action === 'team') {
        requirePermission('attendance');
        $date = $_GET['date'] ?? date('Y-m-d');

        $stmt = $pdo->prepare("
            SELECT a.id, a.attendance_date, a.check_in_time, a.check_out_time, a.status,
                   a.check_in_latitude, a.check_in_longitude, a.check_out_latitude, a.check_out_longitude,
                   a.selfie_path, a.notes,
                   ad.name as employee_name, ad.role, ad.email as employee_email
            FROM admins ad
            LEFT JOIN crm_attendance a ON a.admin_id = ad.id AND a.attendance_date = :date
            WHERE ad.is_active = true
            ORDER BY ad.name
        ");
        $stmt->execute([':date' => $date]);
        $team = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($team as &$record) {
            $record['time_in'] = $record['check_in_time'] ? date('h:i A', strtotime($record['check_in_time'])) : null;
            $record['time_out'] = $record['check_out_time'] ? date('h:i A', strtotime($record['check_out_time'])) : null;
            $record['hours_worked'] = calculateHours($record['check_in_time'], $record['check_out_time']);
            $record['status'] = $record['status'] ?? 'absent';
        }

        $holiday = isHoliday($pdo, $date);

        jsonResponse(true, ['team_attendance' => $team, 'date' => $date, 'holiday' => $holiday]);
    }

    // ── Live team status board (admin only) ──────────────────
    if ($action === 'live_status') {
        requirePermission('attendance');

        $stmt = $pdo->prepare("
            SELECT ad.id, ad.name, ad.role,
                   a.status, a.check_in_time, a.check_out_time,
                   fv.id as active_visit_id, fv.client_name as visit_client
            FROM admins ad
            LEFT JOIN crm_attendance a ON a.admin_id = ad.id AND a.attendance_date = CURRENT_DATE
            LEFT JOIN crm_field_visits fv ON fv.admin_id = ad.id AND fv.visit_date = CURRENT_DATE AND fv.checkout_time IS NULL
            WHERE ad.is_active = true
            ORDER BY ad.name
        ");
        $stmt->execute();
        $team = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $summary = ['checked_in' => 0, 'on_field' => 0, 'absent' => 0, 'on_leave' => 0, 'total' => count($team)];
        foreach ($team as &$member) {
            $member['time_in'] = $member['check_in_time'] ? date('h:i A', strtotime($member['check_in_time'])) : null;

            if ($member['active_visit_id'] || $member['status'] === 'field_visit') {
                $member['current_status'] = 'on_field';
                $summary['on_field']++;
            } elseif ($member['status'] === 'present' || $member['status'] === 'late' || $member['status'] === 'wfh' || $member['status'] === 'half_day') {
                $member['current_status'] = 'checked_in';
                $summary['checked_in']++;
            } elseif ($member['status'] === 'on_leave') {
                $member['current_status'] = 'on_leave';
                $summary['on_leave']++;
            } elseif ($member['status'] === 'holiday' || $member['status'] === 'week_off') {
                $member['current_status'] = 'holiday';
                // Not counting towards on_leave or absent
            } else {
                $member['current_status'] = 'absent';
                $summary['absent']++;
            }
        }

        jsonResponse(true, ['team' => $team, 'summary' => $summary]);
    }

    // ── My leave requests ───────────────────────────────────
    if ($action === 'my_leaves') {
        $stmt = $pdo->prepare("
            SELECT * FROM crm_leave_requests 
            WHERE admin_id = :admin_id 
            ORDER BY created_at DESC 
            LIMIT 50
        ");
        $stmt->execute([':admin_id' => $adminId]);
        $leaves = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(true, ['leaves' => $leaves]);
    }

    // ── My leave balance ────────────────────────────────────
    if ($action === 'leave_balance') {
        $targetId = isset($_GET['admin_id']) ? (int)$_GET['admin_id'] : $adminId;
        // Only admins can view others' balances
        if ($targetId !== $adminId) {
            requirePermission('attendance');
        }
        $balance = getLeaveBalance($pdo, $targetId);
        jsonResponse(true, ['balance' => $balance]);
    }

    // ── Team leave requests (admin only) ────────────────────
    if ($action === 'team_leaves') {
        requirePermission('attendance');
        $statusFilter = $_GET['status'] ?? null;

        $query = "
            SELECT l.*, a.name as employee_name, a.role, a.email as employee_email
            FROM crm_leave_requests l 
            LEFT JOIN admins a ON a.id = l.admin_id 
        ";
        $params = [];
        if ($statusFilter) {
            $query .= " WHERE l.status = :status ";
            $params[':status'] = $statusFilter;
        }
        $query .= " ORDER BY l.created_at DESC LIMIT 100";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $leaves = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(true, ['team_leaves' => $leaves]);
    }

    // ── Leave calendar (admin only) ─────────────────────────
    if ($action === 'leave_calendar') {
        requirePermission('attendance');
        $month = $_GET['month'] ?? date('Y-m');

        $stmt = $pdo->prepare("
            SELECT l.id, l.admin_id, l.leave_type, l.from_date, l.to_date, l.days_count, l.status,
                   a.name as employee_name
            FROM crm_leave_requests l 
            LEFT JOIN admins a ON a.id = l.admin_id
            WHERE l.status = 'approved'
              AND DATE_FORMAT(l.from_date, '%Y-%m') <= :month
              AND DATE_FORMAT(l.to_date, '%Y-%m') >= :month2
            ORDER BY l.from_date
        ");
        $stmt->execute([':month' => $month, ':month2' => $month]);
        $leaves = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Also fetch holidays for this month
        $hStmt = $pdo->prepare("
            SELECT * FROM crm_holidays 
            WHERE DATE_FORMAT(holiday_date, '%Y-%m') = :month AND is_active = 1
            ORDER BY holiday_date
        ");
        $hStmt->execute([':month' => $month]);
        $holidays = $hStmt->fetchAll(PDO::FETCH_ASSOC);

        jsonResponse(true, ['leaves' => $leaves, 'holidays' => $holidays, 'month' => $month]);
    }

    // ── Holidays list ───────────────────────────────────────
    if ($action === 'holidays') {
        $year = $_GET['year'] ?? date('Y');
        $stmt = $pdo->prepare("
            SELECT * FROM crm_holidays 
            WHERE YEAR(holiday_date) = :yr AND is_active = 1
            ORDER BY holiday_date
        ");
        $stmt->execute([':yr' => $year]);
        $holidays = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(true, ['holidays' => $holidays]);
    }

    // ── Monthly attendance report (admin only) ──────────────
    if ($action === 'monthly_report') {
        requirePermission('attendance');
        $month = $_GET['month'] ?? date('Y-m');
        $parts = explode('-', $month);
        $yr = (int)$parts[0];
        $mo = (int)$parts[1];
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $mo, $yr);

        // Get all active employees
        $userEmail = $_SESSION['admin_email'] ?? '';
        $whereClause = ($userEmail === 'cartoonfunonly@gmail.com') ? "" : "AND role != 'super_admin'";
        $empStmt = $pdo->prepare("SELECT id, name, role FROM admins WHERE is_active = true $whereClause ORDER BY name");
        $empStmt->execute();
        $employees = $empStmt->fetchAll(PDO::FETCH_ASSOC);

        // Get all attendance for this month
        $attStmt = $pdo->prepare("
            SELECT admin_id, attendance_date, status, check_in_time, check_out_time 
            FROM crm_attendance 
            WHERE DATE_FORMAT(attendance_date, '%Y-%m') = :month
        ");
        $attStmt->execute([':month' => $month]);
        $allAtt = $attStmt->fetchAll(PDO::FETCH_ASSOC);

        // Index attendance by admin_id -> date
        $attMap = [];
        foreach ($allAtt as $a) {
            $attMap[$a['admin_id']][$a['attendance_date']] = $a;
        }

        // Get approved leaves
        $leaveStmt = $pdo->prepare("
            SELECT admin_id, from_date, to_date, leave_type
            FROM crm_leave_requests 
            WHERE status = 'approved' AND from_date <= :end AND to_date >= :start
        ");
        $leaveStmt->execute([
            ':start' => "$yr-$mo-01",
            ':end' => "$yr-$mo-$daysInMonth"
        ]);
        $allLeaves = $leaveStmt->fetchAll(PDO::FETCH_ASSOC);

        // Build leave map by admin_id -> date
        $leaveMap = [];
        foreach ($allLeaves as $lv) {
            $start = max(new DateTime($lv['from_date']), new DateTime("$yr-$mo-01"));
            $end = min(new DateTime($lv['to_date']), new DateTime("$yr-$mo-$daysInMonth"));
            while ($start <= $end) {
                $leaveMap[$lv['admin_id']][$start->format('Y-m-d')] = $lv['leave_type'];
                $start->modify('+1 day');
            }
        }

        // Get holidays
        $holStmt = $pdo->prepare("
            SELECT holiday_date FROM crm_holidays 
            WHERE DATE_FORMAT(holiday_date, '%Y-%m') = :month AND is_active = 1
        ");
        $holStmt->execute([':month' => $month]);
        $holidayDates = array_column($holStmt->fetchAll(PDO::FETCH_ASSOC), 'holiday_date');

        // Build the report
        $report = [];
        foreach ($employees as $emp) {
            $row = [
                'id' => $emp['id'],
                'name' => $emp['name'],
                'role' => $emp['role'],
                'days' => [],
                'summary' => ['present' => 0, 'late' => 0, 'absent' => 0, 'leave' => 0, 'holiday' => 0, 'wfh' => 0, 'half_day' => 0, 'field_visit' => 0, 'total_hours' => 0]
            ];

            for ($d = 1; $d <= $daysInMonth; $d++) {
                $dateStr = sprintf('%04d-%02d-%02d', $yr, $mo, $d);
                $dayOfWeek = date('N', strtotime($dateStr)); // 7 = Sunday

                if (isset($leaveMap[$emp['id']][$dateStr])) {
                    $row['days'][$d] = 'L';
                    $row['summary']['leave']++;
                } elseif (isset($attMap[$emp['id']][$dateStr])) {
                    $att = $attMap[$emp['id']][$dateStr];
                    $status = strtoupper(substr($att['status'], 0, 1)); // P, L(ate), etc.
                    if ($att['status'] === 'present') { $row['days'][$d] = 'P'; $row['summary']['present']++; }
                    elseif ($att['status'] === 'late') { $row['days'][$d] = 'LT'; $row['summary']['late']++; }
                    elseif ($att['status'] === 'half_day') { $row['days'][$d] = 'HD'; $row['summary']['half_day']++; }
                    elseif ($att['status'] === 'wfh') { $row['days'][$d] = 'WFH'; $row['summary']['wfh']++; }
                    elseif ($att['status'] === 'field_visit') { $row['days'][$d] = 'FV'; $row['summary']['field_visit']++; }
                    elseif ($att['status'] === 'week_off') { $row['days'][$d] = 'WO'; }
                    elseif ($att['status'] === 'holiday') { $row['days'][$d] = 'H'; $row['summary']['holiday']++; }
                    elseif ($att['status'] === 'absent') { $row['days'][$d] = 'A'; $row['summary']['absent']++; }
                    else { $row['days'][$d] = 'P'; $row['summary']['present']++; }

                    $row['summary']['total_hours'] += calculateHours($att['check_in_time'], $att['check_out_time']);
                } elseif ($dayOfWeek == 7) {
                    $row['days'][$d] = 'H'; // Sunday is fixed holiday
                    $row['summary']['holiday']++;
                } elseif ($dayOfWeek == 6) {
                    $row['days'][$d] = 'WFH'; // Saturday is fixed WFH
                    $row['summary']['wfh']++;
                } elseif (in_array($dateStr, $holidayDates)) {
                    $row['days'][$d] = 'H';
                    $row['summary']['holiday']++;
                } elseif (strtotime($dateStr) <= time()) {
                    $row['days'][$d] = 'A'; // absent (past day, no record)
                    $row['summary']['absent']++;
                } else {
                    $row['days'][$d] = '-'; // future
                }
            }
            $row['summary']['total_hours'] = round($row['summary']['total_hours'], 1);
            $report[] = $row;
        }

        jsonResponse(true, [
            'report' => $report,
            'month' => $month,
            'days_in_month' => $daysInMonth,
            'holidays' => $holidayDates
        ]);
    }

    // ── Attendance settings (admin only) ────────────────────
    if ($action === 'settings') {
        requirePermission('attendance');
        $settings = [
            'office_start_time' => getSetting($pdo, 'office_start_time', '10:00'),
            'office_end_time' => getSetting($pdo, 'office_end_time', '19:00'),
            'half_day_hours' => getSetting($pdo, 'half_day_hours', '4'),
            'office_latitude' => getSetting($pdo, 'office_latitude', ''),
            'office_longitude' => getSetting($pdo, 'office_longitude', ''),
            'geofence_radius_meters' => getSetting($pdo, 'geofence_radius_meters', '200'),
            'casual_leave_quota' => getSetting($pdo, 'casual_leave_quota', '12'),
            'sick_leave_quota' => getSetting($pdo, 'sick_leave_quota', '12'),
            'earned_leave_quota' => getSetting($pdo, 'earned_leave_quota', '15'),
            'compensatory_leave_quota' => getSetting($pdo, 'compensatory_leave_quota', '5'),
            'unpaid_leave_quota' => getSetting($pdo, 'unpaid_leave_quota', '0'),
        ];
        jsonResponse(true, ['settings' => $settings]);
    }

    jsonResponse(false, null, 'Invalid action', 400);
}

// ================================================================
//   POST ENDPOINTS
// ================================================================
if ($method === 'POST') {
    // For file uploads, parse from $_POST; else JSON body
    $isMultipart = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false;
    $input = $isMultipart ? $_POST : getInput();

    // ── Check In ────────────────────────────────────────────
    if ($action === 'checkin') {
        // Check for existing record
        $stmt = $pdo->prepare("SELECT * FROM crm_attendance WHERE admin_id = :admin_id AND attendance_date = CURRENT_DATE");
        $stmt->execute([':admin_id' => $adminId]);
        if ($stmt->fetch()) {
            jsonResponse(false, null, 'Already checked in today.', 400);
        }

        $lat = isset($input['latitude']) ? (float)$input['latitude'] : null;
        $lng = isset($input['longitude']) ? (float)$input['longitude'] : null;
        $notes = sanitizeInput($input['notes'] ?? '', 'string');
        $statusOverride = sanitizeInput($input['status'] ?? '', 'string'); // e.g., 'wfh', 'field_visit'
        $selfiePath = handleSelfieUpload();

        // Detect status
        $status = $statusOverride ?: detectStatus($pdo, date('Y-m-d H:i:s'));

        $insertStmt = $pdo->prepare("
            INSERT INTO crm_attendance 
                (admin_id, attendance_date, check_in_time, check_in_latitude, check_in_longitude, status, selfie_path, notes) 
            VALUES 
                (:admin_id, CURRENT_DATE, NOW(), :lat, :lng, :status, :selfie, :notes)
        ");
        $insertStmt->execute([
            ':admin_id' => $adminId,
            ':lat' => $lat,
            ':lng' => $lng,
            ':status' => $status,
            ':selfie' => $selfiePath,
            ':notes' => $notes
        ]);

        logActivity($pdo, 'attendance_checkin', 'attendance', (string)$pdo->lastInsertId(), null, [
            'status' => $status, 'lat' => $lat, 'lng' => $lng
        ]);

        jsonResponse(true, [
            'status' => $status,
            'selfie_path' => $selfiePath,
            'message' => 'Checked in successfully as ' . ucfirst(str_replace('_', ' ', $status)) . '.'
        ]);
    }

    // ── Check Out ───────────────────────────────────────────
    if ($action === 'checkout') {
        $stmt = $pdo->prepare("SELECT * FROM crm_attendance WHERE admin_id = :admin_id AND attendance_date = CURRENT_DATE");
        $stmt->execute([':admin_id' => $adminId]);
        $attendance = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$attendance) {
            jsonResponse(false, null, 'Must check in first.', 400);
        }
        if ($attendance['check_out_time']) {
            jsonResponse(false, null, 'Already checked out today.', 400);
        }

        $lat = isset($input['latitude']) ? (float)$input['latitude'] : null;
        $lng = isset($input['longitude']) ? (float)$input['longitude'] : null;
        $notes = sanitizeInput($input['notes'] ?? '', 'string');

        // Determine if half day
        $hoursWorked = calculateHours($attendance['check_in_time'], date('Y-m-d H:i:s'));
        $halfDayThreshold = (float) getSetting($pdo, 'half_day_hours', 4);
        $finalStatus = $attendance['status'];
        if ($hoursWorked < $halfDayThreshold && $finalStatus !== 'wfh') {
            $finalStatus = 'half_day';
        }

        $updateStmt = $pdo->prepare("
            UPDATE crm_attendance 
            SET check_out_time = NOW(), 
                check_out_latitude = :lat, 
                check_out_longitude = :lng,
                status = :status,
                notes = CASE WHEN notes IS NULL OR notes = '' THEN :notes ELSE CONCAT(notes, ' | Checkout: ', :notes2) END,
                updated_at = NOW() 
            WHERE admin_id = :admin_id AND attendance_date = CURRENT_DATE
        ");
        $updateStmt->execute([
            ':lat' => $lat,
            ':lng' => $lng,
            ':status' => $finalStatus,
            ':notes' => $notes,
            ':notes2' => $notes,
            ':admin_id' => $adminId
        ]);

        logActivity($pdo, 'attendance_checkout', 'attendance', (string)$attendance['id'], null, [
            'hours_worked' => $hoursWorked, 'final_status' => $finalStatus
        ]);

        jsonResponse(true, [
            'hours_worked' => round($hoursWorked, 2),
            'status' => $finalStatus,
            'message' => 'Checked out. Total hours: ' . round($hoursWorked, 2)
        ]);
    }

    // ── Apply Leave ─────────────────────────────────────────
    if ($action === 'apply_leave') {
        $leaveType = sanitizeInput($input['leave_type'] ?? 'casual', 'string');
        $fromDate = sanitizeInput($input['from_date'] ?? '', 'string');
        $toDate = sanitizeInput($input['to_date'] ?? '', 'string');
        $reason = sanitizeInput($input['reason'] ?? '', 'string');
        $daysCount = (float)($input['days_count'] ?? 1);

        if (empty($fromDate) || empty($toDate) || empty($reason)) {
            jsonResponse(false, null, 'All fields are required.', 400);
        }

        // Check leave balance
        $balance = getLeaveBalance($pdo, $adminId);
        $typeBalance = array_filter($balance, fn($b) => $b['type'] === $leaveType);
        $typeBalance = reset($typeBalance);
        if ($typeBalance && $typeBalance['quota'] > 0 && $daysCount > $typeBalance['remaining']) {
            jsonResponse(false, null, "Insufficient $leaveType leave balance. Remaining: {$typeBalance['remaining']} days.", 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO crm_leave_requests (admin_id, leave_type, from_date, to_date, days_count, reason, status) 
            VALUES (:admin_id, :leave_type, :from_date, :to_date, :days_count, :reason, 'pending')
        ");
        $stmt->execute([
            ':admin_id' => $adminId,
            ':leave_type' => $leaveType,
            ':from_date' => $fromDate,
            ':to_date' => $toDate,
            ':days_count' => $daysCount,
            ':reason' => $reason
        ]);

        logActivity($pdo, 'leave_applied', 'leave', (string)$pdo->lastInsertId(), null, [
            'type' => $leaveType, 'from' => $fromDate, 'to' => $toDate
        ]);

        jsonResponse(true, null, 'Leave request submitted successfully.');
    }

    // ── Approve / Reject Leave (admin only) ─────────────────
    if ($action === 'approve_leave' || $action === 'reject_leave') {
        requirePermission('attendance');
        $leaveId = (int)($input['leave_id'] ?? 0);
        if (!$leaveId) jsonResponse(false, null, 'Leave ID required.', 400);

        $status = $action === 'approve_leave' ? 'approved' : 'rejected';
        $rejectionReason = sanitizeInput($input['rejection_reason'] ?? '', 'string');

        $stmt = $pdo->prepare("
            UPDATE crm_leave_requests 
            SET status = :status, approved_by = :approved_by, approved_at = NOW(), rejection_reason = :rejection_reason 
            WHERE id = :id
        ");
        $stmt->execute([
            ':status' => $status,
            ':approved_by' => $adminId,
            ':rejection_reason' => $status === 'rejected' ? $rejectionReason : null,
            ':id' => $leaveId
        ]);

        logActivity($pdo, 'leave_' . $status, 'leave', (string)$leaveId);

        jsonResponse(true, null, "Leave request $status successfully.");
    }

    // ── Save attendance settings (admin only) ───────────────
    if ($action === 'save_settings') {
        requirePermission('attendance');
        $settingsKeys = [
            'office_start_time', 'office_end_time', 'half_day_hours',
            'office_latitude', 'office_longitude', 'geofence_radius_meters',
            'casual_leave_quota', 'sick_leave_quota', 'earned_leave_quota',
            'compensatory_leave_quota', 'unpaid_leave_quota'
        ];

        foreach ($settingsKeys as $key) {
            if (isset($input[$key])) {
                $group = str_contains($key, 'leave') ? 'leave' : 'attendance';
                $stmt = $pdo->prepare("
                    INSERT INTO crm_app_settings (setting_key, setting_value, setting_group, updated_by) 
                    VALUES (:key, :val, :grp, :uid)
                    ON DUPLICATE KEY UPDATE setting_value = :val2, updated_by = :uid2
                ");
                $stmt->execute([
                    ':key' => $key, ':val' => $input[$key], ':grp' => $group, ':uid' => $adminId,
                    ':val2' => $input[$key], ':uid2' => $adminId
                ]);
            }
        }
        logActivity($pdo, 'settings_updated', 'attendance_settings');
        jsonResponse(true, null, 'Settings updated successfully.');
    }

    // ── Add Holiday (admin only) ────────────────────────────
    if ($action === 'add_holiday') {
        requirePermission('attendance');
        $title = sanitizeInput($input['title'] ?? '', 'string');
        $date = sanitizeInput($input['holiday_date'] ?? '', 'string');
        $type = sanitizeInput($input['holiday_type'] ?? 'company', 'string');

        if (empty($title) || empty($date)) {
            jsonResponse(false, null, 'Title and date are required.', 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO crm_holidays (title, holiday_date, holiday_type) 
            VALUES (:title, :date, :type)
            ON DUPLICATE KEY UPDATE title = :title2, holiday_type = :type2
        ");
        $stmt->execute([
            ':title' => $title, ':date' => $date, ':type' => $type,
            ':title2' => $title, ':type2' => $type
        ]);

        jsonResponse(true, null, 'Holiday added successfully.');
    }

    // ── Delete Holiday (admin only) ─────────────────────────
    if ($action === 'delete_holiday') {
        requirePermission('attendance');
        $id = (int)($input['id'] ?? 0);
        if (!$id) jsonResponse(false, null, 'Holiday ID required.', 400);

        $pdo->prepare("DELETE FROM crm_holidays WHERE id = :id")->execute([':id' => $id]);
        jsonResponse(true, null, 'Holiday deleted.');
    }

    // ── Admin Update Attendance (admin only) ────────────────
    if ($action === 'admin_update_attendance') {
        requirePermission('attendance');
        
        $targetAdminId = (int)($input['admin_id'] ?? 0);
        $date = sanitizeInput($input['attendance_date'] ?? '', 'string');
        $status = sanitizeInput($input['status'] ?? 'present', 'string');
        $checkIn = sanitizeInput($input['check_in_time'] ?? '', 'string');
        $checkOut = sanitizeInput($input['check_out_time'] ?? '', 'string');
        $notes = sanitizeInput($input['notes'] ?? '', 'string');

        if (!$targetAdminId || !$date) {
            jsonResponse(false, null, 'Employee and date are required.', 400);
        }

        $inDateTime = $checkIn ? "$date $checkIn" : null;
        $outDateTime = $checkOut ? "$date $checkOut" : null;

        $checkStmt = $pdo->prepare("SELECT id FROM crm_attendance WHERE admin_id = :aid AND attendance_date = :date");
        $checkStmt->execute([':aid' => $targetAdminId, ':date' => $date]);
        $existingId = $checkStmt->fetchColumn();

        if ($existingId) {
            $stmt = $pdo->prepare("
                UPDATE crm_attendance 
                SET check_in_time = :in, check_out_time = :out, status = :status, notes = :notes, updated_at = NOW()
                WHERE id = :id
            ");
            $stmt->execute([
                ':in' => $inDateTime, ':out' => $outDateTime, ':status' => $status, ':notes' => $notes, ':id' => $existingId
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO crm_attendance 
                    (admin_id, attendance_date, check_in_time, check_out_time, status, notes, updated_at) 
                VALUES 
                    (:aid, :date, :in, :out, :status, :notes, NOW())
            ");
            $stmt->execute([
                ':aid' => $targetAdminId, ':date' => $date, ':in' => $inDateTime, ':out' => $outDateTime, ':status' => $status, ':notes' => $notes
            ]);
        }

        logActivity($pdo, 'admin_updated_attendance', 'attendance', (string)$targetAdminId, null, [
            'date' => $date, 'status' => $status
        ]);

        jsonResponse(true, null, 'Attendance record updated successfully.');
    }

    // ── Bulk Mark Attendance (admin only) ──────────────────────
    if ($action === 'bulk_mark_attendance') {
        requirePermission('attendance');
        $date = sanitizeInput($input['attendance_date'] ?? '', 'string');
        $status = sanitizeInput($input['status'] ?? 'present', 'string');

        if (!$date) {
            jsonResponse(false, null, 'Date is required.', 400);
        }

        $startTime = getSetting($pdo, 'office_start_time', '10:00');
        $endTime = getSetting($pdo, 'office_end_time', '18:00');
        if (strlen($startTime) == 5) $startTime .= ":00";
        if (strlen($endTime) == 5) $endTime .= ":00";

        $checkIn = ($status === 'present' || $status === 'wfh' || $status === 'late' || $status === 'field_visit') ? "$date $startTime" : null;
        $checkOut = ($status === 'present' || $status === 'wfh' || $status === 'late' || $status === 'field_visit') ? "$date $endTime" : null;

        $empStmt = $pdo->query("SELECT id FROM admins WHERE is_active = 1");
        $employees = $empStmt->fetchAll(PDO::FETCH_ASSOC);

        $pdo->beginTransaction();
        try {
            $checkStmt = $pdo->prepare("SELECT id FROM crm_attendance WHERE admin_id = :aid AND attendance_date = :date");
            $insertStmt = $pdo->prepare("
                INSERT INTO crm_attendance (admin_id, attendance_date, check_in_time, check_out_time, status, notes, updated_at)
                VALUES (:aid, :date, :in, :out, :status, 'Bulk updated', NOW())
            ");

            foreach ($employees as $emp) {
                $checkStmt->execute([':aid' => $emp['id'], ':date' => $date]);
                if (!$checkStmt->fetchColumn()) {
                    $insertStmt->execute([
                        ':aid' => $emp['id'], ':date' => $date, ':in' => $checkIn, ':out' => $checkOut, ':status' => $status
                    ]);
                }
            }
            $pdo->commit();
            jsonResponse(true, null, 'Bulk attendance marked successfully.');
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(false, null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    jsonResponse(false, null, 'Invalid action', 400);
}

jsonResponse(false, null, 'Method not allowed', 405);
