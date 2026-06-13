<?php
// ============================================================
// CRM Properties API  —  matches actual crm_properties schema
// GET    → list properties
// POST   → create property (JSON) OR upload photo (multipart)
// PUT    → update property
// DELETE → delete property
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];

// ─── PHOTO UPLOAD (multipart POST with action=upload_photo) ──────────────────
if ($method === 'POST' && isset($_POST['action']) && $_POST['action'] === 'upload_photo') {
    $property_id = (int)($_POST['property_id'] ?? 0);
    if (!$property_id) jsonResponse(false, null, 'Property ID required', 400);
    if (empty($_FILES['photo'])) jsonResponse(false, null, 'No file uploaded', 400);

    $file     = $_FILES['photo'];
    $allowed  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $finfo    = finfo_open(FILEINFO_MIME_TYPE);
    $mime     = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, $allowed)) jsonResponse(false, null, 'Only JPG, PNG, WebP, GIF allowed', 400);
    if ($file['size'] > 5 * 1024 * 1024) jsonResponse(false, null, 'Max file size 5MB', 400);

    $uploadDir = __DIR__ . '/../../uploads/properties/' . $property_id . '/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $ext      = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
    $filename = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $dest     = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        jsonResponse(false, null, 'Failed to save file', 500);
    }

    $webPath = '/uploads/properties/' . $property_id . '/' . $filename;

    // Append to images JSON in DB
    $stmt = $pdo->prepare("SELECT images FROM crm_properties WHERE id = ?");
    $stmt->execute([$property_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $images = [];
    if ($row && $row['images']) {
        $images = json_decode($row['images'], true) ?: [];
    }
    $images[] = $webPath;

    $pdo->prepare("UPDATE crm_properties SET images = ? WHERE id = ?")
        ->execute([json_encode($images), $property_id]);

    jsonResponse(true, ['path' => $webPath, 'images' => $images]);
}

// ─── DELETE PHOTO ─────────────────────────────────────────────────────────────
if ($method === 'DELETE' && isset($_GET['action']) && $_GET['action'] === 'delete_photo') {
    $data        = getInput();
    $property_id = (int)($data['property_id'] ?? 0);
    $photo_path  = $data['photo_path'] ?? '';

    if (!$property_id || !$photo_path) jsonResponse(false, null, 'Missing params', 400);

    $stmt = $pdo->prepare("SELECT images FROM crm_properties WHERE id = ?");
    $stmt->execute([$property_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $images = $row && $row['images'] ? json_decode($row['images'], true) : [];
    $images = array_values(array_filter($images, fn($i) => $i !== $photo_path));

    $pdo->prepare("UPDATE crm_properties SET images = ? WHERE id = ?")
        ->execute([json_encode($images), $property_id]);

    // Delete physical file
    $physPath = __DIR__ . '/../../' . ltrim($photo_path, '/');
    if (file_exists($physPath)) @unlink($physPath);

    jsonResponse(true, ['images' => $images]);
}

// ─── GET ──────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $type   = $_GET['type']   ?? null;
    $status = $_GET['status'] ?? null;
    $search = $_GET['search'] ?? null;
    $limit  = min((int)($_GET['limit'] ?? 100), 500);

    $where  = ['1=1'];
    $params = [];

    if ($type) {
        $where[] = 'property_type = :type';
        $params[':type'] = $type;
    }
    if ($status) {
        $where[] = 'availability_status = :status';
        $params[':status'] = $status;
    }
    if ($search) {
        $where[] = '(title LIKE :search OR full_address LIKE :search OR city LIKE :search)';
        $params[':search'] = "%$search%";
    }
    $where[] = 'is_active = 1';

    $sql  = "SELECT * FROM crm_properties WHERE " . implode(' AND ', $where) . " ORDER BY created_at DESC LIMIT :limit";
    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Parse JSON fields for frontend
    foreach ($rows as &$row) {
        $row['images']    = $row['images']    ? json_decode($row['images'],    true) : [];
        $row['amenities'] = $row['amenities'] ? json_decode($row['amenities'], true) : [];
        $row['tags']      = $row['tags']      ? json_decode($row['tags'],      true) : [];
        // Convenience aliases
        $row['location']  = trim(($row['locality'] ?? '') . ', ' . ($row['city'] ?? ''), ', ');
        $row['price']     = $row['sale_price'] ?: $row['rent_price'] ?: 0;
        $row['size_sqft'] = $row['area_sqft'];
        $row['status']    = $row['availability_status'];
    }
    unset($row);

    jsonResponse(true, ['properties' => $rows]);
}

// ─── POST (Create) ────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $data = getInput();

    $title         = trim($data['title']          ?? '');
    $property_type = $data['property_type']        ?? 'residential';
    $location      = trim($data['location']        ?? '');   // stored in full_address
    $city          = trim($data['city']            ?? '');
    $locality      = trim($data['locality']        ?? '');
    $price         = (float)($data['price']        ?? 0);
    $bedrooms      = isset($data['bedrooms'])  ? (int)$data['bedrooms']  : null;
    $bathrooms     = isset($data['bathrooms']) ? (int)$data['bathrooms'] : null;
    $area_sqft     = isset($data['size_sqft']) ? (int)$data['size_sqft'] : null;
    $description   = trim($data['description']     ?? '');
    $furnishing    = $data['furnishing']            ?? null;
    $owner_name    = trim($data['owner_name']       ?? '');
    $owner_phone   = trim($data['owner_phone']      ?? '');

    if (empty($title)) jsonResponse(false, null, 'Property title is required', 400);

    // If city not given separately, try to extract from location string
    if (empty($city) && !empty($location)) {
        $parts = explode(',', $location);
        $city  = trim(end($parts));
    }
    if (empty($city)) $city = 'Unknown';

    $full_address = $location ?: ($locality . ', ' . $city);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO crm_properties 
                (title, property_type, locality, city, full_address, sale_price, 
                 bedrooms, bathrooms, area_sqft, description, furnishing,
                 owner_name, owner_phone, availability_status, is_active, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 1, ?)
        ");
        $stmt->execute([
            $title, $property_type, $locality, $city, $full_address, $price,
            $bedrooms, $bathrooms, $area_sqft, $description, $furnishing,
            $owner_name, $owner_phone, $_SESSION['admin_id'] ?? null
        ]);
        $property_id = $pdo->lastInsertId();
        jsonResponse(true, ['id' => $property_id, 'message' => 'Property created successfully'], null, 201);
    } catch (Exception $e) {
        jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
}

// ─── PUT (Update) ─────────────────────────────────────────────────────────────
if ($method === 'PUT') {
    $data = getInput();
    $id   = (int)($data['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Property ID required', 400);

    $updateFields = [];
    $params       = [':id' => $id];

    $fieldMap = [
        'title'               => 'title',
        'property_type'       => 'property_type',
        'location'            => 'full_address',
        'full_address'        => 'full_address',
        'city'                => 'city',
        'locality'            => 'locality',
        'price'               => 'sale_price',
        'sale_price'          => 'sale_price',
        'rent_price'          => 'rent_price',
        'bedrooms'            => 'bedrooms',
        'bathrooms'           => 'bathrooms',
        'size_sqft'           => 'area_sqft',
        'area_sqft'           => 'area_sqft',
        'description'         => 'description',
        'status'              => 'availability_status',
        'availability_status' => 'availability_status',
        'furnishing'          => 'furnishing',
        'owner_name'          => 'owner_name',
        'owner_phone'         => 'owner_phone',
    ];

    foreach ($fieldMap as $inKey => $dbCol) {
        if (array_key_exists($inKey, $data)) {
            $updateFields[$dbCol] = ":$dbCol";
            $params[":$dbCol"] = $data[$inKey];
        }
    }

    if (empty($updateFields)) jsonResponse(false, null, 'No fields to update', 400);

    $setParts = array_map(fn($col, $ph) => "$col = $ph", array_keys($updateFields), $updateFields);
    $setParts[] = 'updated_at = NOW()';

    $pdo->prepare("UPDATE crm_properties SET " . implode(', ', $setParts) . " WHERE id = :id")
        ->execute($params);

    jsonResponse(true, ['id' => $id, 'message' => 'Property updated']);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $data = getInput();
    $id   = (int)($data['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'ID required', 400);

    // Soft delete
    $pdo->prepare("UPDATE crm_properties SET is_active = 0 WHERE id = ?")->execute([$id]);
    jsonResponse(true, ['message' => 'Property deleted']);
}

jsonResponse(false, null, 'Method not allowed', 405);
