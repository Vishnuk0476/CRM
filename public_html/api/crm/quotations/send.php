<?php
// ============================================================
// POST — /api/crm/quotations/send.php
// Send quotation via email & WhatsApp
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';
require_once __DIR__ . '/../../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

try {
    $data = getInput();
    $id = $data['id'] ?? null;

    if (!$id) {
        jsonResponse(false, null, 'Quotation ID is required.', 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM crm_quotations WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $quotation = $stmt->fetch();

    if (!$quotation) {
        jsonResponse(false, null, 'Quotation not found.', 404);
    }

    $clientEmail = $quotation['client_email'] ?? '';
    $clientPhone = $quotation['client_phone'] ?? '';
    $qtNumber = $quotation['quotation_number'] ?? 'N/A';
    
    $grandTotal = is_numeric($quotation['grand_total']) ? (float)$quotation['grand_total'] : 0.0;
    $amount = number_format($grandTotal, 2);
    
    $origin = $quotation['origin_city'] ?? 'N/A';
    $destination = $quotation['destination_city'] ?? 'N/A';
    $validity = !empty($quotation['valid_until']) ? date('d M, Y', strtotime($quotation['valid_until'])) : 'N/A';
    $moveDate = !empty($quotation['move_date']) ? date('d M, Y', strtotime($quotation['move_date'])) : 'TBD';

    // Fetch case financials
    $caseId = $quotation['case_id'] ?? null;
    $advancePaid = 0.0;
    if ($caseId) {
        $stmtC = $pdo->prepare("SELECT total_collected FROM crm_cases WHERE id = :id");
        $stmtC->execute(['id' => $caseId]);
        $cData = $stmtC->fetch();
        if ($cData) {
            $advancePaid = (float)($cData['total_collected'] ?? 0);
        }
    }
    
    $remaining = max(0, $grandTotal - $advancePaid);
    $advanceFmt = number_format($advancePaid, 2);
    $remainingFmt = number_format($remaining, 2);

    $success = true;
    $message = 'Quotation marked as sent.';

    if (!empty($clientEmail)) {
        $subject = "Your Relocation Quotation: {$qtNumber} - Panya Global";
        
        $isRevised = strpos($qtNumber, '-V') !== false;
        $introTextEmail = $isRevised 
            ? "As discussed, we have revised your quotation for the requested services. Please find your updated relocation quotation below."
            : "Thank you for choosing <strong>Panya Global Relocation</strong>. Please find your customized relocation quotation below. We ensure a safe, secure, and seamless moving experience.";
            
        $introTextWA = $isRevised
            ? "We have revised your quotation for the requested services. Please find your updated quotation *{$qtNumber}* from Panya Global Relocation.\n"
            : "Please find your customized quotation *{$qtNumber}* from Panya Global Relocation.\n";

        $bodyHtml = "
        <p style=\"margin-top: 0; font-weight: normal;\">Dear {$quotation['client_name']},</p>
        <p style=\"line-height: 1.6; margin-bottom: 25px;\">{$introTextEmail}</p>
        
        <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color: #fafafa; border: 1px solid #e4e4e7; margin-bottom: 30px; border-radius: 8px; overflow: hidden;\">
            <tr>
                <td colspan=\"2\" style=\"background-color: #f4f4f5; padding: 12px 20px; font-size: 14px; font-weight: bold; color: #18181b; border-bottom: 1px solid #e4e4e7;\">
                    Quotation Details: {$qtNumber}
                </td>
            </tr>
            <tr>
                <td style=\"padding: 15px 20px; color: #52525b; font-size: 14px; width: 40%; border-bottom: 1px solid #f4f4f5;\">Origin</td>
                <td style=\"padding: 15px 20px; color: #18181b; font-size: 14px; text-align: right; border-bottom: 1px solid #f4f4f5;\"><strong>{$origin}</strong></td>
            </tr>
            <tr>
                <td style=\"padding: 15px 20px; color: #52525b; font-size: 14px; border-bottom: 1px solid #f4f4f5;\">Destination</td>
                <td style=\"padding: 15px 20px; color: #18181b; font-size: 14px; text-align: right; border-bottom: 1px solid #f4f4f5;\"><strong>{$destination}</strong></td>
            </tr>
            <tr>
                <td style=\"padding: 15px 20px; color: #52525b; font-size: 14px; border-bottom: 1px solid #f4f4f5;\">Move Date</td>
                <td style=\"padding: 15px 20px; color: #18181b; font-size: 14px; text-align: right; border-bottom: 1px solid #f4f4f5;\">{$moveDate}</td>
            </tr>
            <tr>
                <td style=\"padding: 15px 20px; color: #52525b; font-size: 14px; border-bottom: 1px solid #f4f4f5;\">Valid Until</td>
                <td style=\"padding: 15px 20px; color: #18181b; font-size: 14px; text-align: right; border-bottom: 1px solid #f4f4f5;\">{$validity}</td>
            </tr>
            <tr>
                <td style=\"padding: 15px 20px; color: #18181b; font-size: 15px; border-bottom: 1px solid #f4f4f5;\"><strong>Grand Total</strong></td>
                <td style=\"padding: 15px 20px; color: #0066ff; font-size: 16px; text-align: right; border-bottom: 1px solid #f4f4f5;\"><strong>INR {$amount}</strong></td>
            </tr>
            <tr>
                <td style=\"padding: 15px 20px; color: #52525b; font-size: 14px; border-bottom: 1px solid #f4f4f5;\">Advance Paid</td>
                <td style=\"padding: 15px 20px; color: #16a34a; font-size: 14px; text-align: right; border-bottom: 1px solid #f4f4f5;\">INR {$advanceFmt}</td>
            </tr>
            <tr>
                <td style=\"padding: 15px 20px; color: #52525b; font-size: 14px;\">Balance Remaining</td>
                <td style=\"padding: 15px 20px; color: #dc2626; font-size: 14px; text-align: right;\">INR {$remainingFmt}</td>
            </tr>
        </table>

        <p style=\"line-height: 1.6; margin-bottom: 25px;\">For your convenience and to ensure security, your full official PDF quotation is available via our online portal. Click below to view the detailed breakdown, download the PDF, and accept the quote.</p>
        
        <div style='text-align: center; margin-bottom: 20px;'>
            <a href='https://panyaglobal.in/client/quote/{$qtNumber}' style=\"display: inline-block; padding: 14px 28px; background-color: #0066ff; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 15px; box-shadow: 0 4px 6px rgba(0, 102, 255, 0.2);\">View &amp; Download PDF Quotation</a>
        </div>
        
        <p style=\"line-height: 1.6; margin-top: 30px;\">
            Sincerely,<br>
            <strong>Panya Global Relocation Team</strong>
        </p>
        ";
        
        $htmlBody = crmEmailTemplate("Your Quotation {$qtNumber}", $bodyHtml);
        
        // We omit the 4th and 5th arguments so it falls back to SMTP_FROM_NAME and SMTP_FROM_EMAIL from .env
        // This fixes the "Failed to send: The From field domain is not verified" error.
        $emailResult = sendEmail(
            $clientEmail, 
            $subject, 
            $htmlBody
        );
        
        if ($emailResult !== true) {
            $success = false;
            $message = 'Failed to send email: ' . $emailResult;
        }
    }

    $waUrl = null;
    if (!empty($clientPhone)) {
        $cleanPhone = preg_replace('/[^0-9]/', '', (string)$clientPhone);
        if (strlen($cleanPhone) == 10) $cleanPhone = '91' . $cleanPhone;
        
        $waText = urlencode(
            "Hello {$quotation['client_name']},\n\n" .
            $introTextWA .
            "Route: {$origin} to {$destination}\n" .
            "Grand Total: *INR {$amount}*\n\n" .
            "Let us know if you have any questions!\n\n" .
            "Best regards,\nPanya Global Team"
        );
        $waUrl = "https://wa.me/{$cleanPhone}?text={$waText}";
    }

    $stmtUpdate = $pdo->prepare("UPDATE crm_quotations SET status = 'sent', sent_at = NOW() WHERE id = :id");
    $stmtUpdate->execute(['id' => $id]);

    $caseId = $quotation['case_id'] ?? null;
    if ($caseId) {
        $pdo->prepare("UPDATE crm_cases SET milestone = 'quotation_sent' WHERE id = ?")->execute([(int)$caseId]);
    }

    logActivity($pdo, 'sent_quotation', 'quotation', (int)$id, $qtNumber, ['email' => $clientEmail, 'phone' => $clientPhone]);

    $followUpDate = date('Y-m-d', strtotime('+3 days'));
    
    // Make sure crm_team_tasks exists before inserting to avoid 500 errors
    $tableExists = $pdo->query("SHOW TABLES LIKE 'crm_team_tasks'")->rowCount() > 0;
    
    if ($tableExists) {
        $assigneeId = $quotation['created_by'] ?? $_SESSION['admin_id'] ?? null;
        if ($assigneeId) {
            $stmtName = $pdo->prepare("SELECT name FROM admins WHERE id = ?");
            $stmtName->execute([$assigneeId]);
            $adminName = $stmtName->fetchColumn();
            
            if ($adminName) {
                $stmtTask = $pdo->prepare("
                    INSERT INTO crm_team_tasks (task_description, task_date, status, assigned_to)
                    VALUES (:desc, :due, 'pending', :assignee)
                ");
                $stmtTask->execute([
                    'desc' => "Follow up on Quotation {$qtNumber}. Auto-created task.",
                    'due' => $followUpDate,
                    'assignee' => $adminName
                ]);
            }
        }
    }

    jsonResponse($success, ['whatsapp_url' => $waUrl], $success ? 'Quotation sent successfully' : $message);

} catch (Exception $e) {
    error_log("Quotation Send Error: " . $e->getMessage());
    jsonResponse(false, null, 'Server error: ' . $e->getMessage(), 500);
}

