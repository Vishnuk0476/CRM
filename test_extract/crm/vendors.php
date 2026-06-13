<?php
require_once __DIR__ . '/../admin-guard.php';

requirePermission('vendors');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $limit     = isset($_GET['limit'])  ? (int)$_GET['limit']  : 200;
    $is_active = isset($_GET['status']) ? ($_GET['status'] === 'active' ? 1 : 0) : null;

    $query  = "SELECT * FROM crm_vendors WHERE 1=1";
    $params = [];

    if ($is_active !== null) {
        $query .= " AND is_active = :is_active";
        $params[':is_active'] = $is_active;
    }

    $query .= " ORDER BY vendor_name ASC LIMIT :limit";

    $stmt = $pdo->prepare($query);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val, PDO::PARAM_INT);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Flatten JSON fields for frontend convenience
    $vendors = [];
    foreach ($rows as $row) {
        // service_type: first element of vendor_types JSON array
        $vendor_types_arr = [];
        if ($row['vendor_types']) {
            $decoded = json_decode($row['vendor_types'], true);
            if (is_array($decoded)) $vendor_types_arr = $decoded;
        }
        $row['service_type'] = $vendor_types_arr[0] ?? 'other';

        // city: first element of service_cities JSON array
        $service_cities_arr = [];
        if ($row['service_cities']) {
            $decoded = json_decode($row['service_cities'], true);
            if (is_array($decoded)) $service_cities_arr = $decoded;
        }
        $row['city'] = $service_cities_arr[0] ?? null;

        $vendors[] = $row;
    }

    jsonResponse(true, ['vendors' => $vendors]);
}


if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $vendor_name    = isset($data['vendor_name'])    ? trim($data['vendor_name'])    : '';
    $contact_person = isset($data['contact_person']) ? trim($data['contact_person']) : null;
    $phone_primary  = isset($data['phone'])          ? trim($data['phone'])          :
                     (isset($data['phone_primary'])  ? trim($data['phone_primary'])  : '');
    $email          = isset($data['email'])          ? trim($data['email'])          : null;
    $gst_number     = isset($data['gst_number'])     ? trim($data['gst_number'])     : null;

    // service_type → stored as JSON array in vendor_types
    $service_type_raw = isset($data['service_type']) ? $data['service_type'] : 'transport';
    $vendor_types     = json_encode([$service_type_raw]);

    // city → stored as JSON array in service_cities
    $city_raw         = isset($data['city'])         ? trim($data['city'])           : null;
    $service_cities   = $city_raw ? json_encode([$city_raw]) : null;

    if (empty($vendor_name) || empty($phone_primary)) {
        jsonResponse(false, null, 'Vendor name and phone are required', 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO crm_vendors 
            (vendor_name, contact_person, phone_primary, email, vendor_types, service_cities, gst_number, is_active, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    ");
    
    try {
        $stmt->execute([$vendor_name, $contact_person, $phone_primary, $email, $vendor_types, $service_cities, $gst_number, $_SESSION['admin_id'] ?? null]);
        $vendor_id = $pdo->lastInsertId();
        jsonResponse(true, ['message' => 'Vendor created successfully', 'id' => $vendor_id]);
    } catch (Exception $e) {
        jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
}


if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = isset($data['id']) ? (int)$data['id'] : null;
    $status = isset($data['status']) ? $data['status'] : null;
    
    if (!$id || !$status) {
        jsonResponse(false, 'ID and status are required', 400);
    }

    $stmt = $pdo->prepare("UPDATE crm_vendors SET status = ? WHERE id = ?");
    
    if ($stmt->execute([$status, $id])) {
        // logActivity($pdo, 'vendor', $id, 'status_updated', "Vendor status updated to $status", $_SESSION['admin_id']);
        jsonResponse(true, ['message' => 'Status updated']);
    } else {
        jsonResponse(false, 'Failed to update status', 500);
    }
}

jsonResponse(false, 'Method not allowed', 405);
