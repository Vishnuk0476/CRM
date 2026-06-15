<?php
// ============================================================
// Quote Submissions — Public submit
// POST /api/quote-submissions/submit.php
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

// ─── Rate Limiting: max 5 quote submissions per 5 minutes per IP ─
rateLimit($pdo, 'quote:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 5, 300);

$input = getInput();
$required = ['name','email','phone','service_type','from_address','to_address','move_date'];
foreach ($required as $f) {
    if (empty(trim($input[$f] ?? ''))) {
        jsonResponse(false, null, "Field '$f' is required.", 400);
    }
}

$email = sanitizeInput($input['email'], 'email');
if (!$email) {
    jsonResponse(false, null, 'A valid email address is required.', 400);
}

$name        = sanitizeInput($input['name']);
$phone       = preg_replace('/[^0-9+\-\s()]/', '', $input['phone'] ?? '');
$serviceType = sanitizeInput($input['service_type']);
$propType    = sanitizeInput($input['property_type'] ?? 'N/A');
$fromAddr    = sanitizeInput($input['from_address']);
$toAddr      = sanitizeInput($input['to_address']);
$moveDate    = sanitizeInput($input['move_date'], 'date') ?? $input['move_date'];
$rooms       = sanitizeInput($input['rooms'] ?? 'N/A');
$additInfo   = sanitizeInput($input['additional_info'] ?? '');

if (strlen($name) < 2 || strlen($name) > 150) {
    jsonResponse(false, null, 'Name must be between 2 and 150 characters.', 400);
}
if (strlen($phone) < 7) {
    jsonResponse(false, null, 'Please provide a valid phone number.', 400);
}

$newId = bin2hex(random_bytes(16));
$ref = 'PG' . date('Ymd') . '-' . substr($newId, 0, 8);

$stmt = $pdo->prepare("
    INSERT INTO quote_submissions (id, reference_number, name, email, phone, service_type, property_type, from_address, to_address, move_date, rooms, additional_info)
    VALUES (:id, :reference_number, :name,:email,:phone,:service_type,:property_type,:from_address,:to_address,:move_date,:rooms,:additional_info)
");
$stmt->execute([
    ':id'              => $newId,
    ':reference_number'=> $ref,
    ':name'            => $name,
    ':email'           => $email,
    ':phone'           => $phone,
    ':service_type'    => $serviceType,
    ':property_type'   => $propType,
    ':from_address'    => $fromAddr,
    ':to_address'      => $toAddr,
    ':move_date'       => $moveDate,
    ':rooms'           => $rooms,
    ':additional_info' => $additInfo ?: null,
]);

// Build display vars cleanly
$cName = $name; $cEmail = $email; $cPhone = $phone;
$cService = $serviceType; $cProp = $propType;
$cFrom = $fromAddr; $cTo = $toAddr; $cDate = $moveDate; $cRooms = $rooms;
$cDesc = $additInfo ?: 'No additional information.';

// ---------------------------------------------------------
// 1. Email Admin
// ---------------------------------------------------------
$adminBody = "
<p>A new quotation request has been submitted by <strong>{$cName}</strong>.</p>
<table style='width:100%;border-collapse:collapse;margin:16px 0;text-align:left;'>
  <tr style='background:rgba(234,179,8,0.1);'>
    <td style='padding:10px 14px;border-bottom:1px solid #334155;width:35%;'>Reference ID</td>
    <td style='padding:10px 14px;color:#eab308;font-weight:800;border-bottom:1px solid #334155;'>{$ref}</td>
  </tr>
  <tr><td style='padding:10px 14px;border-bottom:1px solid #1e293b;'>Customer Contact</td><td style='padding:10px 14px;border-bottom:1px solid #1e293b;'>{$cEmail}<br>{$cPhone}</td></tr>
  <tr><td style='padding:10px 14px;border-bottom:1px solid #1e293b;'>Service Requested</td><td style='padding:10px 14px;border-bottom:1px solid #1e293b;'>{$cService} ({$cProp}, {$cRooms} rooms)</td></tr>
  <tr><td style='padding:10px 14px;border-bottom:1px solid #1e293b;'>Route</td><td style='padding:10px 14px;border-bottom:1px solid #1e293b;'>{$cFrom} &rarr; {$cTo}</td></tr>
  <tr><td style='padding:10px 14px;border-bottom:1px solid #1e293b;'>Target Move Date</td><td style='padding:10px 14px;border-bottom:1px solid #1e293b;'>{$cDate}</td></tr>
  <tr><td style='padding:10px 14px;border-bottom:1px solid #1e293b;'>Additional Notes</td><td style='padding:10px 14px;border-bottom:1px solid #1e293b;'><em>{$cDesc}</em></td></tr>
</table>
<div style='text-align:center;margin:24px 0;'>
  <a href='https://panyaglobal.in/admin' style='display:inline-block;padding:12px 28px;background:#eab308;color:#000;text-decoration:none;border-radius:8px;font-weight:700;'>View in Admin Panel</a>
</div>
";
sendEmail('info@panyaglobal.in', "New Quote Request — {$ref}", emailTemplate('New Quote Request', $adminBody, 'eab308'));


// ---------------------------------------------------------
// 2. Email Customer
// ---------------------------------------------------------
$trackingUrl = 'https://panyaglobal.in/track-quote?number=' . urlencode($ref);
$custBody = "
<p>Dear <strong>{$cName}</strong>,</p>
<p>Thank you for choosing <strong>Panya Global Relocation</strong>. We have successfully received your quotation request!</p>
<p>Our experts will review your details and prepare a highly customized, competitive quote tailored to your exact shifting needs. You can expect a call or email from us within the next 24 hours.</p>

<table style='width:100%;border-collapse:collapse;margin:24px 0;text-align:left;'>
  <tr style='background:rgba(14,165,233,0.1);'>
    <td style='padding:12px 16px;border-bottom:1px solid #334155;width:40%;'>Quotation Reference</td>
    <td style='padding:12px 16px;color:#0ea5e9;font-weight:800;border-bottom:1px solid #334155;font-size:16px;'>{$ref}</td>
  </tr>
  <tr><td style='padding:10px 16px;border-bottom:1px solid #1e293b;'>Moving From</td><td style='padding:10px 16px;border-bottom:1px solid #1e293b;'>{$cFrom}</td></tr>
  <tr><td style='padding:10px 16px;border-bottom:1px solid #1e293b;'>Moving To</td><td style='padding:10px 16px;border-bottom:1px solid #1e293b;'>{$cTo}</td></tr>
</table>

<div style='text-align:center;margin:32px 0;'>
  <a href='{$trackingUrl}' style='display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0284c7,#16a3b8);color:#fff;text-decoration:none;border-radius:8px;font-weight:700;letter-spacing:0.5px;font-size:15px;'>
    Check Quote Status &rarr;
  </a>
</div>
<p style='font-size:13px;color:#94a3b8;border-top:1px solid #334155;padding-top:16px;margin-top:32px;'>If you have urgent queries, feel free to drop us a line at info@panyaglobal.in or call our support desk.</p>
";

$emailSent = sendEmail(
    $input['email'], 
    "Quote Request Received — {$ref} | Panya Global Relocation", 
    emailTemplate('Quotation Request Received', $custBody)
);

jsonResponse(true, [
    'reference_number' => $ref, 
    'email_sent' => ($emailSent === true),
    'message' => 'Quote request submitted successfully.'
], null, 201);
?>
