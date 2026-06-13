<?php
require_once __DIR__ . '/config.php';

// Generate a new CSRF token if one doesn't exist
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Return the token to the frontend
echo json_encode([
    'success' => true,
    'csrf_token' => $_SESSION['csrf_token']
]);
