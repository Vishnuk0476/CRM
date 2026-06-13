<?php
// ============================================================
// CRM Packing Lists API — Digital Packing Inventory per Order
// GET /api/crm/packing-lists.php?order_id=X
// POST /api/crm/packing-lists.php  (save/update packing list)
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $orderId = (int)($_GET['order_id'] ?? 0);
    if (!$orderId) jsonResponse(false, null, 'order_id required', 400);

    $stmt = $pdo->prepare("SELECT * FROM crm_packing_lists WHERE order_id = :oid ORDER BY updated_at DESC LIMIT 1");
    $stmt->execute([':oid' => $orderId]);
    $list = $stmt->fetch();

    jsonResponse(true, [
        'packing_list' => $list ? [
            'id' => (int)$list['id'],
            'order_id' => (int)$list['order_id'],
            'items' => json_decode($list['items_json'], true),
            'updated_at' => $list['updated_at'],
        ] : null
    ]);
}

if ($method === 'POST') {
    requireRole('owner', 'manager', 'operations', 'salesperson');
    $input = getInput();

    $orderId = (int)($input['order_id'] ?? 0);
    $items = $input['items'] ?? [];
    if (!$orderId) jsonResponse(false, null, 'order_id required', 400);

    // Verify order exists
    $check = $pdo->prepare("SELECT id FROM crm_orders WHERE id = :id");
    $check->execute([':id' => $orderId]);
    if (!$check->fetch()) jsonResponse(false, null, 'Order not found', 404);

    $itemsJson = json_encode($items, JSON_UNESCAPED_UNICODE);

    // Upsert: if packing list exists for this order, update it; otherwise insert
    $existing = $pdo->prepare("SELECT id FROM crm_packing_lists WHERE order_id = :oid");
    $existing->execute([':oid' => $orderId]);
    $row = $existing->fetch();

    if ($row) {
        $pdo->prepare("UPDATE crm_packing_lists SET items_json = :items WHERE id = :id")
            ->execute([':items' => $itemsJson, ':id' => $row['id']]);
        $listId = (int)$row['id'];
    } else {
        $pdo->prepare("INSERT INTO crm_packing_lists (order_id, items_json) VALUES (:oid, :items)")
            ->execute([':oid' => $orderId, ':items' => $itemsJson]);
        $listId = (int)$pdo->lastInsertId();
    }

    // Count stats
    $packedCount = 0;
    $totalCount = count($items);
    foreach ($items as $item) {
        if (!empty($item['packed'])) $packedCount++;
    }

    logActivity($pdo, 'CRM_PACKING_LIST_SAVED', 'crm_packing_list', (string)$listId, null, [
        'order_id' => $orderId, 'total_items' => $totalCount, 'packed' => $packedCount
    ]);

    jsonResponse(true, [
        'id' => $listId,
        'total_items' => $totalCount,
        'packed_count' => $packedCount,
    ]);
}

jsonResponse(false, null, 'Method not allowed', 405);
