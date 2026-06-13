<?php
// ============================================================
// CRM Team Tasks API
// GET /api/crm/team-tasks.php  POST  PUT
// ============================================================
require_once __DIR__ . '/../admin-guard.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $orderId = isset($_GET['order_id']) ? (int)$_GET['order_id'] : null;
    $status = trim($_GET['status'] ?? '');
    $assignedTo = trim($_GET['assigned_to'] ?? '');
    $dateFrom = trim($_GET['date_from'] ?? '');
    $dateTo = trim($_GET['date_to'] ?? '');

    $where = ['1=1']; $params = [];
    if ($orderId) { $where[] = 't.order_id = :oid'; $params[':oid'] = $orderId; }
    if (!empty($status)) { $where[] = 't.status = :st'; $params[':st'] = $status; }
    if (!empty($assignedTo)) { $where[] = 't.assigned_to LIKE :at'; $params[':at'] = '%'.$assignedTo.'%'; }
    if (!empty($dateFrom)) { $where[] = 't.task_date >= :df'; $params[':df'] = $dateFrom; }
    if (!empty($dateTo)) { $where[] = 't.task_date <= :dt'; $params[':dt'] = $dateTo; }
    $wc = implode(' AND ', $where);

    $sql = "SELECT t.*, o.order_number, l.customer_name, l.quotation_id,
            DATE_FORMAT(t.task_date, '%d %b %Y') AS task_date_formatted
            FROM crm_team_tasks t LEFT JOIN crm_orders o ON o.id = t.order_id
            LEFT JOIN crm_leads l ON l.id = o.lead_id WHERE $wc ORDER BY t.task_date ASC LIMIT 200";
    $stmt = $pdo->prepare($sql); $stmt->execute($params);
    jsonResponse(true, ['tasks' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    requireRole('owner', 'manager', 'operations');
    $input = getInput();
    $orderId = isset($input['order_id']) ? (int)$input['order_id'] : null;
    $assignedTo = sanitizeInput($input['assigned_to'] ?? '', 'string');
    $taskDesc = sanitizeInput($input['task_description'] ?? '', 'string');
    $taskDate = sanitizeInput($input['task_date'] ?? date('Y-m-d'), 'date');
    if (empty($assignedTo) || empty($taskDesc)) jsonResponse(false, null, 'Assigned to and task description required.', 400);

    $pdo->prepare("INSERT INTO crm_team_tasks (order_id, assigned_to, task_description, task_date) VALUES (:oid,:at,:td,:tdate)")
        ->execute([':oid'=>$orderId, ':at'=>$assignedTo, ':td'=>$taskDesc, ':tdate'=>$taskDate]);
    
    $taskId = (int)$pdo->lastInsertId();

    // Send Email Notification
    $stmt = $pdo->prepare("SELECT email FROM admins WHERE name = :name LIMIT 1");
    $stmt->execute([':name' => $assignedTo]);
    $user = $stmt->fetch();

    if ($user && !empty($user['email'])) {
        $resendApiKey = $_ENV['RESEND_API_KEY'] ?? '';
        if ($resendApiKey) {
            $orderInfo = $orderId ? "Order ID: $orderId" : "No specific order";
            $html = "
                <div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:10px;'>
                    <h2 style='color:#6366F1;'>New Task Assigned</h2>
                    <p>Hello <strong>$assignedTo</strong>,</p>
                    <p>A new task has been assigned to you in the CRM.</p>
                    <div style='background:#f8fafc;padding:15px;border-radius:8px;margin:20px 0;'>
                        <p><strong>Task:</strong> $taskDesc</p>
                        <p><strong>Due Date:</strong> $taskDate</p>
                        <p><strong>Context:</strong> $orderInfo</p>
                    </div>
                    <p>Please log in to the CRM to view details and update the status.</p>
                </div>
            ";
            
            $ch = curl_init('https://api.resend.com/emails');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'from' => 'Panya Global CRM <' . ($_ENV['SMTP_FROM_EMAIL'] ?? 'info@panyaglobal.in') . '>',
                'to' => $user['email'],
                'subject' => 'New CRM Task Assigned: ' . substr($taskDesc, 0, 30) . '...',
                'html' => $html
            ]));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $resendApiKey,
                'Content-Type: application/json'
            ]);
            curl_exec($ch);
            curl_close($ch);
        }
    }

    jsonResponse(true, ['id' => $taskId], null, 201);
}

if ($method === 'PUT') {
    requireRole('owner', 'manager');
    $input = getInput();
    $id = (int)($input['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Task ID required.', 400);

    $updateFields = []; $params = [':id' => $id];
    foreach (['assigned_to','task_description','task_date','status'] as $f) {
        if (array_key_exists($f, $input)) { $updateFields[] = "$f = :$f"; $params[":$f"] = $input[$f]; }
    }
    if (isset($input['status']) && $input['status'] === 'completed') $updateFields[] = "completed_at = NOW()";
    if (empty($updateFields)) jsonResponse(false, null, 'No fields to update.', 400);

    $pdo->prepare("UPDATE crm_team_tasks SET " . implode(', ', $updateFields) . " WHERE id = :id")->execute($params);
    jsonResponse(true, ['id' => $id, 'updated' => true]);
}

jsonResponse(false, null, 'Method not allowed', 405);
