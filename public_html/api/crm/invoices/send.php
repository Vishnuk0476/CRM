<?php
// ============================================================
// POST — /api/crm/invoices/send.php
// Send invoice via email & WhatsApp
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';
require_once __DIR__ . '/../../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

try {
    $data = getInput();
    $id = $data['id'] ?? null;
    $pdfBase64 = $data['pdf_base64'] ?? null;

    if (!$id) {
        jsonResponse(false, null, 'Invoice ID is required.', 400);
    }

    $stmt = $pdo->prepare("SELECT i.*, c.origin_city, c.destination_city FROM crm_invoices i LEFT JOIN crm_cases c ON i.case_id = c.id WHERE i.id = :id");
    $stmt->execute(['id' => $id]);
    $invoice = $stmt->fetch();

    if (!$invoice) {
        jsonResponse(false, null, 'Invoice not found.', 404);
    }

    $clientEmail = $invoice['client_email'] ?? ''; // if case exists, might need to get it from crm_cases
    if (empty($clientEmail) && !empty($invoice['case_id'])) {
        $stmtC = $pdo->prepare("SELECT client_email, client_phone FROM crm_cases WHERE id = :id");
        $stmtC->execute(['id' => $invoice['case_id']]);
        $caseInfo = $stmtC->fetch();
        if ($caseInfo) {
            $clientEmail = $caseInfo['client_email'] ?? '';
            $clientPhone = $caseInfo['client_phone'] ?? '';
        }
    } else {
        $clientPhone = $invoice['client_phone'] ?? '';
    }

    $invNumber = $invoice['invoice_number'] ?? 'N/A';
    
    $grandTotal = is_numeric($invoice['grand_total']) ? (float)$invoice['grand_total'] : 0.0;
    $amountPaid = is_numeric($invoice['amount_paid']) ? (float)$invoice['amount_paid'] : 0.0;
    $balanceDue = is_numeric($invoice['balance_due']) ? (float)$invoice['balance_due'] : 0.0;
    
    $amountFmt = number_format($grandTotal, 2);
    $paidFmt = number_format($amountPaid, 2);
    $balanceFmt = number_format($balanceDue, 2);
    
    $dueDate = $invoice['due_date'] ? date('d M, Y', strtotime($invoice['due_date'])) : 'N/A';
    
    $success = true;
    $message = 'Invoice marked as sent.';

    if (!empty($clientEmail)) {
        $subject = "Your Relocation Invoice: {$invNumber} - Panya Global";
        
        $htmlBody = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <title>Invoice {$invNumber}</title>
        </head>
        <body style=\"margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;\">
            <div style=\"width: 100%; background-color: #f4f4f5; padding: 40px 10px;\">
                <table style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-top: 4px solid #2563eb;\" cellpadding='0' cellspacing='0' border='0'>
                    <tr>
                        <td style=\"padding: 30px 40px; text-align: left; border-bottom: 1px solid #f4f4f5;\">
                            <img src='https://panyaglobal.in/logo-black.png' alt='PANYA GLOBAL' style=\"max-width: 180px; height: auto; display: block;\" />
                        </td>
                    </tr>
                    <tr>
                        <td style=\"padding: 40px;\">
                            <h2 style=\"font-size: 22px; color: #18181b; margin-top: 0; font-weight: normal;\">Dear {$invoice['client_name']},</h2>
                            <p style=\"font-size: 15px; color: #3f3f46; line-height: 1.6; margin-bottom: 25px;\">Thank you for choosing <strong>Panya Global Relocation</strong>. Please find your tax invoice details below.</p>
                            
                            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color: #fafafa; border: 1px solid #e4e4e7; margin-bottom: 30px;\">
                                <tr>
                                    <td colspan=\"2\" style=\"background-color: #f4f4f5; padding: 12px 20px; font-size: 14px; font-weight: bold; color: #18181b; border-bottom: 1px solid #e4e4e7;\">
                                        Invoice Details: {$invNumber}
                                    </td>
                                </tr>
                                <tr>
                                    <td style=\"padding: 15px 20px; color: #52525b; font-size: 14px; width: 40%; border-bottom: 1px solid #f4f4f5;\">Due Date</td>
                                    <td style=\"padding: 15px 20px; color: #18181b; font-size: 14px; text-align: right; border-bottom: 1px solid #f4f4f5;\">{$dueDate}</td>
                                </tr>
                                <tr>
                                    <td style=\"padding: 15px 20px; color: #18181b; font-size: 15px; border-bottom: 1px solid #f4f4f5;\"><strong>Grand Total</strong></td>
                                    <td style=\"padding: 15px 20px; color: #2563eb; font-size: 16px; text-align: right; border-bottom: 1px solid #f4f4f5;\"><strong>INR {$amountFmt}</strong></td>
                                </tr>
                                <tr>
                                    <td style=\"padding: 15px 20px; color: #52525b; font-size: 14px; border-bottom: 1px solid #f4f4f5;\">Amount Paid</td>
                                    <td style=\"padding: 15px 20px; color: #16a34a; font-size: 14px; text-align: right; border-bottom: 1px solid #f4f4f5;\">INR {$paidFmt}</td>
                                </tr>
                                <tr>
                                    <td style=\"padding: 15px 20px; color: #52525b; font-size: 14px;\">Balance Due</td>
                                    <td style=\"padding: 15px 20px; color: #dc2626; font-size: 14px; text-align: right;\">INR {$balanceFmt}</td>
                                </tr>
                            </table>

                            <div style='background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 25px; border-radius: 6px;'>
                                <h3 style='margin-top: 0; color: #0f172a; font-size: 16px; margin-bottom: 15px;'>Bank Details for Payment</h3>
                                <div style='display: flex; gap: 20px; align-items: flex-start;'>
                                    <div style='flex: 1;'>
                                        <p style='margin: 0 0 8px 0; font-size: 14px; color: #475569;'><strong>Bank Name:</strong> ICICI BANK</p>
                                        <p style='margin: 0 0 8px 0; font-size: 14px; color: #475569;'><strong>Account Name:</strong> Panya Global Relocation Private Limited</p>
                                        <p style='margin: 0 0 8px 0; font-size: 14px; color: #475569;'><strong>A/c No.:</strong> 336105000210</p>
                                        <p style='margin: 0; font-size: 14px; color: #475569;'><strong>Branch & IFS Code:</strong> SUBHASH NAGAR & ICIC0003361</p>
                                    </div>
                                    <div style='background-color: #ffffff; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; text-align: center;'>
                                        <img src='https://quickchart.io/qr?text=upi://pay?pa=panyaglobalrelocationprivatelimited.ibz@icici%26pn=PANYA%20GLOBAL%20RELOCATION%20PVT.%20LTD.&dark=0EA5E9&centerImageUrl=https://s2.googleusercontent.com/s2/favicons?domain=panyaglobal.in%26sz=128&size=100&margin=1' alt='UPI QR Code' style='width: 100px; height: 100px;' />
                                        <div style='font-size: 11px; margin-top: 5px; color: #64748b;'>Scan to Pay via UPI</div>
                                    </div>
                                </div>
                            </div>

                            <p style=\"font-size: 15px; color: #3f3f46; line-height: 1.6; margin-bottom: 25px;\">For your convenience, your official PDF invoice is available securely online. Click below to view the itemized invoice, download the PDF, or make a payment.</p>
                            
                            <div style='text-align: left; margin-bottom: 20px;'>
                                <a href='https://panyaglobal.in/client/invoice/{$invNumber}' style=\"display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 14px;\">View Invoice &amp; Pay</a>
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
        $attachments = [];
        if (!empty($pdfBase64)) {
            // Remove data URI scheme prefix robustly
            $parts = explode(',', $pdfBase64);
            $base64Data = end($parts);
            $attachments[] = [
                'filename' => "Invoice_{$invNumber}.pdf",
                'content'  => $base64Data
            ];
        }

        $emailResult = sendEmail(
            $clientEmail, 
            $subject, 
            $htmlBody,
            null,
            null,
            $attachments
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
            "Hello {$invoice['client_name']},\n\n" .
            "Please find your tax invoice *{$invNumber}* from Panya Global Relocation.\n" .
            "Grand Total: *INR {$amountFmt}*\n" .
            "Balance Due: *INR {$balanceFmt}*\n\n" .
            "View & Pay securely here: https://panyaglobal.in/client/invoice/{$invNumber}\n\n" .
            "Let us know if you have any questions!\n\n" .
            "Best regards,\nPanya Global Team"
        );
        $waUrl = "https://wa.me/{$cleanPhone}?text={$waText}";
    }

    jsonResponse($success, ['waUrl' => $waUrl], $success ? null : $message);

} catch (Exception $e) {
    error_log("Send Invoice Error: " . $e->getMessage());
    jsonResponse(false, null, "Failed to send invoice: " . $e->getMessage(), 500);
}
