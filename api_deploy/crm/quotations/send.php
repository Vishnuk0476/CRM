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
        $subject = "Your Premium Relocation Quotation: {$qtNumber} - Panya Global";
        
        $htmlBody = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <title>Quotation {$qtNumber}</title>
        </head>
        <body style=\"margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;\">
            <div style=\"width: 100%; background-color: #f4f4f5; padding: 40px 10px;\">
                <table style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-top: 4px solid #2563eb;\" cellpadding='0' cellspacing='0' border='0'>
                    <tr>
                        <td style=\"padding: 30px 40px; text-align: left; border-bottom: 1px solid #f4f4f5;\">
                            <img src='https://panyaglobal.in/assets/images/logo.png' alt='PANYA GLOBAL' onerror=\"this.src='https://panyaglobal.com/assets/logo.png'\" style=\"max-width: 180px; height: auto; display: block;\" />
                        </td>
                    </tr>
                    <tr>
                        <td style=\"padding: 40px;\">
                            <h2 style=\"font-size: 22px; color: #18181b; margin-top: 0; font-weight: normal;\">Dear {$quotation['client_name']},</h2>
                            <p style=\"font-size: 15px; color: #3f3f46; line-height: 1.6; margin-bottom: 25px;\">Thank you for choosing <strong>Panya Global Relocation</strong>. Please find your customized relocation quotation below. We ensure a safe, secure, and seamless moving experience.</p>
                            
                            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color: #fafafa; border: 1px solid #e4e4e7; margin-bottom: 30px;\">
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
                                    <td style=\"padding: 15px 20px; color: #2563eb; font-size: 16px; text-align: right; border-bottom: 1px solid #f4f4f5;\"><strong>INR {$amount}</strong></td>
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

                            <p style=\"font-size: 15px; color: #3f3f46; line-height: 1.6; margin-bottom: 25px;\">For your convenience and to ensure security, your full official PDF quotation is available via our online portal. Click below to view the detailed breakdown, download the PDF, and accept the quote.</p>
                            
                            <div style='text-align: left; margin-bottom: 20px;'>
                                <a href='https://panyaglobal.in/client/quote/{$qtNumber}' style=\"display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 14px;\">View &amp; Download PDF Quotation</a>
                            </div>
                            
                            <p style=\"font-size: 14px; color: #52525b; line-height: 1.6; margin-top: 30px;\">
                                Sincerely,<br>
                                <strong>Panya Global Relocation Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style=\"background-color: #f4f4f5; padding: 25px 40px; text-align: left; border-top: 1px solid #e4e4e7;\">
                            <p style=\"color: #71717a; font-size: 12px; line-height: 1.5; margin: 0;\">
                                If you have any questions, please call us at <a href='tel:+918800446447' style=\"color: #2563eb; text-decoration: none;\">+91 8800 446 447</a>.<br><br>
                                &copy; " . date('Y') . " Panya Global Packers & Movers.<br>
                                All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
        ";
        
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
            "Please find your customized premium quotation *{$qtNumber}* from Panya Global Relocation.\n" .
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

