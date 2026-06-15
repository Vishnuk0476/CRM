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
function sanitizeInput($value, string $type = 'string', int $maxLength = 0) {
    if (is_null($value)) return null;

    $result = null;
    switch ($type) {
        case 'int':
            $result = filter_var($value, FILTER_VALIDATE_INT) !== false ? (int)$value : null;
            break;
        case 'email':
            $clean = filter_var(trim($value), FILTER_SANITIZE_EMAIL);
            $result = filter_var($clean, FILTER_VALIDATE_EMAIL) ? $clean : null;
            break;
        case 'date':
            $d = DateTime::createFromFormat('Y-m-d', trim($value));
            $result = ($d && $d->format('Y-m-d') === trim($value)) ? trim($value) : null;
            break;
        case 'url':
            $result = filter_var(trim($value), FILTER_VALIDATE_URL) ? trim($value) : null;
            break;
        default: // string
            $clean = strip_tags(trim((string)$value));
            $clean = str_replace(["\0", "\r"], '', $clean);
            $result = htmlspecialchars_decode(htmlspecialchars($clean, ENT_QUOTES, 'UTF-8'));
            break;
    }

    if ($maxLength > 0 && is_string($result) && mb_strlen($result) > $maxLength) {
        return mb_substr($result, 0, $maxLength);
    }
    return $result;
}


// ─── Rate Limiter ─────────────────────────────────────────────
/**
 * Limits requests per IP per key.
 * Returns true if the request is allowed, false if blocked.
 * Automatically sends 429 JSON and exits if blocked.
 */
function rateLimit(PDO $pdo, string $key, int $maxAttempts = 10, int $windowSeconds = 60): void {
    try {
        $parts = explode(':', $key, 2);
        $action = $parts[0];
        $ip = $parts[1] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

        // Delete old records
        $pdo->prepare("DELETE FROM rate_limit_log WHERE attempt_time < DATE_SUB(NOW(), INTERVAL :ws SECOND)")
            ->execute([':ws' => $windowSeconds]);

        // Count attempts in this window
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM rate_limit_log WHERE ip_address = :ip AND action = :act");
        $stmt->execute([':ip' => $ip, ':act' => $action]);
        $attempts = (int)$stmt->fetchColumn();

        if ($attempts >= $maxAttempts) {
            header("Retry-After: $windowSeconds");
            jsonResponse(false, null, "Too many requests. Please wait $windowSeconds seconds before trying again.", 429);
        }

        // Record new attempt
        $pdo->prepare("INSERT INTO rate_limit_log (ip_address, action) VALUES (:ip, :act)")
            ->execute([':ip' => $ip, ':act' => $action]);
    } catch (Throwable $e) {
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
function crmEmailTemplate(string $heading, string $bodyHtml, string $accentHex = '0066ff'): string {
    $year = date('Y');
    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>{$heading}</title>
<!--[if mso]>
<style type="text/css">
body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
<style>
  :root {
    color-scheme: light dark;
  }
  @media (prefers-color-scheme: dark) {
    .body-bg { background-color: #111111 !important; }
    .card-bg { background-color: #1e1e1e !important; border-color: #333333 !important; }
    .text-main { color: #f8f9fa !important; }
    .text-muted { color: #aaaaaa !important; }
  }
</style>
</head>
<body class="body-bg" style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111111;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4f8;padding:40px 10px;" class="body-bg">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); border:1px solid #e2e8f0;" class="card-bg">
      
      <!-- HEADER WITH LOGO IN WHITE PILL -->
      <tr>
        <td align="center" style="background-color:#0A2540;padding:40px 20px;">
          <!-- Use table instead of div for email client compatibility -->
          <table border="0" cellpadding="0" cellspacing="0" align="center" style="background-color:#ffffff;border-radius:12px;">
            <tr>
              <td align="center" style="padding:15px 30px;">
                <img src="https://panyaglobal.in/assets/images/logo-black-BXZUiPLa.png" alt="PANYA GLOBAL" width="200" style="height:auto;width:200px;max-width:200px;display:block;margin:0 auto;border:0;outline:none;" />
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- VIVID AZURE ACCENT LINE -->
      <tr>
        <td style="height:6px;background-color:#0066ff;"></td>
      </tr>

      <!-- BODY TITLE -->
      <tr>
        <td style="padding:40px 40px 10px 40px;text-align:center;">
            <h1 class="text-main" style="margin:0;font-size:26px;font-weight:800;color:#0A2540;letter-spacing:-0.5px;line-height:1.2;">
                {$heading}
            </h1>
        </td>
      </tr>

      <!-- BODY CONTENT -->
      <tr>
        <td class="text-main" style="padding:10px 40px 40px 40px;color:#111111;font-size:16px;line-height:1.6;font-weight:500;">
          {$bodyHtml}
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background-color:#0A2540;padding:40px;text-align:center;">
          <p style="color:#e2e8f0;font-size:15px;line-height:1.6;margin:0 0 20px 0;font-weight:500;">
            Need assistance? Reach out to our team at <br>
            <a href="mailto:info@panyaglobal.in" style="color:#0066ff;font-weight:700;text-decoration:none;">info@panyaglobal.in</a> | 
            <a href="tel:+911141556447" style="color:#0066ff;font-weight:700;text-decoration:none;">+91 11 4155 6447</a>
          </p>
          <hr style="border:0;border-top:1px solid rgba(255,255,255,0.1);margin:20px 0;">
          <p style="color:#94a3b8;font-size:12px;margin:0;font-weight:500;letter-spacing:0.5px;">
            &copy; {$year} PANYA GLOBAL PACKERS & MOVERS. ALL RIGHTS RESERVED.<br>
            <span style="color:#0066ff;">DELIVERING EXCELLENCE IN EVERY MOVE.</span>
          </p>
        </td>
      </tr>
    </table>
    
    <!-- SUB-FOOTER TEXT -->
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
      <tr>
        <td align="center" style="padding:20px;color:#888888;font-size:11px;">
          This is an automated message from the Panya Global CRM system. Please do not reply directly to this email unless specified.
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>
HTML;
}
