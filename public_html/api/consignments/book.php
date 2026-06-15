<?php
// ============================================================
// POST /api/consignments/book.php
// Public: Customers book a consignment themselves
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
// NO admin-guard.php here because it's a public form!

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

// ─── Rate Limiting (prevent spam bookings) ──────────────────────
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
rateLimit($pdo, 'book:' . $ip, 5, 60);

$input = getInput();

$required = ['txtName', 'email', 'txtmob', 'txtSendfrom', 'txtSendto'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        jsonResponse(false, null, "Field '$field' is required.", 400);
    }
}

$customerName     = sanitizeInput($input['txtName']);
$customerEmail    = sanitizeInput($input['email'], 'email');
$customerPhone    = sanitizeInput($input['txtmob']);
$origin           = sanitizeInput($input['txtSendfrom']);
$destination      = sanitizeInput($input['txtSendto']);
$estimatedDelivery = !empty($input['datepicker']) ? $input['datepicker'] : null;
$description      = sanitizeInput($input['txtmessage'] ?? '');

if (!$customerEmail) {
    jsonResponse(false, null, 'Invalid email address.', 400);
}

$serviceType      = "Online Booking";

// Initial tracking step
$initialStep = [
    [
        'status'    => 'Booking Confirmed',
        'location'  => $origin,
        'date'      => date('M d, Y'),
        'time'      => date('h:i A'),
        'completed' => true
    ]
];

$id = '';

// Auto-generate LR Number: 16001, 16002...
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

$stmtId = $pdo->query("SELECT UUID()");
$id = $stmtId->fetchColumn();

$stmt = $pdo->prepare("
    INSERT INTO consignments
        (id, customer_name, customer_email, customer_phone, origin, destination, service_type, description, estimated_delivery, status, tracking_steps, lr_number)
    VALUES
        (:id, :name, :email, :phone, :origin, :destination, :service_type, :description, :estimated_delivery, 'booked', :tracking_steps, :lr_number)
");

$stmt->execute([
    ':id'                 => $id,
    ':name'               => $customerName,
    ':email'              => $customerEmail,
    ':phone'              => $customerPhone,
    ':origin'             => $origin,
    ':destination'        => $destination,
    ':service_type'       => $serviceType,
    ':description'        => $description,
    ':estimated_delivery' => $estimatedDelivery,
    ':tracking_steps'     => json_encode($initialStep),
    ':lr_number'          => $lrNumber
]);

// Fetch the auto-generated tracking ID safely using the exact UUID
$fetchStmt = $pdo->prepare("
    SELECT id, consignment_number FROM consignments
    WHERE id = :id
");
$fetchStmt->execute([':id' => $id]);
$row = $fetchStmt->fetch();
$consignmentNumber = $row['consignment_number'];
$consignmentId     = $row['id'];

// ─── Email to Customer ─────────────────────────────────────────
require_once __DIR__ . '/../email-templates.php';

$trackingUrl = 'https://panyaglobal.in/track?type=lr&q=' . urlencode($lrNumber);

$emailConsignment = [
    'customer_name'      => $customerName,
    'lr_number'          => $lrNumber,
    'consignment_number' => $consignmentNumber,
    'origin'             => $origin,
    'destination'        => $destination,
    'service_type'       => $serviceType ?? 'Online Booking',
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

$updEmailStmt = $pdo->prepare("UPDATE consignments SET last_email_status = :st, last_email_error = :err, last_email_sent_at = NOW() WHERE id = :id");
$updEmailStmt->execute([':st' => $emailStatus, ':err' => $emailError, ':id' => $consignmentId]);

// ─── Admin notification (to both owners) ───────────────────────
$adminEmailBody = "<p>A new online booking has been received from the website.</p>
<ul>
    <li><b>Customer:</b> {$customerName}</li>
    <li><b>Phone:</b> {$customerPhone}</li>
    <li><b>Email:</b> {$customerEmail}</li>
    <li><b>LR Number:</b> {$lrNumber}</li>
    <li><b>Route:</b> {$origin} &rarr; {$destination}</li>
    <li><b>Message:</b> {$description}</li>
</ul>
<p>Log in to the Admin Panel to view and update this consignment.</p>";

sendAdminNotification("New Online Booking | LR No: {$lrNumber}", $adminEmailBody);

jsonResponse(true, [
    'consignment_number' => $consignmentNumber,
    'lr_number'          => $lrNumber,
    'email_sent'         => ($emailSent === true)
]);
?>
