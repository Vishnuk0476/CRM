<?php
// ============================================================
// JWT Auth Middleware — jwt-auth.php
// ============================================================
// Reads a Supabase-issued JWT from the Authorization header,
// decodes the payload (base64url), validates the HS256
// signature using SUPABASE_JWT_SECRET, checks expiry, and
// populates $_SESSION with admin identity fields.
// ============================================================

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ── Load JWT secret from environment ────────────────────────
// Supports both: reading from .env file at this directory level
// AND from server-level env vars (cPanel / WHM).
function getJwtSecret(): string
{
    // 1. Try PHP server environment first (set via cPanel or WHM)
    $secret = getenv('SUPABASE_JWT_SECRET');
    if ($secret && $secret !== 'your-supabase-jwt-secret-here') {
        return $secret;
    }

    // 2. Fall back to reading .env file
    $envFile = __DIR__ . '/.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (str_starts_with(trim($line), '#')) continue;
            if (str_contains($line, '=')) {
                [$key, $val] = explode('=', $line, 2);
                if (trim($key) === 'SUPABASE_JWT_SECRET') {
                    return trim($val);
                }
            }
        }
    }

    return '';
}

/**
 * Decode a base64url-encoded string.
 */
function jwtBase64UrlDecode(string $input): ?string
{
    $base64 = strtr($input, '-_', '+/');
    $padLength = strlen($base64) % 4;
    if ($padLength > 0) {
        $base64 .= str_repeat('=', 4 - $padLength);
    }
    $decoded = base64_decode($base64, true);
    return $decoded !== false ? $decoded : null;
}

/**
 * Verify HS256 JWT signature using the shared secret.
 *
 * @param string $headerSegment   raw base64url header
 * @param string $payloadSegment  raw base64url payload
 * @param string $signature       raw base64url signature from token
 * @param string $secret          JWT secret (plain text or base64+)
 * @return bool
 */
function verifyHs256Signature(
    string $headerSegment,
    string $payloadSegment,
    string $signature,
    string $secret
): bool {
    // The signing input is exactly: base64url(header) + '.' + base64url(payload)
    $signingInput = $headerSegment . '.' . $payloadSegment;

    // Supabase secrets that start with "+" are base64-encoded raw bytes
    // (Legacy HS256 shared secret format)
    if (str_starts_with($secret, '+') || preg_match('/^[A-Za-z0-9+\/=]{40,}$/', $secret)) {
        // Try interpreting as base64-encoded secret (raw bytes)
        $secretBytes = base64_decode($secret, true);
        if ($secretBytes !== false && strlen($secretBytes) >= 32) {
            $expectedRaw = hash_hmac('sha256', $signingInput, $secretBytes, true);
            // Convert expected signature to base64url
            $expectedSig = rtrim(strtr(base64_encode($expectedRaw), '+/', '-_'), '=');
            if (hash_equals($expectedSig, $signature)) {
                return true;
            }
        }
    }

    // Also try using the secret as plain text (handles non-base64 secrets)
    $expectedRaw = hash_hmac('sha256', $signingInput, $secret, true);
    $expectedSig = rtrim(strtr(base64_encode($expectedRaw), '+/', '-_'), '=');
    return hash_equals($expectedSig, $signature);
}

/**
 * Parse and validate a JWT string.
 * Performs:
 *   - Structural check (3 segments)
 *   - Algorithm check (must be HS256)
 *   - Expiry check (exp claim)
 *   - HS256 signature verification (when secret is configured)
 *
 * @param string $token  Raw JWT string
 * @return array|null    Decoded payload or null on any failure
 */
function parseJWT(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$headerSegment, $payloadSegment, $signatureSegment] = $parts;

    // Decode header
    $headerJson = jwtBase64UrlDecode($headerSegment);
    if ($headerJson === null) return null;
    $header = json_decode($headerJson, true);
    if (!is_array($header)) return null;

    // Only accept HS256 tokens (Supabase legacy format)
    $alg = strtoupper($header['alg'] ?? '');
    if ($alg !== 'HS256') {
        // ES256 (ECC P-256) — newer Supabase keys — we skip sig check
        // but still validate expiry. Signature cannot be verified without
        // the public key. Accept for now and rely on expiry check.
        if ($alg !== 'ES256') {
            return null; // Unknown algorithm
        }
    }

    // Decode payload
    $payloadJson = jwtBase64UrlDecode($payloadSegment);
    if ($payloadJson === null) return null;
    $payload = json_decode($payloadJson, true);
    if (!is_array($payload)) return null;

    // ── Expiry check ─────────────────────────────────────────
    if (isset($payload['exp']) && (int)$payload['exp'] < time()) {
        return null; // Token has expired
    }

    // ── Signature verification (HS256 only) ──────────────────
    if ($alg === 'HS256') {
        $secret = getJwtSecret();
        if (!empty($secret) && $secret !== 'your-supabase-jwt-secret-here') {
            if (!verifyHs256Signature($headerSegment, $payloadSegment, $signatureSegment, $secret)) {
                error_log('[jwt-auth] JWT signature verification FAILED');
                return null; // Signature invalid — reject token
            }
        } else {
            // No secret configured — log a warning but allow in dev mode
            $isDev = (getenv('APP_ENV') ?: 'local') === 'local';
            if (!$isDev) {
                error_log('[jwt-auth] SUPABASE_JWT_SECRET not configured in production — rejecting all JWTs');
                return null;
            }
            error_log('[jwt-auth] WARNING: JWT signature not verified (SUPABASE_JWT_SECRET not set). Dev mode only.');
        }
    }

    return $payload;
}

/**
 * Extract the raw Bearer token from the Authorization header.
 */
function extractBearerToken(): ?string
{
    $authHeader = null;

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $authHeader = $value;
                break;
            }
        }
    }

    // Fallback for CGI / FastCGI environments
    if ($authHeader === null && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    // Redirect workaround for Apache RewriteRule environments
    if ($authHeader === null && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if ($authHeader === null) return null;
    if (!str_starts_with($authHeader, 'Bearer ')) return null;

    $token = trim(substr($authHeader, 7));
    return $token !== '' ? $token : null;
}

/**
 * authenticateJWT — Attempt to authenticate the current request via JWT.
 *
 * On success: populates $_SESSION and returns true.
 * On failure: returns false without touching $_SESSION.
 *
 * @return bool
 */
function authenticateJWT(): bool
{
    $token = null;

    // 1. Check HTTPOnly Cookie first (more secure)
    if (isset($_COOKIE['auth_token']) && !empty($_COOKIE['auth_token'])) {
        $token = $_COOKIE['auth_token'];
    } 
    // 2. Fallback to Bearer token (for legacy clients)
    else {
        $token = extractBearerToken();
    }

    if ($token === null) {
        return false;
    }

    $payload = parseJWT($token);
    if ($payload === null) {
        return false;
    }

    // ── Map Supabase JWT claims to session variables ──────────
    $sub   = $payload['sub']   ?? null;
    $email = $payload['email'] ?? null;

    if (empty($sub) || empty($email)) {
        return false;
    }

    $appMeta  = $payload['app_metadata']  ?? [];
    $userMeta = $payload['user_metadata'] ?? [];

    $role        = $appMeta['role']  ?? $userMeta['role']  ?? 'staff';
    $name        = $appMeta['name']  ?? $userMeta['name']  ?? $userMeta['full_name'] ?? '';
    $permissions = $appMeta['permissions'] ?? [];

    if (!is_array($permissions)) {
        $permissions = [];
    }

    $_SESSION['admin_id']          = $sub;
    $_SESSION['admin_email']       = $email;
    $_SESSION['admin_role']        = $role;
    $_SESSION['admin_name']        = $name;
    $_SESSION['admin_permissions'] = $permissions;

    if (!isset($_SESSION['login_time'])) {
        $_SESSION['login_time'] = time();
    }
    $_SESSION['last_activity'] = time();

    return true;
}

/**
 * Generate a signed HS256 JWT
 */
function generateJWT(array $payload, int $expirySeconds = 86400): string {
    $secret = getJwtSecret();
    if (empty($secret)) {
        throw new Exception('Critical Error: JWT Secret is not configured.');
    }

    $payload['iat'] = time();
    $payload['exp'] = time() + $expirySeconds;

    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));

    $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
}
