<?php
// ============================================================
// CRM Follow-ups API
// GET    /api/crm/followups.php              → List followups
// POST   /api/crm/followups.php              → Create followup
// PUT    /api/crm/followups.php              → Update (complete/snooze)
// DELETE /api/crm/followups.php?id=X         → Delete
// ============================================================
require_once __DIR__ . '/../admin-guard.php';
require_once __DIR__ . '/helpers/activity.php';

$method = $_SERVER['REQUEST_METHOD'];

// ─── GET ─────────────────────────────────────────────────────
if ($method === 'GET') {
    $adminId  = $_SESSION['admin_id'] ?? 0;
    $role     = $_SESSION['admin_role'] ?? 'consultant';
    $status   = trim($_GET['status'] ?? 'pending');
    $filter   = trim($_GET['filter'] ?? ''); // today, overdue, upcoming
    $limit    = min(max((int)($_GET['limit'] ?? 50), 1), 200);
    $offset   = max((int)($_GET['offset'] ?? 0), 0);

    $where  = ['1=1'];
    $params = [];

    // Role-based: non-admin only see own followups
    if (!in_array($role, ['owner','super_admin','manager'])) {
        $where[] = 'f.assigned_to = :admin_id';
        $params[':admin_id'] = $adminId;
    }

    if ($status && $status !== 'all') {
        $where[] = 'f.status = :status';
        $params[':status'] = $status;
    }

    $today = date('Y-m-d');
    if ($filter === 'overdue') {
        $where[] = "DATE(f.scheduled_at) < '$today' AND f.status = 'pending'";
    } elseif ($filter === 'today') {
        $where[] = "DATE(f.scheduled_at) = '$today'";
    } elseif ($filter === 'upcoming') {
        $where[] = "DATE(f.scheduled_at) > '$today' AND f.status = 'pending'";
    }

    $whereClause = implode(' AND ', $where);

    // Summary counts
    $stmtOverdue = $pdo->prepare("SELECT COUNT(*) FROM crm_followups f WHERE f.status='pending' AND DATE(f.scheduled_at) < :today");
    $stmtOverdue->execute([':today' => $today]);
    $overdue = (int)$stmtOverdue->fetchColumn();

    $stmtToday = $pdo->prepare("SELECT COUNT(*) FROM crm_followups f WHERE DATE(f.scheduled_at) = :today AND f.status='pending'");
    $stmtToday->execute([':today' => $today]);
    $todayCount = (int)$stmtToday->fetchColumn();

    $stmtUpcoming = $pdo->prepare("SELECT COUNT(*) FROM crm_followups f WHERE f.status='pending' AND DATE(f.scheduled_at) > :today");
    $stmtUpcoming->execute([':today' => $today]);
    $upcoming = (int)$stmtUpcoming->fetchColumn();

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_followups f WHERE $whereClause");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT f.*,
               la.customer_name AS lead_name,
               ca.client_name AS case_client_name,
               ca.case_number,
               aa.name AS assigned_to_name
        FROM crm_followups f
        LEFT JOIN crm_leads la ON la.id = f.lead_id
        LEFT JOIN crm_cases ca ON ca.id = f.case_id
        LEFT JOIN admins aa ON aa.id = f.assigned_to
        WHERE $whereClause
        ORDER BY f.scheduled_at ASC
        LIMIT :limit OFFSET :offset
    ");
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    // Enrich with human-readable date
    foreach ($rows as &$row) {
        $ts = strtotime($row['scheduled_at']);
        $row['scheduled_date_human'] = date('d M Y, g:i A', $ts);
        $row['is_overdue'] = ($row['status'] === 'pending' && date('Y-m-d', $ts) < $today);
        $row['is_today']   = (date('Y-m-d', $ts) === $today);
    }
    unset($row);

    jsonResponse(true, [
        'followups' => $rows,
        'total'     => $total,
        'summary'   => ['overdue' => $overdue, 'today' => $todayCount, 'upcoming' => $upcoming],
    ]);
}

// ─── POST — Create ───────────────────────────────────────────
if ($method === 'POST') {
    $input   = json_decode(file_get_contents('php://input'), true) ?? [];
    $adminId = $_SESSION['admin_id'] ?? 0;

    $scheduledAt = trim($input['scheduled_at'] ?? '');
    if (!$scheduledAt) jsonResponse(false, null, 'scheduled_at is required', 400);

    $stmt = $pdo->prepare("
        INSERT INTO crm_followups 
            (lead_id, case_id, assigned_to, followup_type, custom_message, scheduled_at, status, created_by, created_at, updated_at)
        VALUES 
            (:lid, :cid, :at, :type, :msg, :sa, 'pending', :created_by, NOW(), NOW())
    ");
    $stmt->execute([
        ':lid'        => !empty($input['lead_id']) ? (int)$input['lead_id'] : null,
        ':cid'        => !empty($input['case_id']) ? (int)$input['case_id'] : null,
        ':at'         => !empty($input['assigned_to']) ? (int)$input['assigned_to'] : $adminId,
        ':type'       => $input['followup_type'] ?? 'call',
        ':msg'        => $input['custom_message'] ?? '',
        ':sa'         => $scheduledAt,
        ':created_by' => $adminId,
    ]);
    $newId = $pdo->lastInsertId();

    logCrmActivity($pdo, $input['lead_id'] ?? null, $input['case_id'] ?? null, $adminId,
        'followup_scheduled', 'Follow-up Scheduled', "Scheduled " . ($input['followup_type'] ?? 'call') . " for " . date('d M Y', strtotime($scheduledAt)));

    jsonResponse(true, ['id' => $newId], 'Follow-up scheduled.');
}

// ─── PUT — Update (complete / snooze / reschedule) ───────────
if ($method === 'PUT') {
    $input   = json_decode(file_get_contents('php://input'), true) ?? [];
    $adminId = $_SESSION['admin_id'] ?? 0;
    $id      = (int)($input['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Follow-up ID required', 400);

    $newStatus = $input['status'] ?? '';

    if ($newStatus === 'completed') {
        $pdo->prepare("UPDATE crm_followups SET status='completed', completed_at=NOW(), outcome=:out, updated_at=NOW() WHERE id=:id")
            ->execute([':id'=>$id, ':out'=>$input['outcome']??'']);
    } elseif ($newStatus === 'snoozed' && !empty($input['snooze_until'])) {
        $pdo->prepare("UPDATE crm_followups SET status='snoozed', snooze_until=:su, updated_at=NOW() WHERE id=:id")
            ->execute([':id'=>$id, ':su'=>$input['snooze_until']]);
    } else {
        $pdo->prepare("
            UPDATE crm_followups SET 
                followup_type = COALESCE(:type, followup_type),
                custom_message = COALESCE(:msg, custom_message),
                scheduled_at = COALESCE(:sa, scheduled_at),
                assigned_to = COALESCE(:at, assigned_to),
                outcome = COALESCE(:out, outcome),
                updated_at = NOW()
            WHERE id = :id
        ")->execute([
            ':id'   => $id,
            ':type' => $input['followup_type'] ?? null,
            ':msg'  => $input['custom_message'] ?? null,
            ':sa'   => $input['scheduled_at'] ?? null,
            ':at'   => !empty($input['assigned_to']) ? (int)$input['assigned_to'] : null,
            ':out'  => $input['outcome'] ?? null,
        ]);
    }

    jsonResponse(true, null, 'Follow-up updated.');
}

// ─── DELETE ──────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Follow-up ID required', 400);
    $pdo->prepare("DELETE FROM crm_followups WHERE id=:id")->execute([':id'=>$id]);
    jsonResponse(true, null, 'Follow-up deleted.');
}

jsonResponse(false, null, 'Method not allowed', 405);
