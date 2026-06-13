<?php
// ============================================================
// Visitor Logger API — Panya Global Relocation
// Logs IP address, browser, device, geo-location of visitors
// GET  /api/visitors/log.php   — Log a page visit (called from frontend)
// ============================================================
require_once __DIR__ . '/../config.php';

// ─── Auto-create table if not exists ─────────────────────────────────────────
$pdo->exec("
    CREATE TABLE IF NOT EXISTS visitor_logs (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        ip_address      VARCHAR(45)   NOT NULL,
        ip_city         VARCHAR(100)  DEFAULT NULL,
        ip_region       VARCHAR(100)  DEFAULT NULL,
        ip_country      VARCHAR(100)  DEFAULT NULL,
        ip_isp          VARCHAR(150)  DEFAULT NULL,
        page_visited    VARCHAR(500)  DEFAULT NULL,
        referrer        VARCHAR(500)  DEFAULT NULL,
        user_agent      TEXT          DEFAULT NULL,
        browser         VARCHAR(100)  DEFAULT NULL,
        os              VARCHAR(100)  DEFAULT NULL,
        device_type     VARCHAR(50)   DEFAULT NULL,
        session_id      VARCHAR(128)  DEFAULT NULL,
        visited_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ip      (ip_address),
        INDEX idx_visited (visited_at),
        INDEX idx_page    (page_visited(200))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// ─── Helper: parse browser / OS from user-agent ───────────────────────────────
function parseUserAgent(string $ua): array {
    $browser = 'Unknown';
    $os      = 'Unknown';
    $device  = 'Desktop';

    // Browser detection
    $browsers = [
        'Edge'    => '/Edg\//i',
        'Chrome'  => '/Chrome\//i',
        'Firefox' => '/Firefox\//i',
        'Safari'  => '/Safari\//i',
        'Opera'   => '/OPR\//i',
        'IE'      => '/MSIE|Trident/i',
    ];
    foreach ($browsers as $name => $pattern) {
        if (preg_match($pattern, $ua)) { $browser = $name; break; }
    }

    // OS detection
    $systems = [
        'Windows 11' => '/Windows NT 10\.0.*Win64/i',
        'Windows 10' => '/Windows NT 10\.0/i',
        'Windows 7'  => '/Windows NT 6\.1/i',
        'macOS'      => '/Mac OS X/i',
        'iOS'        => '/iPhone|iPad/i',
        'Android'    => '/Android/i',
        'Linux'      => '/Linux/i',
    ];
    foreach ($systems as $name => $pattern) {
        if (preg_match($pattern, $ua)) { $os = $name; break; }
    }

    // Device
    if (preg_match('/Mobile|Android|iPhone/i', $ua)) $device = 'Mobile';
    elseif (preg_match('/Tablet|iPad/i', $ua))        $device = 'Tablet';

    return compact('browser', 'os', 'device');
}

// ─── Helper: get real IP (handles proxies) ────────────────────────────────────
function getRealIp(): string {
    foreach (['HTTP_CF_CONNECTING_IP','HTTP_X_REAL_IP','HTTP_X_FORWARDED_FOR','REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            $ip = trim(explode(',', $_SERVER[$key])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
        }
    }
    return '0.0.0.0';
}

// ─── Helper: geo-lookup via ip-api.com (free, no key needed) ─────────────────
function geoLookup(string $ip): array {
    // Skip for private/local IPs
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
        return ['city' => 'Local', 'region' => 'Local', 'country' => 'Local', 'isp' => 'Local'];
    }
    $ctx = stream_context_create(['http' => ['timeout' => 3]]);
    $raw = @file_get_contents("http://ip-api.com/json/{$ip}?fields=status,city,regionName,country,isp", false, $ctx);
    if ($raw) {
        $data = json_decode($raw, true);
        if (($data['status'] ?? '') === 'success') {
            return [
                'city'    => $data['city']       ?? null,
                'region'  => $data['regionName'] ?? null,
                'country' => $data['country']    ?? null,
                'isp'     => $data['isp']        ?? null,
            ];
        }
    }
    return ['city' => null, 'region' => null, 'country' => null, 'isp' => null];
}

// ─── Handle GET request (log a page visit) ────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $ip       = getRealIp();
    $ua       = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $page     = $_GET['page']     ?? ($_SERVER['HTTP_REFERER'] ?? null);
    $referrer = $_GET['ref']      ?? null;
    $sid      = session_id() ?: null;

    $parsed   = parseUserAgent($ua);
    $geo      = geoLookup($ip);

    $stmt = $pdo->prepare("
        INSERT INTO visitor_logs
            (ip_address, ip_city, ip_region, ip_country, ip_isp,
             page_visited, referrer, user_agent, browser, os, device_type, session_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $ip,
        $geo['city'],  $geo['region'],  $geo['country'],  $geo['isp'],
        $page     ? substr($page,     0, 500) : null,
        $referrer ? substr($referrer, 0, 500) : null,
        $ua       ? substr($ua,       0, 1000) : null,
        $parsed['browser'],
        $parsed['os'],
        $parsed['device'],
        $sid,
    ]);

    echo json_encode(['success' => true, 'logged' => true]);
    exit();
}

// ─── Handle POST: list visitors (admin only) ──────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Require admin session
    if (empty($_SESSION['admin_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorised']);
        exit();
    }

    $body  = json_decode(file_get_contents('php://input'), true) ?? [];
    $page  = max(1, intval($body['page'] ?? 1));
    $limit = min(100, max(10, intval($body['limit'] ?? 25)));
    $offset = ($page - 1) * $limit;

    $totalStmt = $pdo->query("SELECT COUNT(*) FROM visitor_logs");
    $total     = (int)$totalStmt->fetchColumn();

    $rows = $pdo->prepare("
        SELECT id, ip_address, ip_city, ip_region, ip_country, ip_isp,
               page_visited, browser, os, device_type, visited_at
        FROM visitor_logs
        ORDER BY visited_at DESC
        LIMIT :limit OFFSET :offset
    ");
    $rows->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $rows->bindValue(':offset', $offset, PDO::PARAM_INT);
    $rows->execute();

    echo json_encode([
        'success' => true,
        'total'   => $total,
        'page'    => $page,
        'limit'   => $limit,
        'data'    => $rows->fetchAll(),
    ]);
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
