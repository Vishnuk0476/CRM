<?php
// ============================================================
// CRM Orders API — CRUD for orders (confirmed leads)
// GET    /api/crm/orders.php              → List orders
// GET    /api/crm/orders.php?id=X         → Single order detail
// POST   /api/crm/orders.php              → Convert lead → order
// PUT    /api/crm/orders.php              → Update order
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];

// ─── GET — List or single ────────────────────────────────────
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

    if ($id) {
        $stmt = $pdo->prepare("
            SELECT o.*, c.case_number as quotation_id, c.client_name as customer_name, c.client_phone as phone, c.client_email as email,
                   c.origin_city as pickup_city, c.destination_city as drop_city, c.total_quoted as estimated_amount,
                   v.vehicle_number, d.name AS driver_name, d.phone AS driver_phone
            FROM crm_orders o
            JOIN crm_cases c ON c.id = o.case_id
            LEFT JOIN crm_vehicles v ON v.id = o.vehicle_id
            LEFT JOIN crm_drivers d ON d.id = o.driver_id
            WHERE o.id = :id
        ");
        $stmt->execute([':id' => $id]);
        $order = $stmt->fetch();
        if (!$order) jsonResponse(false, null, 'Order not found', 404);

        // Get invoices
        $iStmt = $pdo->prepare("SELECT * FROM crm_invoices WHERE order_id = :oid ORDER BY created_at DESC");
        $iStmt->execute([':oid' => $id]);
        $order['invoices'] = $iStmt->fetchAll();

        // Get team tasks
        $tStmt = $pdo->prepare("SELECT * FROM crm_team_tasks WHERE order_id = :oid ORDER BY task_date ASC");
        $tStmt->execute([':oid' => $id]);
        $order['tasks'] = $tStmt->fetchAll();

        jsonResponse(true, ['order' => $order]);
    }

    // List
    $status  = trim($_GET['status'] ?? '');
    $search  = trim($_GET['search'] ?? '');
    $limit   = min(max((int)($_GET['limit'] ?? 50), 1), 200);
    $offset  = max((int)($_GET['offset'] ?? 0), 0);

    $where  = ['1=1'];
    $params = [];

    if (!empty($status)) {
        $where[] = 'o.status = :status';
        $params[':status'] = $status;
    }
    if (!empty($search)) {
        $escaped = str_replace(['%', '_'], ['\\%', '\\_'], $search);
        $where[] = "(c.client_name LIKE :search OR o.order_number LIKE :search OR c.case_number LIKE :search)";
        $params[':search'] = '%' . $escaped . '%';
    }

    // Role-based: salesperson sees only their orders
    $currentRole = $_SESSION['admin_role'] ?? '';
    if ($currentRole === 'salesperson') {
        $where[] = 'c.assigned_consultant_id = :my_id';
        $params[':my_id'] = $_SESSION['admin_id'];
    }

    $whereClause = implode(' AND ', $where);

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_orders o JOIN crm_cases c ON c.id = o.case_id WHERE $whereClause");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $sql = "
        SELECT o.*, c.case_number as quotation_id, c.client_name as customer_name, c.client_phone as phone, c.client_email as email,
               c.origin_city as pickup_city, c.destination_city as drop_city, c.total_quoted as estimated_amount,
               a.name AS salesperson_name,
               DATE_FORMAT(o.created_at, '%d %b %Y') AS created_at_formatted,
               DATE_FORMAT(o.eta, '%d %b %Y') AS eta_formatted
        FROM crm_orders o
        JOIN crm_cases c ON c.id = o.case_id
        LEFT JOIN admins a ON a.id = c.assigned_consultant_id
        WHERE $whereClause
        ORDER BY o.created_at DESC
        LIMIT $limit OFFSET $offset
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();

    // Status counts
    $cSql = "
        SELECT
            COUNT(*) AS total,
            SUM(o.status = 'scheduled')  AS scheduled,
            SUM(o.status = 'packing')    AS packing,
            SUM(o.status = 'in_transit') AS in_transit,
            SUM(o.status = 'delivered')  AS delivered,
            SUM(o.status = 'completed')  AS completed,
            SUM(o.status = 'cancelled')  AS cancelled
        FROM crm_orders o
        JOIN crm_cases c ON c.id = o.case_id
        WHERE $whereClause
    ";
    $cStmt = $pdo->prepare($cSql);
    $cStmt->execute($params);
    $counts = $cStmt->fetch();

    jsonResponse(true, [
        'orders' => $orders,
        'counts' => $counts,
        'pagination' => ['total' => $total, 'limit' => $limit, 'offset' => $offset],
    ]);
}

// ─── POST — Convert lead to order ────────────────────────────
if ($method === 'POST') {
    requireRole('owner', 'manager', 'salesperson');
    $input = getInput();

    $leadId = (int)($input['lead_id'] ?? 0);
    if (!$leadId) jsonResponse(false, null, 'Lead ID is required.', 400);

    // Check lead exists and is confirmed
    $lStmt = $pdo->prepare("SELECT * FROM crm_leads WHERE id = :id");
    $lStmt->execute([':id' => $leadId]);
    $lead = $lStmt->fetch();
    if (!$lead) jsonResponse(false, null, 'Lead not found.', 404);

    // Check no duplicate order
    $dupCheck = $pdo->prepare("SELECT id FROM crm_orders WHERE lead_id = :lid");
    $dupCheck->execute([':lid' => $leadId]);
    if ($dupCheck->fetch()) jsonResponse(false, null, 'Order already exists for this lead.', 409);

    // Generate order number: ORD-YYYYMMDD-NNN
    $today = date('Ymd');
    $cntStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_orders WHERE DATE(created_at) = CURDATE()");
    $cntStmt->execute();
    $dayCount = (int)$cntStmt->fetchColumn() + 1;
    $orderNumber = "ORD-{$today}-" . str_pad($dayCount, 3, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("
        INSERT INTO crm_orders
            (lead_id, order_number, pickup_address, pickup_floor, pickup_lift,
             drop_address, drop_floor, drop_lift, eta, team_assigned, special_instructions, status)
        VALUES
            (:lead_id, :order_num, :pickup_addr, :pickup_floor, :pickup_lift,
             :drop_addr, :drop_floor, :drop_lift, :eta, :team, :instructions, 'scheduled')
    ");
    $stmt->execute([
        ':lead_id'      => $leadId,
        ':order_num'    => $orderNumber,
        ':pickup_addr'  => sanitizeInput($input['pickup_address'] ?? null, 'string'),
        ':pickup_floor' => sanitizeInput($input['pickup_floor'] ?? null, 'string'),
        ':pickup_lift'  => $input['pickup_lift'] ?? 'na',
        ':drop_addr'    => sanitizeInput($input['drop_address'] ?? null, 'string'),
        ':drop_floor'   => sanitizeInput($input['drop_floor'] ?? null, 'string'),
        ':drop_lift'    => $input['drop_lift'] ?? 'na',
        ':eta'          => sanitizeInput($input['eta'] ?? null, 'date'),
        ':team'         => sanitizeInput($input['team_assigned'] ?? null, 'string'),
        ':instructions' => sanitizeInput($input['special_instructions'] ?? null, 'string'),
    ]);

    $orderId = (int)$pdo->lastInsertId();

    // Update lead status to confirmed
    $pdo->prepare("UPDATE crm_leads SET status = 'confirmed' WHERE id = :id")->execute([':id' => $leadId]);

    logActivity($pdo, 'CRM_ORDER_CREATED', 'crm_order', (string)$orderId, $orderNumber, [
        'lead_id'       => $leadId,
        'quotation_id'  => $lead['quotation_id'],
        'customer_name' => $lead['customer_name'],
    ]);

    jsonResponse(true, ['id' => $orderId, 'order_number' => $orderNumber], null, 201);
}

// ─── PUT — Update order ──────────────────────────────────────
if ($method === 'PUT') {
    requireRole('owner', 'manager', 'salesperson');
    $input = getInput();
    $id = (int)($input['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Order ID is required.', 400);

    $allowed = [
        'pickup_address', 'pickup_floor', 'pickup_lift',
        'drop_address', 'drop_floor', 'drop_lift',
        'eta', 'team_assigned', 'special_instructions', 'status',
        'tracking_steps', 'loaded_from_city', 'out_for_delivery_city',
        'lr_number', 'packages_count', 'consignor_name', 'consignor_address', 'lr_pdf_path',
        'vehicle_id', 'driver_id', 'customer_signature', 'driver_signature'
    ];

    $updateFields = [];
    $params = [':id' => $id];
    foreach ($allowed as $field) {
        if (array_key_exists($field, $input)) {
            $updateFields[] = "$field = :$field";
            $params[":$field"] = $input[$field];
        }
    }

    if (empty($updateFields)) jsonResponse(false, null, 'No fields to update.', 400);

    $sql = "UPDATE crm_orders SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $pdo->prepare($sql)->execute($params);

    // If order status changed to in_transit, update case status too
    if (isset($input['status'])) {
        $statusMap = [
            'in_transit' => 'in_transit',
            'delivered'  => 'delivered',
            'completed'  => 'delivered',
        ];
        if (isset($statusMap[$input['status']])) {
            $pdo->prepare("UPDATE crm_cases SET milestone = :ls WHERE id = (SELECT case_id FROM crm_orders WHERE id = :oid)")
                ->execute([':ls' => $statusMap[$input['status']], ':oid' => $id]);
        }
    }

    logActivity($pdo, 'CRM_ORDER_UPDATED', 'crm_order', (string)$id);
    jsonResponse(true, ['id' => $id, 'updated' => true]);
}

jsonResponse(false, null, 'Method not allowed', 405);
