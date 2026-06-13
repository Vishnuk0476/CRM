<?php
// ============================================================
// GET — /api/crm/quotations/list.php
// List and filter quotations
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

$status = $_GET['status'] ?? null;
$caseId = $_GET['case_id'] ?? null;
$search = $_GET['search'] ?? null;
$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

$query = "SELECT q.*, 
    DATEDIFF(NOW(), q.sent_at) as days_since_sent,
    (q.status = 'sent' AND q.valid_until BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 DAY)) as is_expiring_soon
    FROM crm_quotations q WHERE 1=1";
$params = [];

if ($status) {
    $query .= " AND q.status = :status";
    $params['status'] = $status;
}

if ($caseId) {
    $query .= " AND q.case_id = :case_id";
    $params['case_id'] = $caseId;
}

if ($search) {
    $query .= " AND (q.quotation_number LIKE :search OR q.client_name LIKE :search)";
    $params['search'] = '%' . $search . '%';
}

if ($startDate) {
    $query .= " AND q.quotation_date >= :start_date";
    $params['start_date'] = $startDate;
}

if ($endDate) {
    $query .= " AND q.quotation_date <= :end_date";
    $params['end_date'] = $endDate;
}

$countQuery = preg_replace('/SELECT q\.\*, .* FROM/', 'SELECT COUNT(q.id) FROM', $query);
$stmtCount = $pdo->prepare($countQuery);
$stmtCount->execute($params);
$total = $stmtCount->fetchColumn();

$query .= " ORDER BY q.id DESC LIMIT :limit OFFSET :offset";
$stmt = $pdo->prepare($query);
foreach ($params as $key => $val) {
    $stmt->bindValue(':' . $key, $val);
}
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();

$results = $stmt->fetchAll();

jsonResponse(true, [
    'data' => $results,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
        'total_pages' => ceil($total / $limit)
    ]
]);
