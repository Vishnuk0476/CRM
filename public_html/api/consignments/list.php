<?php
// ============================================================
// GET /api/consignments/list.php
// Admin: List all consignments with filters
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$search = trim($_GET['search'] ?? '');
$status = trim($_GET['status'] ?? '');
$id     = trim($_GET['id']     ?? '');
$limit  = max(1, min(200, (int)($_GET['limit'] ?? 50)));
$offset = max(0, (int)($_GET['offset'] ?? 0));

$where  = [];
$params = [];

if (!empty($id)) {
    $where[]      = 'id = :id';
    $params[':id'] = $id;
}

if (!empty($search)) {
    // Use MySQL FULLTEXT index for lightning-fast search
    // Using BOOLEAN MODE allows partial matches if configured or full word matches
    $where[] = 'MATCH(consignment_number, lr_number, awb_number, customer_name, customer_email, customer_phone, origin, destination, consignor_name) AGAINST(:search IN BOOLEAN MODE)';
    // Append wildcard for boolean search to simulate "starts with" or partial matching
    $params[':search'] = $search . '*';
}

if (!empty($status)) {
    $where[]          = 'status = :status';
    $params[':status'] = $status;
}

$whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

// Count
$countStmt = $pdo->prepare("SELECT COUNT(*) FROM consignments $whereClause");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

// Fetch
$params[':limit']  = $limit;
$params[':offset'] = $offset;

$stmt = $pdo->prepare("
    SELECT
        id, consignment_number, lr_number, awb_number,
        consignor_name, consignor_address, consignee_address, packages_count,
        customer_name, customer_email, customer_phone,
        origin, destination, service_type, status, estimated_delivery,
        last_email_status, last_email_error, last_email_sent_at,
        created_at, updated_at
    FROM consignments
    $whereClause
    ORDER BY created_at DESC
    LIMIT :limit OFFSET :offset
");

foreach ($params as $key => $val) {
    if (in_array($key, [':limit', ':offset'])) {
        $stmt->bindValue($key, $val, PDO::PARAM_INT);
    } else {
        $stmt->bindValue($key, $val);
    }
}
$stmt->execute();
$rows = $stmt->fetchAll();

$statusLabels = [
    'booked'            => 'Booking Confirmed',
    'picked_up'         => 'Picked Up',
    'in_transit'        => 'In Transit',
    'out_for_delivery'  => 'Out for Delivery',
    'delivered'         => 'Delivered',
    'cancelled'         => 'Cancelled',
];

foreach ($rows as &$row) {
    $row['status_label'] = $statusLabels[$row['status']] ?? ucfirst(str_replace('_', ' ', $row['status']));
    $row['estimated_delivery_formatted'] = $row['estimated_delivery']
        ? date('M d, Y', strtotime($row['estimated_delivery']))
        : null;
    $row['created_at_formatted'] = date('M d, Y', strtotime($row['created_at']));
}

jsonResponse(true, [
    'consignments' => $rows,
    'total'        => $total,
    'limit'        => $limit,
    'offset'       => $offset,
]);
?>
