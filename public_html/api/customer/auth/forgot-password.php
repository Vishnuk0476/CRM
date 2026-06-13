<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helpers.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input = getInput();
$email = sanitizeInput($input['email'] ?? '', 'email');

if (!$email) {
    jsonResponse(false, null, 'Valid email required.', 400);
}

$stmt = $pdo->prepare("SELECT id, name FROM customers WHERE email = :email");
$stmt->execute(['email' => $email]);
$customer = $stmt->fetch();

if (!$customer) {
    // Return true anyway to prevent email enumeration
    jsonResponse(true, ['message' => 'If an account exists, an OTP has been sent.']);
}

// Generate 6 digit OTP
$otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
$expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));

$update = $pdo->prepare("UPDATE customers SET reset_otp = :otp, reset_otp_expires = :exp WHERE id = :id");
$update->execute(['otp' => $otp, 'exp' => $expires, 'id' => $customer['id']]);

// Send Email
$body = "
<p>Hi {$customer['name']},</p>
<p>You requested to reset your password. Use the following OTP to reset it:</p>
<h2 style='color:#4f46e5; letter-spacing: 2px;'>{$otp}</h2>
<p>This OTP will expire in 15 minutes.</p>
<p>If you didn't request this, you can ignore this email.</p>
";

sendEmail($email, 'Password Reset OTP - Panya Global', emailTemplate('Password Reset', $body));

jsonResponse(true, ['message' => 'OTP sent successfully.']);
?>
