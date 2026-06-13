<?php
// ============================================================
// CRM Case Update — PUT /api/crm/cases/update.php
// Updates milestone, case_status, and other case fields
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'PUT') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$input = getInput();
$id = (int)($input['id'] ?? 0);
$adminId = $_SESSION['admin_id'] ?? 0;
$adminRole = $_SESSION['admin_role'] ?? '';

if (!$id) {
    jsonResponse(false, null, 'Case ID is required.', 400);
}

// Fetch the existing case
$stmt = $pdo->prepare("SELECT * FROM crm_cases WHERE id = :id");
$stmt->execute([':id' => $id]);
$case = $stmt->fetch();

if (!$case) {
    jsonResponse(false, null, 'Case not found.', 404);
}

// IDOR check for non-managers
if (!in_array($adminRole, ['owner', 'super_admin', 'manager'])) {
    if ($case['assigned_consultant_id'] != $adminId) {
        jsonResponse(false, null, 'Access denied. You do not own this case.', 403);
    }
}

$allowed = [
    'client_name', 'client_phone', 'client_alternate_phone', 'client_email', 'company_name',
    'relocation_type', 'origin_address', 'origin_city', 'origin_state', 'origin_pincode',
    'destination_address', 'destination_city', 'destination_state', 'destination_pincode',
    'move_date_expected', 'move_date_confirmed', 'bhk_type', 'approx_area_sqft', 'approx_items_count',
    'rooms_to_pack', 'origin_floor', 'destination_floor', 'origin_elevator', 'destination_elevator',
    'origin_parking', 'destination_parking', 'access_road_condition', 'access_notes',
    'assigned_consultant_id', 'assigned_sales_id', 'assigned_manager_id',
    'case_status', 'is_gulf_nri', 'family_adults', 'family_children',
    'notes', 'internal_notes', 'total_quoted', 'total_invoiced', 'total_collected', 'total_pending',
    'milestone', 'payment_followup_date'
];

$updateFields = [];
$params = [':id' => $id];

foreach ($allowed as $field) {
    if (array_key_exists($field, $input)) {
        $val = $input[$field];

        // Type coercions
        if (in_array($field, ['origin_parking', 'destination_parking', 'is_gulf_nri'])) {
            $val = $val ? 1 : 0;
        }

        $updateFields[] = "$field = :$field";
        $params[":$field"] = ($val === '' && in_array($field, ['move_date_expected', 'move_date_confirmed', 'payment_followup_date'])) ? null : $val;

        // Handle milestone change — log it and auto-create/update order
        if ($field === 'milestone' && $case['milestone'] !== $val) {
            $mStmt = $pdo->prepare("INSERT INTO crm_case_milestones (case_id, milestone, milestone_date, done_by) VALUES (?, ?, NOW(), ?)");
            $mStmt->execute([$id, $val, $adminId]);

            // Auto-create or update order when job reaches operational milestones
            $operationalMilestones = ['packing_scheduled', 'in_transit', 'delivered'];
            if (in_array($val, $operationalMilestones)) {
                $statusMap = [
                    'packing_scheduled' => 'scheduled',
                    'in_transit'        => 'in_transit',
                    'delivered'         => 'delivered',
                ];
                $orderStatus = $statusMap[$val];

                $chkStmt = $pdo->prepare("SELECT id FROM crm_orders WHERE case_id = ?");
                $chkStmt->execute([$id]);
                $existingOrder = $chkStmt->fetch();

                if (!$existingOrder) {
                    // Create new order
                    $today = date('Ymd');
                    $cntStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_orders WHERE DATE(created_at) = CURDATE()");
                    $cntStmt->execute();
                    $dayCount = (int)$cntStmt->fetchColumn() + 1;
                    $orderNumber = "ORD-{$today}-" . str_pad($dayCount, 3, '0', STR_PAD_LEFT);

                    $oStmt = $pdo->prepare("INSERT INTO crm_orders (case_id, order_number, status, created_at) VALUES (?, ?, ?, NOW())");
                    $oStmt->execute([$id, $orderNumber, $orderStatus]);
                } else {
                    // Update existing order status
                    $pdo->prepare("UPDATE crm_orders SET status = ?, updated_at = NOW() WHERE case_id = ?")
                        ->execute([$orderStatus, $id]);
                }
            }
        }
    }
}

if (array_key_exists('special_requirements', $input)) {
    $updateFields[] = "special_requirements = :reqs";
    $params[":reqs"] = is_array($input['special_requirements'])
        ? json_encode($input['special_requirements'])
        : $input['special_requirements'];
}

if (array_key_exists('services_included', $input)) {
    $updateFields[] = "services_included = :services";
    $params[":services"] = is_array($input['services_included'])
        ? json_encode($input['services_included'])
        : $input['services_included'];
}

if (empty($updateFields)) {
    jsonResponse(false, null, 'No fields to update.', 400);
}

$updateFields[] = "updated_at = NOW()";
$setClause = implode(', ', $updateFields);
$sql = "UPDATE crm_cases SET $setClause WHERE id = :id";

$updateStmt = $pdo->prepare($sql);
$updateStmt->execute($params);

// Return the updated case data
$refreshStmt = $pdo->prepare("SELECT milestone, case_status FROM crm_cases WHERE id = ?");
$refreshStmt->execute([$id]);
$updated = $refreshStmt->fetch();

jsonResponse(true, ['id' => $id, 'updated' => true, 'milestone' => $updated['milestone'], 'case_status' => $updated['case_status']], 'Case updated successfully.');
