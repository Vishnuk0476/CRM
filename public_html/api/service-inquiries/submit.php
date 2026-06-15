<?php
// ============================================================
// Service Inquiries — Public submission
// POST /api/service-inquiries/submit.php
// Body: { service_name, service_type, name, email, phone?, form_data? }
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(false, null, 'Method not allowed', 405);

$input       = getInput();
$serviceName = sanitizeInput($input['service_name'] ?? '');
$serviceType = sanitizeInput($input['service_type'] ?? '');
$name        = sanitizeInput($input['name'] ?? '');
$email       = sanitizeInput($input['email'] ?? '');
$phone       = sanitizeInput($input['phone'] ?? '') ?: null;
$formData    = $input['form_data'] ?? [];

if (empty($serviceName)) jsonResponse(false, null, 'Service name required.', 400);
if (empty($name))         jsonResponse(false, null, 'Your name is required.', 400);
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) jsonResponse(false, null, 'Valid email required.', 400);

$newId = bin2hex(random_bytes(16)); // Generate UUID fallback
$referenceNumber = 'SI' . date('Ymd') . '-' . substr($newId, 0, 8);

$stmt = $pdo->prepare("
    INSERT INTO service_inquiries (id, reference_number, service_name, service_type, name, email, phone, form_data)
    VALUES (:id, :reference_number, :service_name, :service_type, :name, :email, :phone, :form_data)
");
$stmt->execute([
    ':id'               => $newId,
    ':reference_number' => $referenceNumber,
    ':service_name'     => $serviceName,
    ':service_type'     => $serviceType,
    ':name'             => $name,
    ':email'            => $email,
    ':phone'            => $phone,
    ':form_data'        => json_encode($formData),
]);

// Email to admin
$adminBody = "<div class='field'><div class='label'>Reference</div><div class='value'>" . htmlspecialchars($referenceNumber) . "</div></div>
    <div class='field'><div class='label'>Customer</div><div class='value'>" . htmlspecialchars($name) . " — " . htmlspecialchars($email) . " — " . htmlspecialchars($phone ?: 'N/A') . "</div></div>
    <div class='field'><div class='label'>Service</div><div class='value'>" . htmlspecialchars($serviceName) . " (" . htmlspecialchars($serviceType) . ")</div></div>
    <div class='alert'>Please review and respond within 24 hours.</div>";
sendEmail('vishnu.kumar@panyaglobal.in', "New Service Inquiry: {$serviceName} — $referenceNumber", emailTemplate('New Service Inquiry', $adminBody));

// Acknowledgment to customer
$custBody = "<p>Dear <strong>" . htmlspecialchars($name) . "</strong>,</p>
    <p>Thank you for inquiring about our <strong>" . htmlspecialchars($serviceName) . "</strong> service. Our team has received your request and will contact you within 24 hours.</p>
    <div class='field'><div class='label'>Reference Number</div><div class='value'><strong>" . htmlspecialchars($referenceNumber) . "</strong></div></div>
    <div class='alert'>Please quote this reference number in any future correspondence.</div>";
sendEmail($email, "Service Inquiry Received — $referenceNumber", emailTemplate('Inquiry Received', $custBody));

jsonResponse(true, [
    'id'               => $newId,
    'reference_number' => $referenceNumber,
    'message'          => 'Service inquiry submitted successfully.'
], null, 201);
