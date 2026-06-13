<?php
// ============================================================
// POST /api/consignments/update.php
// Admin: Update consignment status + push tracking step, auto-email customer
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input = getInput();

$id = sanitizeInput($input['id'] ?? '');
if (empty($id)) {
    jsonResponse(false, null, 'Consignment ID is required.', 400);
}

$newStatus   = sanitizeInput($input['status'] ?? '');
$stepLocation= sanitizeInput($input['step_location'] ?? '');
$stepNote    = sanitizeInput($input['step_note'] ?? '');
$notes       = $input['notes'] ?? null;
$estimatedDelivery = $input['estimated_delivery'] ?? null;
$createdAt   = $input['created_at'] ?? null;          // Admin override: booking date
$stepsOverride = $input['tracking_steps'] ?? null;    // Admin override: full steps array

// Fetch existing consignment
$fetchStmt = $pdo->prepare("SELECT * FROM consignments WHERE id = :id LIMIT 1");
$fetchStmt->execute([':id' => $id]);
$consignment = $fetchStmt->fetch();

if (!$consignment) {
    jsonResponse(false, null, 'Consignment not found.', 404);
}

$steps = json_decode($consignment['tracking_steps'] ?? '[]', true);

// Status label map
$statusLabels = [
    'booked'            => 'Booking Confirmed',
    'picked_up'         => 'Picked Up',
    'in_transit'        => 'In Transit',
    'storage'           => 'In Storage',
    'out_for_delivery'  => 'Out for Delivery',
    'delivered'         => 'Delivered',
    'cancelled'         => 'Cancelled',
];

// Push a new tracking step if status changed or location provided
if (!empty($newStatus) && $newStatus !== $consignment['status']) {
    $steps[] = [
        'status'    => $statusLabels[$newStatus] ?? ucfirst(str_replace('_', ' ', $newStatus)),
        'location'  => $stepLocation ?: ($newStatus === 'delivered' ? $consignment['destination'] : $consignment['origin']),
        'date'      => date('M d, Y'),
        'time'      => date('h:i A'),
        'note'      => $stepNote,
        'completed' => true
    ];
} elseif (!empty($stepLocation) || !empty($stepNote)) {
    // Manual step push without status change
    $steps[] = [
        'status'    => $statusLabels[!empty($newStatus) ? $newStatus : $consignment['status']] ?? 'Update',
        'location'  => $stepLocation,
        'date'      => date('M d, Y'),
        'time'      => date('h:i A'),
        'note'      => $stepNote,
        'completed' => true
    ];
}

// If admin is sending a full tracking_steps override, use that instead of the auto-push logic
if ($stepsOverride !== null) {
    $decoded = json_decode($stepsOverride, true);
    if (is_array($decoded)) {
        $steps = $decoded;
    }
}

// Build update query
$setClauses = [];
$params = [':id' => $id, ':tracking_steps' => json_encode($steps, JSON_UNESCAPED_UNICODE)];

$setClauses[] = 'tracking_steps = :tracking_steps';

if (!empty($newStatus)) {
    $setClauses[] = 'status = :status';
    $params[':status'] = $newStatus;
}
if ($notes !== null) {
    $setClauses[] = 'notes = :notes';
    $params[':notes'] = $notes;
}
if (!empty($estimatedDelivery)) {
    $setClauses[] = 'estimated_delivery = :estimated_delivery';
    $params[':estimated_delivery'] = $estimatedDelivery;
}
if (!empty($createdAt)) {
    // Requires upgrade_v3.sql to have been run (converts created_at to DATETIME)
    $setClauses[] = 'created_at = :created_at';
    $params[':created_at'] = $createdAt;
}
$loadedFromCity = $input['loaded_from_city'] ?? null;
if ($loadedFromCity !== null) {
    $setClauses[] = 'loaded_from_city = :loaded_from_city';
    $params[':loaded_from_city'] = $loadedFromCity ?: null;
}
$outForDeliveryCity = $input['out_for_delivery_city'] ?? null;
if ($outForDeliveryCity !== null) {
    $setClauses[] = 'out_for_delivery_city = :out_for_delivery_city';
    $params[':out_for_delivery_city'] = $outForDeliveryCity ?: null;
}
$lrPdfPath = $input['lr_pdf_path'] ?? null;
if ($lrPdfPath !== null) {
    $setClauses[] = 'lr_pdf_path = :lr_pdf_path';
    $params[':lr_pdf_path'] = $lrPdfPath;
}

$sql = "UPDATE consignments SET " . implode(', ', $setClauses) . " WHERE id = :id";
$updateStmt = $pdo->prepare($sql);
$updateStmt->execute($params);

// Log activity
try {
    logActivity($pdo, 'update', 'consignment', $id, $consignment['consignment_number'], [
        'new_status' => $newStatus,
        'step'       => $stepNote ?: $stepLocation
    ]);
} catch (Exception $e) { /* Non-fatal */ }

// ─── Send status-specific email to customer ────────────────────
require_once __DIR__ . '/../email-templates.php';

$finalStatus = !empty($newStatus) ? $newStatus : $consignment['status'];
$lrDisplay = $consignment['lr_number'] ?? $consignment['consignment_number'];
$trackingUrl = 'https://panyaglobal.in/track?type=lr&q=' . urlencode($lrDisplay);

// Merge updated status into consignment data for email body
$emailConsignment = $consignment;
$emailConsignment['status'] = $finalStatus;

$emailBody    = getStatusEmailBody($finalStatus, $emailConsignment, $trackingUrl, $stepNote);
$emailSubject = getStatusEmailSubject($finalStatus, $lrDisplay);
$emailHeading = getStatusEmailHeading($finalStatus);

$emailSent = sendEmail(
    $consignment['customer_email'],
    $emailSubject,
    emailTemplate($emailHeading, $emailBody)
);

$emailStatus = ($emailSent === true) ? 'sent' : 'failed';
$emailError  = ($emailSent === true) ? null : (string)$emailSent;

$updEmailStmt = $pdo->prepare("UPDATE consignments SET last_email_status = :st, last_email_error = :err, last_email_sent_at = NOW() WHERE id = :id");
$updEmailStmt->execute([
    ':st' => $emailStatus,
    ':err' => $emailError,
    ':id' => $id
]);

// ─── Admin notification ────────────────────────────────────────
$statusLabel = $statusLabels[$finalStatus] ?? ucfirst(str_replace('_', ' ', $finalStatus));
$safeName = htmlspecialchars($consignment['customer_name'], ENT_QUOTES, 'UTF-8');
$adminBody = "<p>A consignment status has been updated.</p>
<ul>
    <li><b>Customer:</b> {$safeName}</li>
    <li><b>LR Number:</b> {$lrDisplay}</li>
    <li><b>New Status:</b> {$statusLabel}</li>
    <li><b>Route:</b> {$consignment['origin']} &rarr; {$consignment['destination']}</li>
</ul>
<p>Log in to the Admin Panel for full details.</p>";

sendAdminNotification("Status Update: {$statusLabel} | LR No: {$lrDisplay}", $adminBody);

jsonResponse(true, [
    'message'    => 'Consignment updated successfully.',
    'email_sent' => ($emailSent === true),
    'steps'      => $steps
]);
?>
