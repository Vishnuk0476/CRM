<?php
// ============================================================
// Contact Messages — Public submit
// POST /api/contact-messages/submit.php
// Body: { name, email, phone?, subject, message }
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(false, null, 'Method not allowed', 405);

$input   = getInput();
$name    = sanitizeInput($input['name'] ?? '');
$email   = sanitizeInput($input['email'] ?? '');
$phone   = sanitizeInput($input['phone'] ?? '') ?: null;
$subject = sanitizeInput($input['subject'] ?? '');
$message = sanitizeInput($input['message'] ?? '');

if (empty($name))    jsonResponse(false, null, 'Name is required.', 400);
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) jsonResponse(false, null, 'Valid email required.', 400);
if (empty($subject)) jsonResponse(false, null, 'Subject is required.', 400);
if (empty($message)) jsonResponse(false, null, 'Message is required.', 400);

$stmt = $pdo->prepare("INSERT INTO contact_messages (id, name, email, phone, subject, message) VALUES (UUID(), ?,?,?,?,?)");
$stmt->execute([$name, $email, $phone, $subject, $message]);

// Email to admin
$adminBody = "<div class='field'><div class='label'>From</div><div class='value'>" . htmlspecialchars($name) . " &lt;" . htmlspecialchars($email) . "&gt;</div></div>" .
    ($phone ? "<div class='field'><div class='label'>Phone</div><div class='value'>" . htmlspecialchars($phone) . "</div></div>" : '') .
    "<div class='field'><div class='label'>Subject</div><div class='value'>" . htmlspecialchars($subject) . "</div></div>
    <div class='field'><div class='label'>Message</div><div class='value'>" . nl2br(htmlspecialchars($message)) . "</div></div>
    <div class='alert'>Please respond within 24 hours for best customer service.</div>";
sendEmail('vishnu.kumar@panyaglobal.in', "New Contact: {$subject} — {$name}", emailTemplate('New Contact Form Submission', $adminBody));

// Acknowledgment to customer
$custBody = "<p>Dear <strong>" . htmlspecialchars($name) . "</strong>,</p>
    <p>Thank you for reaching out to Panya Global Relocation! We have received your message and will get back to you within 24 hours.</p>
    <div class='field'><div class='label'>Your Subject</div><div class='value'>" . htmlspecialchars($subject) . "</div></div>
    <div class='alert'><strong>Need immediate help?</strong> Call us at <a href='tel:+911141556447'>+91 11 4155 6447</a> (Mon–Sat, 9AM–6PM IST)</div>";
sendEmail($email, "We received your message — Panya Global Relocation", emailTemplate("We've Received Your Message", $custBody));

jsonResponse(true, ['message' => 'Your message has been sent. We will reply within 24 hours.'], null, 201);

