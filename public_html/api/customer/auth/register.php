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
$required = ['name', 'email', 'password'];
foreach ($required as $f) {
    if (empty(trim($input[$f] ?? ''))) {
        jsonResponse(false, null, "Field '$f' is required.", 400);
    }
}

$name = sanitizeInput($input['name']);
$email = sanitizeInput($input['email'], 'email');
$password = $input['password'];
$phone = sanitizeInput($input['phone'] ?? null);
$designation = sanitizeInput($input['designation'] ?? null);
$company = sanitizeInput($input['company'] ?? null);

if (!$email) {
    jsonResponse(false, null, 'Invalid email address.', 400);
}
if (strlen($password) < 6) {
    jsonResponse(false, null, 'Password must be at least 6 characters.', 400);
}

// Check if email already exists
$stmt = $pdo->prepare("SELECT id FROM customers WHERE email = :email");
$stmt->execute(['email' => $email]);
if ($stmt->fetch()) {
    jsonResponse(false, null, 'An account with this email already exists.', 400);
}

$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $stmt = $pdo->prepare("INSERT INTO customers (name, email, phone, designation, company, password_hash) VALUES (:name, :email, :phone, :designation, :company, :hash)");
    $stmt->execute([
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'designation' => $designation,
        'company' => $company,
        'hash' => $hash
    ]);
    
    $customerId = $pdo->lastInsertId();
    
    // Generate JWT
    $payload = [
        'sub' => $customerId,
        'email' => $email,
        'name' => $name,
        'role' => 'customer',
        'account_tier' => 'free'
    ];
    $token = generateJWT($payload, 7 * 86400); // 7 days expiry

    jsonResponse(true, [
        'token' => $token,
        'customer' => [
            'id' => $customerId,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'designation' => $designation,
            'company' => $company,
            'account_tier' => 'free'
        ]
    ], null, 201);
} catch (Exception $e) {
    jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
?>
