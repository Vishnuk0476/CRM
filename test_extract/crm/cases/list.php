<?php
// ============================================================
// CRM Cases — List endpoint (thin wrapper around cases.php GET)
// GET /api/crm/cases/list.php
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';

$search  = trim($_GET['search'] ?? '');
$status  = trim($_GET['status'] ?? '');
$limit   = min(max((int)($_GET['limit'] ?? 100), 1), 500);
$offset  = max((int)($_GET['offset'] ?? 0), 0);

$where  = ['1=1'];
$params = [];

if ($status) {
    $where[] = 'c.case_status = :status';
    $params[':status'] = $status;
}
if ($search) {
    $like = '%' . str_replace(['%','_'],['\\%','\\_'],$search) . '%';
    $where[] = '(c.client_name LIKE :search OR c.client_phone LIKE :search2 OR c.case_number LIKE :search3)';
    $params[':search'] = $like;
    $params[':search2'] = $like;
    $params[':search3'] = $like;
}

$whereClause = implode(' AND ', $where);

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_cases c WHERE $whereClause");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

$stmt = $pdo->prepare("
    SELECT c.*, a.name AS consultant_name
    FROM crm_cases c
    LEFT JOIN admins a ON a.id = c.assigned_consultant_id
    WHERE $whereClause
    ORDER BY c.created_at DESC
    LIMIT :limit OFFSET :offset
");
foreach ($params as $k => $v) $stmt->bindValue($k, $v);
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$cases = $stmt->fetchAll();

jsonResponse(true, ['cases' => $cases, 'total' => $total]);
