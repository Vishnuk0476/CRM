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
$otp = sanitizeInput($input['otp'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$otp || !$password) {
    jsonResponse(false, null, 'Email, OTP, and new password are required.', 400);
}

if (strlen($password) < 6) {
    jsonResponse(false, null, 'Password must be at least 6 characters.', 400);
}

$stmt = $pdo->prepare("SELECT id, reset_otp_expires FROM customers WHERE email = :email AND reset_otp = :otp");
$stmt->execute(['email' => $email, 'otp' => $otp]);
$customer = $stmt->fetch();

if (!$customer) {
    jsonResponse(false, null, 'Invalid OTP.', 400);
}

if (strtotime($customer['reset_otp_expires']) < time()) {
    jsonResponse(false, null, 'OTP has expired.', 400);
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$update = $pdo->prepare("UPDATE customers SET password_hash = :hash, reset_otp = NULL, reset_otp_expires = NULL WHERE id = :id");
$update->execute(['hash' => $hash, 'id' => $customer['id']]);

jsonResponse(true, ['message' => 'Password reset successfully.']);
?>
