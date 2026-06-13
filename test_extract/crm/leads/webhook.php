<?php
require_once '../../config.php';
require_once '../../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Basic API Key auth for webhook
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    // In production, validate this against a stored secret in crm_app_settings
    // For now, simple static check or open endpoint if needed
    // if ($authHeader !== 'Bearer YOUR_SECRET_TOKEN') {
    //     jsonResponse(false, null, 'Unauthorized', 401);
    // }
    
    $input = getInput();
    
    $customerName = sanitizeInput($input['name'] ?? '', 'string');
    $phone        = sanitizeInput($input['phone'] ?? '', 'string');
    $email        = sanitizeInput($input['email'] ?? null, 'email');
    $originCity   = sanitizeInput($input['origin'] ?? null, 'string');
    $destCity     = sanitizeInput($input['destination'] ?? null, 'string');
    $leadSource   = sanitizeInput($input['source'] ?? 'website', 'string');
    $notes        = sanitizeInput($input['message'] ?? null, 'string');
    
    if (!$customerName || !$phone) {
        jsonResponse(false, null, 'Name and phone are required.', 400);
    }
    
    $quotationId = 'W-' . time();
    $status = 'enquiry';
    
    $stmt = $pdo->prepare("
        INSERT INTO crm_leads
            (quotation_id, customer_name, phone, email, origin_city, pickup_city, destination_city, drop_city, status, lead_source, notes)
        VALUES
            (:qid, :name, :phone, :email, :o_city, :o_city2, :d_city, :d_city2, :status, :source, :notes)
    ");
    
    $stmt->execute([
        ':qid'       => $quotationId,
        ':name'      => $customerName,
        ':phone'     => $phone,
        ':email'     => $email,
        ':o_city'    => $originCity,
        ':o_city2'   => $originCity,
        ':d_city'    => $destCity,
        ':d_city2'   => $destCity,
        ':status'    => $status,
        ':source'    => $leadSource,
        ':notes'     => $notes,
    ]);
    
    $newId = $pdo->lastInsertId();
    
    jsonResponse(true, ['id' => $newId], 'Lead captured.', 201);
} else {
    jsonResponse(false, null, 'Method not allowed.', 405);
}
