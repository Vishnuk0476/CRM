<?php
// ============================================================
// CRM Call Logs API — Track customer calls
// GET /api/crm/call-logs.php  POST
// ============================================================
require_once __DIR__ . '/../admin-guard.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $leadId = isset($_GET['lead_id']) ? (int)$_GET['lead_id'] : null;
    $where = ['1=1']; $params = [];
    $role = $_SESSION['admin_role'] ?? '';
    if ($role === 'salesperson') {
        $where[] = 'c.salesperson_id = :my_id';
        $params[':my_id'] = $_SESSION['admin_id'];
    }
    if ($leadId) { $where[] = 'c.lead_id = :lid'; $params[':lid'] = $leadId; }
    $wc = implode(' AND ', $where);
    $sql = "SELECT c.*, l.customer_name, l.quotation_id, a.name AS salesperson_name,
            DATE_FORMAT(c.created_at, '%d %b %Y, %h:%i %p') AS created_at_formatted
            FROM crm_call_logs c JOIN crm_leads l ON l.id = c.lead_id
            LEFT JOIN admins a ON a.id = c.salesperson_id WHERE $wc ORDER BY c.created_at DESC LIMIT 100";
    $stmt = $pdo->prepare($sql); $stmt->execute($params);
    jsonResponse(true, ['call_logs' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    requireRole('owner', 'manager', 'salesperson');
    $input = getInput();
    $leadId = (int)($input['lead_id'] ?? 0);
    if (!$leadId) jsonResponse(false, null, 'Lead ID required.', 400);
    $spId = $_SESSION['admin_id'] ?? null;
    $callType = $input['call_type'] ?? 'outgoing';
    $duration = isset($input['duration_minutes']) ? (int)$input['duration_minutes'] : null;
    $notes = sanitizeInput($input['notes'] ?? null, 'string');

    $pdo->prepare("INSERT INTO crm_call_logs (lead_id, salesperson_id, call_type, duration_minutes, notes) VALUES (:lid,:sid,:ct,:dur,:n)")
        ->execute([':lid'=>$leadId, ':sid'=>$spId, ':ct'=>$callType, ':dur'=>$duration, ':n'=>$notes]);
    jsonResponse(true, ['id' => (int)$pdo->lastInsertId()], null, 201);
}

jsonResponse(false, null, 'Method not allowed', 405);
