<?php
// ============================================================
// CRM Fleet API — CRUD for Vehicles and Drivers
// GET /api/crm/fleet.php?type=vehicle|driver
// POST /api/crm/fleet.php
// PUT /api/crm/fleet.php
// ============================================================
require_once __DIR__ . '/../admin-guard.php';
requireRole('owner', 'manager', 'operations');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $type = $_GET['type'] ?? 'vehicle';
    
    if ($type === 'vehicle') {
        $stmt = $pdo->query("SELECT * FROM crm_vehicles ORDER BY id DESC");
        jsonResponse(true, ['vehicles' => $stmt->fetchAll()]);
    } else {
        $stmt = $pdo->query("SELECT * FROM crm_drivers ORDER BY id DESC");
        jsonResponse(true, ['drivers' => $stmt->fetchAll()]);
    }
}

if ($method === 'POST') {
    $input = getInput();
    $type = $input['type'] ?? '';

    if ($type === 'vehicle') {
        $vNum = trim($input['vehicle_number'] ?? '');
        $vType = trim($input['vehicle_type'] ?? '');
        $cap = (float)($input['capacity_tons'] ?? 0);
        if (!$vNum || !$vType) jsonResponse(false, null, 'Vehicle number and type required', 400);

        try {
            $stmt = $pdo->prepare("INSERT INTO crm_vehicles (vehicle_number, vehicle_type, capacity_tons) VALUES (:vn, :vt, :cap)");
            $stmt->execute([':vn' => $vNum, ':vt' => $vType, ':cap' => $cap]);
            jsonResponse(true, ['id' => $pdo->lastInsertId()], 'Vehicle added', 201);
        } catch (PDOException $e) {
            jsonResponse(false, null, 'Vehicle number already exists', 400);
        }
    } 
    else if ($type === 'driver') {
        $name = trim($input['name'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $license = trim($input['license_number'] ?? '');
        if (!$name || !$phone) jsonResponse(false, null, 'Name and phone required', 400);

        $stmt = $pdo->prepare("INSERT INTO crm_drivers (name, phone, license_number) VALUES (:n, :p, :l)");
        $stmt->execute([':n' => $name, ':p' => $phone, ':l' => $license]);
        jsonResponse(true, ['id' => $pdo->lastInsertId()], 'Driver added', 201);
    }
    
    jsonResponse(false, null, 'Invalid type', 400);
}

if ($method === 'PUT') {
    $input = getInput();
    $type = $input['type'] ?? '';
    $id = (int)($input['id'] ?? 0);
    $status = $input['status'] ?? 'active';

    if (!$id) jsonResponse(false, null, 'ID required', 400);

    if ($type === 'vehicle') {
        $stmt = $pdo->prepare("UPDATE crm_vehicles SET status = :s WHERE id = :id");
        $stmt->execute([':s' => $status, ':id' => $id]);
        jsonResponse(true, [], 'Vehicle updated');
    } 
    else if ($type === 'driver') {
        $stmt = $pdo->prepare("UPDATE crm_drivers SET status = :s WHERE id = :id");
        $stmt->execute([':s' => $status, ':id' => $id]);
        jsonResponse(true, [], 'Driver updated');
    }
    
    jsonResponse(false, null, 'Invalid type', 400);
}

jsonResponse(false, null, 'Method not allowed', 405);
