<?php
// ============================================================
// Helpers — Shared utility functions for the PHP backend
// ============================================================

// ─── JSON Response helper ─────────────────────────────────────
function jsonResponse(bool $success, $data = null, string $error = null, int $code = 200): void {
    http_response_code($code);
    $response = ['success' => $success];
    if ($data  !== null) $response['data']  = $data;
    if ($error !== null) $response['error'] = $error;
    echo json_encode($response);
    exit();
}

// ─── Admin helper ─────────────────────────────────────────────
function getAdminById(PDO $pdo, int $adminId) {
    $stmt = $pdo->prepare("SELECT name, email FROM admins WHERE id = :id");
    $stmt->execute([':id' => $adminId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// ─── Delta helper ─────────────────────────────────────────────
function delta(int $current, int $prev): array {
    if ($prev === 0) return ['value' => $current > 0 ? $current : 0, 'direction' => $current > 0 ? 'up' : 'flat'];
    $val = $current - $prev;
    $dir = $val > 0 ? 'up' : ($val < 0 ? 'down' : 'flat');
    return ['value' => abs($val), 'direction' => $dir];
}

// ─── Input Sanitizer ─────────────────────────────────────────
function sanitizeInput($value, string $type = 'string') {
    if (is_null($value)) return null;

    switch ($type) {
        case 'int':
            return filter_var($value, FILTER_VALIDATE_INT) !== false ? (int)$value : null;
        case 'email':
            $clean = filter_var(trim($value), FILTER_SANITIZE_EMAIL);
            return filter_var($clean, FILTER_VALIDATE_EMAIL) ? $clean : null;
        case 'date':
            $d = DateTime::createFromFormat('Y-m-d', trim($value));
            return ($d && $d->format('Y-m-d') === trim($value)) ? trim($value) : null;
        case 'url':
            return filter_var(trim($value), FILTER_VALIDATE_URL) ? trim($value) : null;
        default: // string
            $clean = strip_tags(trim((string)$value));
            $clean = str_replace(["\0", "\r"], '', $clean);
            return htmlspecialchars_decode(htmlspecialchars($clean, ENT_QUOTES, 'UTF-8'));
    }
}


// ─── Rate Limiter ─────────────────────────────────────────────
/**
 * Limits requests per IP per key.
 * Returns true if the request is allowed, false if blocked.
 * Automatically sends 429 JSON and exits if blocked.
 */
function rateLimit(PDO $pdo, string $key, int $maxAttempts = 10, int $windowSeconds = 60): void {
    try {
        $now = time();
        $windowStart = $now - $windowSeconds;

        // Clean old records
        $pdo->prepare("DELETE FROM rate_limit_log WHERE window_start < :ws")->execute([':ws' => $windowStart]);

        // Count attempts in this window for this key
        $stmt = $pdo->prepare("SELECT attempts, window_start FROM rate_limit_log WHERE rate_key = :key LIMIT 1");
        $stmt->execute([':key' => $key]);
        $row = $stmt->fetch();

        if ($row && $row['window_start'] >= $windowStart) {
            if ($row['attempts'] >= $maxAttempts) {
                $retryAfter = ($row['window_start'] + $windowSeconds) - $now;
                header("Retry-After: $retryAfter");
                jsonResponse(false, null, "Too many requests. Please wait $retryAfter seconds before trying again.", 429);
            }
            // Increment
            $pdo->prepare("UPDATE rate_limit_log SET attempts = attempts + 1 WHERE rate_key = :key")
                ->execute([':key' => $key]);
        } else {
            // New window
            $pdo->prepare("DELETE FROM rate_limit_log WHERE rate_key = :key")->execute([':key' => $key]);
            $pdo->prepare("INSERT INTO rate_limit_log (rate_key, attempts, window_start) VALUES (:key, 1, :ws)")
                ->execute([':key' => $key, ':ws' => $now]);
        }
    } catch (Throwable $e) {
        // Rate limiting failure should never block legitimate users — log and continue
        error_log('[RateLimit] Error: ' . $e->getMessage());
    }
}

// ─── Activity logger ─────────────────────────────────────────
function logActivity(
    PDO    $pdo,
    string $action,
    string $entityType,
    string $entityId        = null,
    string $entityReference = null,
    array  $details         = [],
    int    $adminId         = null,
    string $adminEmail      = null,
    string $adminName       = null
): void {
    if ($adminId    === null && isset($_SESSION['admin_id']))    $adminId    = $_SESSION['admin_id'];
    if ($adminEmail === null && isset($_SESSION['admin_email'])) $adminEmail = $_SESSION['admin_email'];
    if ($adminName  === null && isset($_SESSION['admin_name']))  $adminName  = $_SESSION['admin_name'];

    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $detailsJson = !empty($details) ? json_encode($details) : null;

    $stmt = $pdo->prepare("
        INSERT INTO activity_logs
            (admin_id, admin_email, admin_name, action, entity_type, entity_id, entity_reference, details, ip_address)
        VALUES
            (:admin_id, :admin_email, :admin_name, :action, :entity_type, :entity_id, :entity_reference, :details, :ip)
    ");
    $stmt->execute([
        ':admin_id'         => $adminId,
        ':admin_email'      => $adminEmail,
        ':admin_name'       => $adminName,
        ':action'           => $action,
        ':entity_type'      => $entityType,
        ':entity_id'        => $entityId,
        ':entity_reference' => $entityReference,
        ':details'          => $detailsJson,
        ':ip'               => $ip,
    ]);
}

// ─── Email sender (Resend REST API, credentials from .env) ───────────────────
function sendEmail(string $to, string $subject, string $htmlBody, string $fromName = null, string $fromEmail = null, array $attachments = []) {
    $apiKey      = $_ENV['RESEND_API_KEY'] ?? $_ENV['SMTP_PASS'] ?? '';
    $defaultFrom = $_ENV['SMTP_FROM_EMAIL'] ?? 'info@panyaglobal.in';
    $defaultName = $_ENV['SMTP_FROM_NAME']  ?? 'Panya Global Relocation';

    $fromEmail = $fromEmail ?? $defaultFrom;
    $fromName  = $fromName  ?? $defaultName;

    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    
    $data = [
        'from'    => $fromName . ' <' . $fromEmail . '>',
        'to'      => [$to],
        'subject' => $subject,
        'html'    => $htmlBody
    ];
    
    if (!empty($attachments)) {
        $data['attachments'] = $attachments;
    }
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    
    if ($err) {
        error_log('[Panya Resend Mailer] cURL Error: ' . $err);
        return 'cURL Error: ' . $err;
    }
    
    if ($httpcode >= 200 && $httpcode < 300) {
        return true;
    } else {
        error_log('[Panya Resend Mailer] API Error: ' . $response);
        $decoded = json_decode($response, true);
        return 'Resend API Error: ' . ($decoded['message'] ?? $response);
    }
}

// ─── Input parser (JSON body or POST fallback) ────────────────
function getInput(): array {
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        return $decoded;
    }
    return $_POST ?? [];
}

// ─── Premium HTML email template (Light/Clean Ecommerce Style) ─────────────
function emailTemplate(string $heading, string $bodyHtml, string $accentHex = '4f46e5'): string {
    $year = date('Y');
    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{$heading}</title>
<!--[if mso]>
<style type="text/css">
body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#333333;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f5f7;padding:40px 10px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);">
      
      <!-- HEADER WITH LOGO -->
      <tr>
        <td align="center" style="background:linear-gradient(135deg, #0f172a 0%, #312e81 100%);padding:48px 40px;text-align:center;">
          <img src="https://panyaglobal.com/assets/logo-white.png" alt="PANYA GLOBAL" width="180" style="height:auto;width:180px;max-width:180px;display:block;margin:0 auto 24px;border:0;outline:none;" />
          <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
            {$heading}
          </h1>
        </td>
      </tr>

      <!-- BODY CONTENT -->
      <tr>
        <td style="padding:40px;color:#475569;font-size:16px;line-height:1.6;">
          {$bodyHtml}
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background-color:#f8fafc;padding:32px 40px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#64748b;font-size:14px;line-height:1.5;margin:0 0 16px 0;">
            Need assistance? Call us directly at <br>
            <a href="tel:+911141556447" style="color:#{$accentHex};font-weight:600;text-decoration:none;">+91 11 4155 6447</a>
          </p>
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            &copy; {$year} Panya Global Packers & Movers. All rights reserved.<br>
            We safely move your world.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>
HTML;
}

// ─── Premium CRM HTML email template (White Header, Black Logo) ─────────────
function crmEmailTemplate(string $heading, string $bodyHtml, string $accentHex = '1e293b'): string {
    $year = date('Y');
    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{$heading}</title>
<!--[if mso]>
<style type="text/css">
body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;padding:40px 10px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
      
      <!-- HEADER WITH LOGO -->
      <tr>
        <td align="center" style="background-color:#ffffff;padding:40px 40px 20px;text-align:center;border-bottom:2px solid #f1f5f9;">
          <img src="https://panyaglobal.in/assets/images/logo-black-BXZUiPLa.png" alt="PANYA GLOBAL" width="220" style="height:auto;width:220px;max-width:220px;display:block;margin:0 auto;border:0;outline:none;" />
        </td>
      </tr>

      <!-- BODY TITLE -->
      <tr>
        <td style="padding:40px 40px 10px 40px;text-align:center;">
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;line-height:1.2;">
                {$heading}
            </h1>
        </td>
      </tr>

      <!-- BODY CONTENT -->
      <tr>
        <td style="padding:10px 40px 40px 40px;color:#334155;font-size:16px;line-height:1.6;">
          {$bodyHtml}
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background-color:#f8fafc;padding:32px 40px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#64748b;font-size:14px;line-height:1.5;margin:0 0 16px 0;">
            Need assistance? Reach out to our team at <br>
            <a href="mailto:info@panyaglobal.in" style="color:#{$accentHex};font-weight:600;text-decoration:none;">info@panyaglobal.in</a> | 
            <a href="tel:+911141556447" style="color:#{$accentHex};font-weight:600;text-decoration:none;">+91 11 4155 6447</a>
          </p>
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            &copy; {$year} Panya Global Packers & Movers. All rights reserved.<br>
            Delivering excellence in every move.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>
HTML;
}
