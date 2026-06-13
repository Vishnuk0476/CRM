<?php
// ============================================================
// CRM Cases API
// GET    /api/crm/cases.php              → List cases
// GET    /api/crm/cases.php?id=X         → Single case detail
// POST   /api/crm/cases.php              → Create case
// PUT    /api/crm/cases.php              → Update case
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];

// ─── GET — List or single case ───────────────────────────────
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

    if ($id) {
        $stmt = $pdo->prepare("
            SELECT c.*, a.name AS consultant_name 
            FROM crm_cases c 
            LEFT JOIN admins a ON a.id = c.assigned_consultant_id 
            WHERE c.id = :id
        ");
        $stmt->execute([':id' => $id]);
        $case = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$case) jsonResponse(false, null, 'Case not found', 404);

        // Fetch milestones
        $mStmt = $pdo->prepare("SELECT * FROM crm_case_milestones WHERE case_id = :id ORDER BY milestone_date DESC, id DESC");
        $mStmt->execute([':id' => $id]);
        $case['milestones_log'] = $mStmt->fetchAll(PDO::FETCH_ASSOC);

        jsonResponse(true, ['case' => $case]);
    }

    $status       = trim($_GET['status'] ?? '');
    $search       = trim($_GET['search'] ?? '');
    $limit        = min(max((int)($_GET['limit'] ?? 100), 1), 500);
    $offset       = max((int)($_GET['offset'] ?? 0), 0);

    $where  = ['1=1'];
    $params = [];

    if (!empty($status)) {
        $where[]  = 'c.case_status = :status';
        $params[':status'] = $status;
    }

    if (!empty($search)) {
        $escaped = str_replace(['%', '_'], ['\\%', '\\_'], $search);
        $where[] = "(c.client_name LIKE :search OR c.client_phone LIKE :search OR c.client_email LIKE :search OR c.case_number LIKE :search)";
        $params[':search'] = '%' . $escaped . '%';
    }

    $whereClause = implode(' AND ', $where);

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_cases c WHERE $whereClause");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $sql = "
        SELECT c.*,
               a.name AS consultant_name,
               DATE_FORMAT(c.created_at, '%d %b %Y, %h:%i %p') AS created_at_formatted
        FROM crm_cases c
        LEFT JOIN admins a ON a.id = c.assigned_consultant_id
        WHERE $whereClause
        ORDER BY c.created_at DESC
        LIMIT $limit OFFSET $offset
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $cases = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, [
        'cases'  => $cases,
        'total'  => $total,
        'limit'  => $limit,
        'offset' => $offset,
    ]);
}

// ─── POST — Create case ──────────────────────────────────────
if ($method === 'POST') {
    requireRole('owner', 'super_admin', 'manager', 'salesperson', 'hr', 'accountant');
    $input = getInput();

    $clientName = sanitizeInput($input['client_name'] ?? '', 'string');
    $clientPhone = sanitizeInput($input['client_phone'] ?? '', 'string');

    if (empty($clientName)) {
        jsonResponse(false, null, 'Client Name is required.', 400);
    }

    // Auto-detect Gulf NRI
    $originCountry = $input['origin_country'] ?? '';
    $isGulfNri = 0;
    $gulfCountries = ['uae', 'united arab emirates', 'saudi arabia', 'qatar', 'kuwait', 'bahrain', 'oman', 'dubai'];
    if (in_array(strtolower($originCountry), $gulfCountries)) {
        $isGulfNri = 1;
    }

    $stmt = $pdo->prepare("
        INSERT INTO crm_cases (
            case_number, lead_id, client_name, client_phone, client_alternate_phone, client_email, company_name,
            relocation_type, origin_address, origin_city, origin_state, origin_pincode, destination_address, destination_city,
            destination_state, destination_pincode, move_date_expected, move_date_confirmed, bhk_type,
            approx_area_sqft, approx_items_count, rooms_to_pack, origin_floor, destination_floor,
            origin_elevator, destination_elevator, origin_parking, destination_parking, access_road_condition,
            access_notes, services_included, assigned_consultant_id, assigned_at, case_status, is_gulf_nri,
            family_adults, family_children, special_requirements, notes, total_quoted, created_by
        ) VALUES (
            :case_number, :lead_id, :client_name, :client_phone, :client_alternate_phone, :client_email, :company_name,
            :relocation_type, :origin_address, :origin_city, :origin_state, :origin_pincode, :destination_address, :destination_city,
            :destination_state, :destination_pincode, :move_date_expected, :move_date_confirmed, :bhk_type,
            :approx_area_sqft, :approx_items_count, :rooms_to_pack, :origin_floor, :destination_floor,
            :origin_elevator, :destination_elevator, :origin_parking, :destination_parking, :access_road_condition,
            :access_notes, :services_included, :assigned_consultant_id, :assigned_at, :case_status, :is_gulf_nri,
            :family_adults, :family_children, :special_requirements, :notes, :total_quoted, :created_by
        )
    ");

    $stmt->execute([
        ':case_number' => 'TEMP', // Will be updated
        ':lead_id' => $input['lead_id'] ?? null,
        ':client_name' => $clientName,
        ':client_phone' => $clientPhone,
        ':client_alternate_phone' => $input['client_alternate_phone'] ?? null,
        ':client_email' => $input['client_email'] ?? null,
        ':company_name' => $input['company_name'] ?? null,
        ':relocation_type' => $input['relocation_type'] ?? null,
        ':origin_address' => $input['origin_address'] ?? null,
        ':origin_city' => $input['origin_city'] ?? null,
        ':origin_state' => $input['origin_state'] ?? null,
        ':origin_pincode' => $input['origin_pincode'] ?? null,
        ':destination_address' => $input['destination_address'] ?? null,
        ':destination_city' => $input['destination_city'] ?? null,
        ':destination_state' => $input['destination_state'] ?? null,
        ':destination_pincode' => $input['destination_pincode'] ?? null,
        ':move_date_expected' => $input['move_date_expected'] ?? null,
        ':move_date_confirmed' => $input['move_date_confirmed'] ?? null,
        ':bhk_type' => $input['bhk_type'] ?? null,
        ':approx_area_sqft' => $input['approx_area_sqft'] ?? null,
        ':approx_items_count' => $input['approx_items_count'] ?? null,
        ':rooms_to_pack' => $input['rooms_to_pack'] ?? null,
        ':origin_floor' => $input['origin_floor'] ?? null,
        ':destination_floor' => $input['destination_floor'] ?? null,
        ':origin_elevator' => $input['origin_elevator'] ?? null,
        ':destination_elevator' => $input['destination_elevator'] ?? null,
        ':origin_parking' => isset($input['origin_parking']) ? ($input['origin_parking'] ? 1 : 0) : null,
        ':destination_parking' => isset($input['destination_parking']) ? ($input['destination_parking'] ? 1 : 0) : null,
        ':access_road_condition' => $input['access_road_condition'] ?? null,
        ':access_notes' => $input['access_notes'] ?? null,
        ':services_included' => isset($input['services_included']) ? json_encode($input['services_included']) : null,
        ':assigned_consultant_id' => $input['assigned_consultant_id'] ?? null,
        ':assigned_at' => !empty($input['assigned_consultant_id']) ? date('Y-m-d H:i:s') : null,
        ':case_status' => $input['case_status'] ?? 'active',
        ':is_gulf_nri' => $isGulfNri,
        ':family_adults' => $input['family_adults'] ?? 1,
        ':family_children' => $input['family_children'] ?? 0,
        ':special_requirements' => isset($input['special_requirements']) ? json_encode($input['special_requirements']) : null,
        ':notes' => $input['notes'] ?? null,
        ':total_quoted' => $input['total_quoted'] ?? 0,
        ':created_by' => $_SESSION['admin_id'] ?? null
    ]);

    $id = $pdo->lastInsertId();
    $caseNumberStr = 'C-PG-' . str_pad($id, 2, '0', STR_PAD_LEFT);
    $pdo->prepare("UPDATE crm_cases SET case_number = ? WHERE id = ?")->execute([$caseNumberStr, $id]);

    jsonResponse(true, ['id' => $id, 'case_number' => $caseNumberStr], null, 201);
}

// ─── PUT — Update case ───────────────────────────────────────
if ($method === 'PUT') {
    requireRole('owner', 'super_admin', 'manager', 'salesperson');
    $input = getInput();
    $id = (int)($input['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Case ID is required.', 400);

    $stmt = $pdo->prepare("SELECT * FROM crm_cases WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $case = $stmt->fetch();
    if (!$case) jsonResponse(false, null, 'Case not found.', 404);

    $updateFields = [];
    $params = [':id' => $id];
    
    // Simple dynamic update for all fields
    $fields = [
        'client_name', 'client_phone', 'client_alternate_phone', 'client_email', 'company_name',
        'relocation_type', 'origin_address', 'origin_city', 'origin_state', 'origin_pincode',
        'destination_address', 'destination_city', 'destination_state', 'destination_pincode',
        'move_date_expected', 'move_date_confirmed', 'bhk_type', 'approx_area_sqft', 'approx_items_count',
        'rooms_to_pack', 'origin_floor', 'destination_floor', 'origin_elevator', 'destination_elevator',
        'origin_parking', 'destination_parking', 'access_road_condition', 'access_notes', 'services_included',
        'assigned_consultant_id', 'case_status', 'family_adults', 'family_children', 'special_requirements',
        'notes', 'total_quoted', 'milestone', 'payment_followup_date'
    ];

    foreach ($fields as $field) {
        if (array_key_exists($field, $input)) {
            $val = $input[$field];
            if (in_array($field, ['services_included', 'special_requirements'])) {
                $val = is_array($val) ? json_encode($val) : $val;
            } elseif (in_array($field, ['origin_parking', 'destination_parking'])) {
                $val = $val ? 1 : 0;
            }
            
            $updateFields[] = "$field = :$field";
            $params[":$field"] = $val;
            
            // Check milestone change — log it and auto-update order/status
            if ($field === 'milestone' && $case['milestone'] !== $val) {
                $mStmt = $pdo->prepare("INSERT INTO crm_case_milestones (case_id, milestone, milestone_date, done_by) VALUES (?, ?, NOW(), ?)");
                $mStmt->execute([$id, $val, $_SESSION['admin_id'] ?? null]);

                // Auto-update case_status based on milestone
                $statusMap = [
                    'inquiry_received'   => 'active',
                    'survey_completed'   => 'active',
                    'quotation_sent'     => 'active',
                    'quotation_accepted' => 'active',
                    'packing_scheduled'  => 'active',
                    'in_transit'         => 'active',
                    'delivered'          => 'completed',
                ];
                if (isset($statusMap[$val]) && !array_key_exists('case_status', $input)) {
                    $autoStatus = $statusMap[$val];
                    $updateFields[] = 'case_status = :auto_case_status';
                    $params[':auto_case_status'] = $autoStatus;
                }

                // Auto-create or update crm_orders for operational milestones
                if (in_array($val, ['packing_scheduled', 'in_transit', 'delivered'])) {
                    $chkStmt = $pdo->prepare("SELECT id FROM crm_orders WHERE case_id = ?");
                    $chkStmt->execute([$id]);
                    if (!$chkStmt->fetch()) {
                        $today = date('Ymd');
                        $cntStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_orders WHERE DATE(created_at) = CURDATE()");
                        $cntStmt->execute();
                        $dayCount = (int)$cntStmt->fetchColumn() + 1;
                        $orderNumber = "ORD-{$today}-" . str_pad($dayCount, 3, '0', STR_PAD_LEFT);

                        $orderStatusMap = ['packing_scheduled' => 'scheduled', 'in_transit' => 'in_transit', 'delivered' => 'delivered'];
                        $oStatus = $orderStatusMap[$val] ?? 'scheduled';

                        $oStmt = $pdo->prepare("INSERT INTO crm_orders (case_id, order_number, status, created_at) VALUES (?, ?, ?, NOW())");
                        $oStmt->execute([$id, $orderNumber, $oStatus]);
                    } else {
                        $orderStatusMap = ['packing_scheduled' => 'scheduled', 'in_transit' => 'in_transit', 'delivered' => 'delivered'];
                        if (isset($orderStatusMap[$val])) {
                            $pdo->prepare("UPDATE crm_orders SET status = ?, updated_at = NOW() WHERE case_id = ?")->execute([$orderStatusMap[$val], $id]);
                        }
                    }
                }
            }
        }
    }

    if (empty($updateFields)) jsonResponse(false, null, 'No fields to update.', 400);

    $updateFields[] = "updated_at = NOW()";
    $sql = "UPDATE crm_cases SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $pdo->prepare($sql)->execute($params);

    jsonResponse(true, ['id' => $id, 'updated' => true]);
}

// ─── DELETE ─ Delete Case ──────────────────────────────────────────────
if ($method === 'DELETE') {
    requireRole('owner', 'super_admin');
    $input = getInput();
    $id = (int)($input['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Case ID is required.', 400);

    try {
        $pdo->beginTransaction();
        // Delete related entities to maintain DB integrity
        $pdo->prepare("DELETE FROM crm_quotations WHERE case_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM crm_invoice_line_items WHERE invoice_id IN (SELECT id FROM crm_invoices WHERE case_id = ?)")->execute([$id]);
        $pdo->prepare("DELETE FROM crm_invoices WHERE case_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM crm_surveys WHERE case_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM crm_case_milestones WHERE case_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM crm_case_vendors WHERE case_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM crm_orders WHERE case_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM crm_cases WHERE id = ?")->execute([$id]);
        $pdo->commit();
        jsonResponse(true, ['id' => $id, 'deleted' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, null, 'Failed to delete case: ' . $e->getMessage(), 500);
    }
}

jsonResponse(false, null, 'Method not allowed', 405);
