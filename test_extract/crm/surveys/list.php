<?php
require_once '../../config.php';
require_once '../../admin-guard.php';
require_once '../../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    requirePermission('surveys');
    
    $status = $_GET['status'] ?? '';
    $teamLead = $_GET['team_lead'] ?? '';
    $date = $_GET['date'] ?? '';
    $limit = (int)($_GET['limit'] ?? 50);
    $offset = (int)($_GET['offset'] ?? 0);
    
    $where = ["1=1"];
    $params = [];
    
    if ($status) {
        $where[] = "s.survey_status = :status";
        $params[':status'] = $status;
    }
    if ($teamLead) {
        $where[] = "s.team_lead_id = :lead";
        $params[':lead'] = $teamLead;
    }
    if ($date) {
        $where[] = "s.scheduled_date = :sdate";
        $params[':sdate'] = $date;
    }
    
    // Role based visibility
    $role = $_SESSION['admin_role'] ?? '';
    if ($role === 'field_executive') {
        $where[] = "s.team_lead_id = :self";
        $params[':self'] = $_SESSION['admin_id'];
    }
    
    $whereClause = implode(' AND ', $where);
    
    $sql = "
        SELECT s.*,
               a.name AS team_lead_name,
               DATE_FORMAT(s.scheduled_date, '%d %b %Y') AS scheduled_date_formatted
        FROM crm_surveys s
        LEFT JOIN admins a ON a.id = s.team_lead_id
        WHERE $whereClause
        ORDER BY s.scheduled_date ASC, s.scheduled_time ASC
        LIMIT $limit OFFSET $offset
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $surveys = $stmt->fetchAll();
    
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_surveys s WHERE $whereClause");
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();
    
    jsonResponse(true, [
        'surveys' => $surveys,
        'total' => $total
    ]);
} else {
    jsonResponse(false, null, 'Method not allowed.', 405);
}
