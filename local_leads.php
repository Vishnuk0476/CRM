<?php
// ============================================================
// CRM Leads API — CRUD for CRM leads (PanyaFlow v3)
// GET    /api/crm/leads.php              → List leads
// GET    /api/crm/leads.php?id=X         → Single lead detail
// POST   /api/crm/leads.php              → Create lead
// PUT    /api/crm/leads.php              → Update lead
// DELETE /api/crm/leads.php              → Soft-delete (set status=cancelled)
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];

// ─── GET — List or single lead ───────────────────────────────
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT l.*, a.name AS salesperson_name FROM crm_leads l LEFT JOIN admins a ON a.id = l.assigned_to WHERE l.id = :id");
        $stmt->execute([':id' => $id]);
        $lead = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$lead) jsonResponse(false, null, 'Lead not found', 404);
        jsonResponse(true, ['lead' => $lead]);
    }

    $status       = trim($_GET['status'] ?? '');
    $search       = trim($_GET['search'] ?? '');
    $limit        = min(max((int)($_GET['limit'] ?? 100), 1), 500);
    $offset       = max((int)($_GET['offset'] ?? 0), 0);

    $where  = ['1=1'];
    $params = [];

    if (!empty($status)) {
        $where[]  = 'l.status = :status';
        $params[':status'] = $status;
    }

    if (!empty($search)) {
        $escaped = str_replace(['%', '_'], ['\\%', '\\_'], $search);
        $where[] = "(l.customer_name LIKE :search OR l.phone LIKE :search OR l.email LIKE :search)";
        $params[':search'] = '%' . $escaped . '%';
    }

    $whereClause = implode(' AND ', $where);

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_leads l WHERE $whereClause");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $sql = "
        SELECT l.*,
               a.name AS salesperson_name,
               DATE_FORMAT(l.created_at, '%d %b %Y, %h:%i %p') AS created_at_formatted
        FROM crm_leads l
        LEFT JOIN admins a ON a.id = l.assigned_to
        WHERE $whereClause
        ORDER BY l.created_at DESC
        LIMIT $limit OFFSET $offset
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, [
        'leads'  => $leads,
        'pagination' => [
            'total'  => $total,
            'limit'  => $limit,
            'offset' => $offset,
        ],
    ]);
}

// ─── POST — Create lead ──────────────────────────────────────
if ($method === 'POST') {
    requireRole('owner', 'super_admin', 'manager', 'salesperson');
    $input = getInput();

    $customerName = sanitizeInput($input['customer_name'] ?? '', 'string');
    if (empty($customerName)) {
        jsonResponse(false, null, 'Customer Name is required.', 400);
    }

    $phone = sanitizeInput($input['phone'] ?? null, 'string');
    $email = sanitizeInput($input['email'] ?? null, 'email');
    $alternatePhone = sanitizeInput($input['alternate_phone'] ?? null, 'string');
    $companyName = sanitizeInput($input['company_name'] ?? null, 'string');
    $designation = sanitizeInput($input['designation'] ?? null, 'string');
    $relocationType = sanitizeInput($input['relocation_type'] ?? null, 'string');
    $originCity = sanitizeInput($input['origin_city'] ?? null, 'string');
    $originCountry = sanitizeInput($input['origin_country'] ?? 'India', 'string');
    $destinationCity = sanitizeInput($input['destination_city'] ?? null, 'string');
    $moveTimeline = sanitizeInput($input['move_timeline'] ?? null, 'string');
    $budgetMin = isset($input['budget_min']) ? (float)$input['budget_min'] : null;
    $budgetMax = isset($input['budget_max']) ? (float)$input['budget_max'] : null;
    $familyAdults = isset($input['family_adults']) ? (int)$input['family_adults'] : 1;
    $familyChildren = isset($input['family_children']) ? (int)$input['family_children'] : 0;
    $childrenAges = sanitizeInput($input['children_ages'] ?? null, 'string');
    $specialRequirements = sanitizeInput($input['special_requirements'] ?? null, 'string');
    $temperature = sanitizeInput($input['temperature'] ?? 'cold', 'string');
    $assignedTo = isset($input['assigned_to']) ? (int)$input['assigned_to'] : null;
    $referralSourceName = sanitizeInput($input['referral_source_name'] ?? null, 'string');
    $status = $input['status'] ?? 'new';
    $leadSource = sanitizeInput($input['lead_source'] ?? null, 'string');
    $moveType = sanitizeInput($input['move_type'] ?? null, 'string');
    $notes = sanitizeInput($input['notes'] ?? null, 'string');
    $shippingDate = sanitizeInput($input['shipping_date'] ?? null, 'string');
    if ($shippingDate === '') $shippingDate = null;
    $propertyType = sanitizeInput($input['property_type'] ?? null, 'string');
    $loadType = sanitizeInput($input['load_type'] ?? null, 'string');
    $estimatedAmount = isset($input['estimated_amount']) && $input['estimated_amount'] !== '' ? (float)$input['estimated_amount'] : null;

    $isGulfNri = 0;
    $gulfCountries = ['uae', 'united arab emirates', 'saudi arabia', 'qatar', 'kuwait', 'bahrain', 'oman', 'dubai'];
    if (in_array(strtolower($originCountry), $gulfCountries)) {
        $isGulfNri = 1;
    }

    $stmt = $pdo->prepare("
        INSERT INTO crm_leads
            (customer_name, phone, email, alternate_phone, company_name, designation, relocation_type, origin_city, origin_country, destination_city, move_timeline, budget_min, budget_max, family_adults, family_children, children_ages, special_requirements, temperature, assigned_to, referral_source_name, status, is_gulf_nri, lead_source, move_type, notes, shipping_date, property_type, load_type, estimated_amount)
        VALUES
            (:name, :phone, :email, :alt_phone, :company, :designation, :reloc_type, :o_city, :o_country, :d_city, :timeline, :b_min, :b_max, :f_adults, :f_children, :c_ages, :reqs, :temp, :assigned_to, :referral, :status, :is_gulf_nri, :lead_source, :move_type, :notes, :shipping_date, :property_type, :load_type, :estimated_amount)
    ");
    $stmt->execute([
        ':name' => $customerName, ':phone' => $phone, ':email' => $email,
        ':alt_phone' => $alternatePhone, ':company' => $companyName, ':designation' => $designation,
        ':reloc_type' => $relocationType, ':o_city' => $originCity, ':o_country' => $originCountry,
        ':d_city' => $destinationCity, ':timeline' => $moveTimeline, ':b_min' => $budgetMin,
        ':b_max' => $budgetMax, ':f_adults' => $familyAdults, ':f_children' => $familyChildren,
        ':c_ages' => $childrenAges, ':reqs' => $specialRequirements, ':temp' => $temperature,
        ':assigned_to' => $assignedTo, ':referral' => $referralSourceName, ':status' => $status,
        ':is_gulf_nri' => $isGulfNri,
        ':lead_source' => $leadSource, ':move_type' => $moveType, ':notes' => $notes,
        ':shipping_date' => $shippingDate, ':property_type' => $propertyType, ':load_type' => $loadType,
        ':estimated_amount' => $estimatedAmount
    ]);

    jsonResponse(true, ['id' => $pdo->lastInsertId()], null, 201);
}

// ─── PUT — Update lead ───────────────────────────────────────
if ($method === 'PUT') {
    requireRole('owner', 'super_admin', 'manager', 'salesperson');
    $input = getInput();
    $id = (int)($input['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Lead ID is required.', 400);

    $stmt = $pdo->prepare("SELECT * FROM crm_leads WHERE id = :id");
    $stmt->execute([':id' => $id]);
    if (!$stmt->fetch()) jsonResponse(false, null, 'Lead not found.', 404);

    $updateFields = [];
    $params = [':id' => $id];
    $allowed = [
        'customer_name', 'phone', 'email', 'alternate_phone', 'company_name', 'designation',
        'relocation_type', 'origin_city', 'origin_country', 'destination_city', 'move_timeline',
        'budget_min', 'budget_max', 'family_adults', 'family_children', 'children_ages',
        'special_requirements', 'temperature', 'assigned_to', 'referral_source_name', 'status',
        'lead_source', 'move_type', 'notes', 'shipping_date', 'property_type', 'load_type', 'estimated_amount'
    ];

    foreach ($allowed as $field) {
        if (array_key_exists($field, $input)) {
            $updateFields[] = "$field = :$field";
            $params[":$field"] = $input[$field];
        }
    }

    if (empty($updateFields)) jsonResponse(false, null, 'No fields to update.', 400);

    $updateFields[] = "updated_at = NOW()";
    $sql = "UPDATE crm_leads SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $pdo->prepare($sql)->execute($params);

    jsonResponse(true, ['id' => $id, 'updated' => true]);
}

// ─── DELETE ─ Delete Lead ──────────────────────────────────────────────
if ($method === 'DELETE') {
    requireRole('owner', 'super_admin', 'manager');
    $input = getInput();
    $id = (int)($input['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Lead ID is required.', 400);

    $stmt = $pdo->prepare("DELETE FROM crm_leads WHERE id = :id");
    $stmt->execute([':id' => $id]);

    jsonResponse(true, ['id' => $id, 'deleted' => true]);
}

jsonResponse(false, null, 'Method not allowed', 405);
