<?php
// ============================================================
// POST /api/consignments/submit.php
// Admin: Create a new consignment + send booking email
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input = getInput();

$required = ['customer_name', 'customer_email', 'customer_phone', 'origin', 'destination'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        jsonResponse(false, null, "Field '$field' is required.", 400);
    }
}

$customerName      = sanitizeInput($input['customer_name']);
$customerEmail     = sanitizeInput($input['customer_email'], 'email');
$customerPhone     = preg_replace('/[^0-9+\s]/', '', $input['customer_phone'] ?? '');
$origin            = sanitizeInput($input['origin']);
$destination       = sanitizeInput($input['destination']);
$serviceType       = sanitizeInput($input['service_type'] ?? 'Household Moving');
$description       = sanitizeInput($input['description'] ?? '');
$estimatedDelivery = !empty($input['estimated_delivery']) ? sanitizeInput($input['estimated_delivery'], 'date') : null;
$notes             = sanitizeInput($input['notes'] ?? '');
$awbNumber         = sanitizeInput($input['awb_number'] ?? '');
$consignorName     = sanitizeInput($input['consignor_name'] ?? '');
$consignorAddress  = sanitizeInput($input['consignor_address'] ?? '');
$packagesCount     = !empty($input['packages_count']) ? (int)$input['packages_count'] : null;
$consigneeAddress  = sanitizeInput($input['consignee_address'] ?? '');

if (!$customerEmail) {
    jsonResponse(false, null, 'Invalid customer email address.', 400);
}

// ─── Auto-generate LR Number: PG + YYYYMMDD + 4-digit serial ──
$lrInput = sanitizeInput($input['lr_number'] ?? '');
if (!empty($lrInput)) {
    // Admin provided their own LR number — sanitise to alphanumeric only
    $lrNumber = strtoupper(preg_replace('/[^A-Z0-9]/', '', $lrInput));
    if (empty($lrNumber)) {
        jsonResponse(false, null, 'LR number contains invalid characters. Use letters and numbers only.', 400);
    }
} else {
    // Auto-generate: increment global counter → 16001, 16002, 16003 …
    $pdo->beginTransaction();
    try {
        $pdo->exec("UPDATE lr_sequence SET last_seq = last_seq + 1 WHERE id = 1");
        $seq = (int)$pdo->query("SELECT last_seq FROM lr_sequence WHERE id = 1")->fetchColumn();
        $lrNumber = (string)$seq;
        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log('[Database Error] ' . $e->getMessage());
        $errMsg = (defined('APP_DEBUG') && APP_DEBUG) ? 'Could not generate LR number: ' . $e->getMessage() : 'Could not generate LR number due to a server error.';
        jsonResponse(false, null, $errMsg, 500);
    }
}

// Ensure LR number is unique
$existing = $pdo->prepare("SELECT id FROM consignments WHERE lr_number = :lr LIMIT 1");
$existing->execute([':lr' => $lrNumber]);
if ($existing->fetch()) {
    jsonResponse(false, null, "LR number '$lrNumber' already exists. Please use a different one.", 409);
}

// ─── Initial tracking step ─────────────────────────────────────
$initialStep = [[
    'status'    => 'Booking Confirmed',
    'location'  => $origin,
    'date'      => date('M d, Y'),
    'time'      => date('h:i A'),
    'completed' => true,
]];

// ─── Insert ────────────────────────────────────────────────────
$stmt = $pdo->prepare("
    INSERT INTO consignments (
        id, customer_name, customer_email, customer_phone,
        origin, destination, consignee_address, service_type, description,
        estimated_delivery, status, tracking_steps, notes,
        lr_number, awb_number,
        consignor_name, consignor_address, packages_count
    ) VALUES (
        UUID(), :name, :email, :phone,
        :origin, :destination, :consignee_address, :service_type, :description,
        :estimated_delivery, 'booked', :tracking_steps, :notes,
        :lr_number, :awb_number,
        :consignor_name, :consignor_address, :packages_count
    )
");

$stmt->execute([
    ':name'              => $customerName,
    ':email'             => $customerEmail,
    ':phone'             => $customerPhone,
    ':origin'            => $origin,
    ':destination'       => $destination,
    ':consignee_address' => $consigneeAddress ?: null,
    ':service_type'      => $serviceType,
    ':description'       => $description,
    ':estimated_delivery'=> $estimatedDelivery,
    ':tracking_steps'    => json_encode($initialStep, JSON_UNESCAPED_UNICODE),
    ':notes'             => $notes,
    ':lr_number'         => $lrNumber,
    ':awb_number'        => $awbNumber ?: null,
    ':consignor_name'    => $consignorName ?: null,
    ':consignor_address' => $consignorAddress ?: null,
    ':packages_count'    => $packagesCount,
]);

// Fetch the new row
$fetchStmt = $pdo->prepare("
    SELECT id, consignment_number FROM consignments
    WHERE lr_number = :lr LIMIT 1
");
$fetchStmt->execute([':lr' => $lrNumber]);
$row = $fetchStmt->fetch();

$consignmentId     = $row['id'];
$consignmentNumber = $row['consignment_number'];

// ─── Activity log ──────────────────────────────────────────────
try {
    logActivity($pdo, 'create', 'consignment', $consignmentId, $lrNumber, [
        'customer'    => $customerName,
        'email'       => $customerEmail,
        'origin'      => $origin,
        'destination' => $destination,
        'lr_number'   => $lrNumber,
    ]);
} catch (Exception $e) { /* Non-fatal */ }

// ─── Booking confirmation email ────────────────────────────────
require_once __DIR__ . '/../email-templates.php';

$trackingUrl = 'https://panyaglobal.in/track?type=lr&q=' . urlencode($lrNumber);

$emailConsignment = [
    'customer_name'      => $customerName,
    'lr_number'          => $lrNumber,
    'consignment_number' => $consignmentNumber,
    'origin'             => $origin,
    'destination'        => $destination,
    'service_type'       => $serviceType,
    'estimated_delivery' => $estimatedDelivery,
    'status'             => 'booked',
];

$emailBody    = getStatusEmailBody('booked', $emailConsignment, $trackingUrl);
$emailSubject = getStatusEmailSubject('booked', $lrNumber);
$emailHeading = getStatusEmailHeading('booked');

$emailSent = sendEmail(
    $customerEmail,
    $emailSubject,
    emailTemplate($emailHeading, $emailBody)
);

$emailStatus = ($emailSent === true) ? 'sent' : 'failed';
$emailError  = ($emailSent === true) ? null : (string)$emailSent;

$pdo->prepare("UPDATE consignments SET last_email_status = :st, last_email_error = :err, last_email_sent_at = NOW() WHERE id = :id")
    ->execute([':st' => $emailStatus, ':err' => $emailError, ':id' => $consignmentId]);

// ─── Admin notification (to both owners) ───────────────────────
$adminEmailBody = "<p>A new consignment has been booked from the Admin Panel.</p>
<ul>
    <li><b>Customer:</b> {$customerName}</li>
    <li><b>Phone:</b> {$customerPhone}</li>
    <li><b>Email:</b> {$customerEmail}</li>
    <li><b>LR Number:</b> {$lrNumber}</li>
    <li><b>Route:</b> {$origin} &rarr; {$destination}</li>
    <li><b>Service:</b> {$serviceType}</li>
</ul>
<p>Log in to the Admin Panel to view and manage this consignment.</p>";

sendAdminNotification("New Booking | LR No: {$lrNumber}", $adminEmailBody);

jsonResponse(true, [
    'lr_number'          => $lrNumber,
    'consignment_number' => $consignmentNumber,
    'id'                 => $consignmentId,
    'email_sent'         => ($emailSent === true),
]);
?>

