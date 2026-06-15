<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers.php';
require_once __DIR__ . '/../../jwt-auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input = getInput();
$email = sanitizeInput($input['email'] ?? '', 'email');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    jsonResponse(false, null, 'Email and password are required.', 400);
}

$stmt = $pdo->prepare("SELECT * FROM customers WHERE email = :email");
$stmt->execute(['email' => $email]);
$customer = $stmt->fetch();

if (!$customer || !password_verify($password, $customer['password_hash'])) {
    jsonResponse(false, null, 'Invalid email or password.', 401);
}

// Generate JWT
$payload = [
    'sub' => $customer['id'],
    'email' => $customer['email'],
    'name' => $customer['name'],
    'role' => 'customer',
    'account_tier' => $customer['account_tier']
];
$token = generateJWT($payload, 7 * 86400); // 7 days expiry

unset($customer['password_hash']);
unset($customer['reset_otp']);
unset($customer['reset_otp_expires']);

jsonResponse(true, [
    'token' => $token,
    'customer' => $customer
]);
?>
