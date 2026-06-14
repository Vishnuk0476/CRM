<?php
// ============================================================
// Core Configuration — Panya Global Relocation PHP Backend
// PHP 7.4+ compatible | MySQL 5.7+ | PDO
// ============================================================

// ─── Error Handling ──────────────────────────────────────────
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);
ini_set('log_errors', '1');

set_exception_handler(function (Throwable $e) {
    error_log("[Unhandled Exception] " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    http_response_code(500);
    $debugMode = (isset($_ENV['APP_DEBUG']) ? $_ENV['APP_DEBUG'] : 'false') === 'true' || defined('APP_DEBUG') && APP_DEBUG === true;
    echo json_encode([
        'success' => false,
        'error' => 'An unexpected server error occurred.',
        'detail' => $debugMode ? $e->getMessage() : null
    ]);
    exit();
});

set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return false;
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// ─── Timezone: IST (Asia/Kolkata) for all date() calls ───────
date_default_timezone_set('Asia/Kolkata');

// ─── Load Environment Variables from .env ────────────────────
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) continue;
        list($key, $val) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($val);
        putenv(trim($key) . '=' . trim($val));
    }
}

// Ensure JWT Secret is ALWAYS set
putenv('SUPABASE_JWT_SECRET=super-secret-key-panyaglobal-2026-very-long-string');
$_ENV['SUPABASE_JWT_SECRET'] = 'super-secret-key-panyaglobal-2026-very-long-string';

// ─── Session hardening ────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Strict');
    ini_set('session.gc_maxlifetime', 28800);
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        ini_set('session.cookie_secure', 1);
    }
    session_start();
}

// ─── CORS Headers ─────────────────────────────────────────────
// Static allowed origins (production + loopback)
$allowed_origins_static = [
    'https://panyaglobal.in',
    'https://www.panyaglobal.in',
    'https://panyaglobal.netlify.app',
    'https://crm-demo-vishnu.netlify.app',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:8080',
    'http://localhost',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1',
];

function isLocalNetworkOrigin(string $origin): bool {
    $host = preg_replace('#^https?://([^/:]+).*$#', '$1', $origin);
    if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        $parts = explode('.', $host);
        $a = (int)$parts[0];
        $b = (int)$parts[1];
        if ($a === 10) return true;
        if ($a === 192 && $b === 168) return true;
        if ($a === 172 && $b >= 16 && $b <= 31) return true;
    }
    return false;
}

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$isAllowed = in_array($origin, $allowed_origins_static) || isLocalNetworkOrigin($origin);

if ($isAllowed) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("Referrer-Policy: strict-origin-when-cross-origin");

if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
    header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
}
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api.brevo.com");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE'])) {
    $reqOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!empty($reqOrigin) && !$isAllowed) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Cross-origin request denied.']);
        exit();
    }
}

// ─── Database Configuration ───────────────────────────────────
define('DB_HOST',    isset($_ENV['DB_HOST'])    ? $_ENV['DB_HOST']    : 'localhost');
define('DB_NAME',    isset($_ENV['DB_NAME'])    ? $_ENV['DB_NAME']    : 'panyaglobal_db');
define('DB_USER',    isset($_ENV['DB_USER'])    ? $_ENV['DB_USER']    : 'root');
define('DB_PASS',    isset($_ENV['DB_PASS'])    ? $_ENV['DB_PASS']    : '');
define('DB_CHARSET', 'utf8mb4');

// 🔥 DEBUG MODE ON KAR DIYA HAI 🔥
define('APP_DEBUG',  true);

// ─── PDO Connection ───────────────────────────────────────────
try {
    $driver = isset($_ENV['DB_DRIVER']) ? $_ENV['DB_DRIVER'] : 'mysql'; // Default to mysql for cPanel
    $dsn = $driver . ":host=" . DB_HOST . ";dbname=" . DB_NAME;
    if ($driver === 'mysql') {
        $dsn .= ";charset=" . DB_CHARSET;
    }
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    if ($driver === 'mysql') {
        $pdo->exec("SET time_zone = '+05:30'");
        $pdo->exec("SET SESSION sql_mode = ''");
    } else {
        $pdo->exec("SET TIME ZONE 'Asia/Kolkata'");
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => "Database connection failed.",
        "detail"  => true ? $e->getMessage() : null // Force show error
    ]);
    exit();
}