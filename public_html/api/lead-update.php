<?php
// ============================================================
// Lead Update API (Admin only)
// POST /api/lead-update.php
// ============================================================
require_once __DIR__ . '/admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input = getInput();

if (!$input || empty($input['id'])) {
    jsonResponse(false, null, 'Invalid input or missing ID', 400);
}

$id = sanitizeInput($input['id']);
$status = sanitizeInput($input['status'] ?? '');
$message = sanitizeInput($input['message'] ?? '');
$source = sanitizeInput($input['source'] ?? '');

if (empty($status) && $source !== 'Contact Form') {
    jsonResponse(false, null, 'Status is required', 400);
}

try {
    $custEmail = '';
    $custName = '';
    $ref = '';

    if ($source === 'Quote') {
        $stmt = $pdo->prepare("UPDATE quote_submissions SET status = :status, status_message = :msg WHERE id = :id");
        $stmt->execute([':status' => $status, ':msg' => $message, ':id' => $id]);
        $row = $pdo->prepare("SELECT name, email, reference_number FROM quote_submissions WHERE id = :id");
        $row->execute([':id' => $id]);
        $row = $row->fetch();
        if ($row) { $custEmail = $row['email']; $custName = $row['name']; $ref = $row['reference_number']; }
    } elseif ($source === 'Service Inquiry') {
        $stmt = $pdo->prepare("UPDATE service_inquiries SET status = :status, status_message = :msg WHERE id = :id");
        $stmt->execute([':status' => $status, ':msg' => $message, ':id' => $id]);
        $row = $pdo->prepare("SELECT name, email, reference_number FROM service_inquiries WHERE id = :id");
        $row->execute([':id' => $id]);
        $row = $row->fetch();
        if ($row) { $custEmail = $row['email']; $custName = $row['name']; $ref = $row['reference_number']; }
    } elseif ($source === 'Contact Form') {
        $is_read = ($status === 'completed' || $status === 'reviewed' || $status === 'read' || $status === 'confirmed') ? 1 : 0;
        $stmt = $pdo->prepare("UPDATE contact_messages SET is_read = :r WHERE id = :id");
        $stmt->execute([':r' => $is_read, ':id' => $id]);
        $row = $pdo->prepare("SELECT name, email FROM contact_messages WHERE id = :id");
        $row->execute([':id' => $id]);
        $row = $row->fetch();
        if ($row) { $custEmail = $row['email']; $custName = $row['name']; $ref = 'Contact Form'; }
    } else {
        jsonResponse(false, null, 'Invalid lead source type.', 400);
    }

    logActivity($pdo, 'Lead Updated', 'lead', (string)$id, "Status updated to $status for $source by Admin");

    // Send status update email to the customer
    if (!empty($status) && !empty($custEmail)) {
        $subj = "Update on your Request" . ($ref && $ref !== 'Contact Form' ? " ($ref)" : "");
        $body = "<p>Dear <strong>" . htmlspecialchars($custName) . "</strong>,</p>
            <p>The status of your request" . ($ref && $ref !== 'Contact Form' ? " (<strong>" . htmlspecialchars($ref) . "</strong>)" : "") . " has been updated to: <strong style='text-transform:uppercase;'>" . htmlspecialchars($status) . "</strong>.</p>";
        if (!empty($message)) {
            $body .= "<div class='alert'><strong>Message from our team:</strong><br/>" . nl2br(htmlspecialchars($message)) . "</div>";
        }
        $body .= "<p>If you have any questions, please reply to this email or call us at +91 8800446447.</p>";

        sendEmail($custEmail, $subj, emailTemplate('Request Status Updated', $body));
    }

    jsonResponse(true, ['message' => 'Lead updated successfully']);
} catch (Exception $e) {
    jsonResponse(false, null, 'Failed to update lead.', 500);
}
?>
