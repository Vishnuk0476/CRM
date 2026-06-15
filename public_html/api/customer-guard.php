<?php
// ============================================================
// Customer Guard — jwt-auth-customer
// ============================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt-auth.php'; // Reuse jwt parsing

// Set CORS headers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$token = extractBearerToken();
if (!$token) {
    jsonResponse(false, null, 'No token provided.', 401);
}

$payload = parseJWT($token);
if (!$payload || !isset($payload['role']) || $payload['role'] !== 'customer') {
    jsonResponse(false, null, 'Invalid or expired token.', 401);
}

// Inject customer into session context for convenience
$_SESSION['customer_id'] = $payload['sub'];
$_SESSION['customer_email'] = $payload['email'];
$_SESSION['customer_name'] = $payload['name'];
$_SESSION['account_tier'] = $payload['account_tier'];
?>
