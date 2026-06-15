<?php
require_once __DIR__ . '/../../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

requireRole('owner', 'super_admin', 'manager', 'salesperson');

$input = getInput();
$leadId = (int)($input['lead_id'] ?? 0);

if (!$leadId) {
    jsonResponse(false, null, 'Lead ID is required.', 400);
}

// Check if lead exists and not already converted
$stmt = $pdo->prepare("SELECT * FROM crm_leads WHERE id = :id");
$stmt->execute([':id' => $leadId]);
$lead = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$lead) {
    jsonResponse(false, null, 'Lead not found.', 404);
}

if ($lead['converted_to_case']) {
    jsonResponse(false, null, 'Lead is already converted to a case.', 400);
}

try {
    $pdo->beginTransaction();

    $caseNumber = 'C-' . date('ym') . str_pad($leadId, 4, '0', STR_PAD_LEFT);

    $leadStatus = $lead['status'] ?? 'enquiry';
    $milestone = 'inquiry_received';
    if ($leadStatus === 'quoted') {
        $milestone = 'quotation_sent';
    } elseif ($leadStatus === 'confirmed') {
        $milestone = 'quotation_accepted';
    }

    // Insert into Cases table
    $insertStmt = $pdo->prepare("
        INSERT INTO crm_cases (
            case_number, lead_id, client_name, client_phone, client_alternate_phone, client_email, company_name,
            relocation_type, origin_city, destination_city,
            move_date_expected, assigned_consultant_id, assigned_at, case_status, milestone, is_gulf_nri,
            family_adults, family_children, special_requirements, notes, created_by
        ) VALUES (
            :case_number, :lead_id, :client_name, :client_phone, :client_alternate_phone, :client_email, :company_name,
            :relocation_type, :origin_city, :destination_city,
            :move_date_expected, :assigned_consultant_id, :assigned_at, 'active', :milestone, :is_gulf_nri,
            :family_adults, :family_children, :special_requirements, :notes, :created_by
        )
    ");
    
    // Attempt move timeline -> move date mapping if possible, else null
    $moveDate = null;

    $insertStmt->execute([
        ':case_number' => $caseNumber,
        ':lead_id' => $leadId,
        ':client_name' => $lead['customer_name'],
        ':client_phone' => $lead['phone'],
        ':client_alternate_phone' => $lead['alternate_phone'],
        ':client_email' => $lead['email'],
        ':company_name' => $lead['company_name'],
        ':relocation_type' => $lead['relocation_type'],
        ':origin_city' => $lead['origin_city'],
        ':destination_city' => $lead['destination_city'],
        ':move_date_expected' => $moveDate,
        ':assigned_consultant_id' => $lead['assigned_to'],
        ':assigned_at' => $lead['assigned_to'] ? date('Y-m-d H:i:s') : null,
        ':milestone' => $milestone,
        ':is_gulf_nri' => $lead['is_gulf_nri'],
        ':family_adults' => $lead['family_adults'],
        ':family_children' => $lead['family_children'],
        ':special_requirements' => $lead['special_requirements'],
        ':notes' => $lead['notes'],
        ':created_by' => $_SESSION['admin_id'] ?? null
    ]);

    $caseId = $pdo->lastInsertId();

    // Update Lead to marked as converted
    $updateLead = $pdo->prepare("UPDATE crm_leads SET converted_to_case = 1, case_id = :case_id, status = 'confirmed' WHERE id = :lead_id");
    $updateLead->execute([':case_id' => $caseId, ':lead_id' => $leadId]);

    // Link existing quotations to this case
    $pdo->prepare("UPDATE crm_quotations SET case_id = :case_id WHERE lead_id = :lead_id")
        ->execute([':case_id' => $caseId, ':lead_id' => $leadId]);

    // Link existing surveys to this case
    $pdo->prepare("UPDATE crm_surveys SET case_id = :case_id WHERE lead_id = :lead_id")
        ->execute([':case_id' => $caseId, ':lead_id' => $leadId]);

    // Add initial milestone
    $mStmt = $pdo->prepare("INSERT INTO crm_case_milestones (case_id, milestone, milestone_date, notes, done_by) VALUES (?, ?, NOW(), 'Case created from lead conversion', ?)");
    $mStmt->execute([$caseId, $milestone, $_SESSION['admin_id'] ?? null]);

    $pdo->commit();

    // Email to assigned consultant
    if (!empty($lead['assigned_to'])) {
        require_once __DIR__ . '/../../helpers.php';
        $adminInfo = getAdminById($pdo, $lead['assigned_to']);
        if ($adminInfo && !empty($adminInfo['email'])) {
            $body = "<p>Hello <strong>{$adminInfo['name']}</strong>,</p>";
            $body .= "<p>A lead you are assigned to has been successfully converted into an active case <strong>{$caseNumber}</strong>.</p>";
            $body .= "<table style='width:100%;border-collapse:collapse;margin-top:15px;margin-bottom:15px;'>";
            $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;width:35%;'>Customer Name</td><td style='padding:10px;border:1px solid #e2e8f0;'>" . htmlspecialchars($lead['customer_name']) . "</td></tr>";
            $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;'>Route</td><td style='padding:10px;border:1px solid #e2e8f0;'>" . htmlspecialchars($lead['origin_city']) . " &rarr; " . htmlspecialchars($lead['destination_city']) . "</td></tr>";
            $body .= "</table>";
            $body .= "<p style='margin-top:25px;'><a href='https://panyaglobal.in/admin/cases' style='display:inline-block;padding:12px 24px;background-color:#0f172a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;'>View Case</a></p>";

            sendEmail(
                $adminInfo['email'], 
                "Case Created: {$caseNumber}", 
                crmEmailTemplate('Lead Converted to Case', $body)
            );
        }
    }

    // Email to Customer
    if (!empty($lead['email'])) {
        $body = "<p>Dear <strong>" . htmlspecialchars($lead['customer_name']) . "</strong>,</p>";
        $body .= "<p>Welcome to Panya Global Relocation! Your moving file <strong>{$caseNumber}</strong> has been actively created in our system.</p>";
        $body .= "<p>Our consultant will be managing your relocation from <strong>" . htmlspecialchars($lead['origin_city']) . "</strong> to <strong>" . htmlspecialchars($lead['destination_city']) . "</strong>. You will receive further updates shortly regarding your survey and quotation.</p>";
        $body .= "<p>If you have any questions, feel free to contact us.</p>";

        sendEmail(
            $lead['email'], 
            "Welcome to Panya Global! Case #{$caseNumber}", 
            crmEmailTemplate('Your Moving File is Active', $body)
        );
    }

    jsonResponse(true, ['case_id' => $caseId, 'case_number' => $caseNumber], 'Lead converted successfully');
} catch (Exception $e) {
    $pdo->rollBack();
    error_log('[Database Error] ' . $e->getMessage());
    $errMsg = (defined('APP_DEBUG') && APP_DEBUG) ? 'Error converting lead: ' . $e->getMessage() : 'An error occurred while converting the lead. Please try again.';
    jsonResponse(false, null, $errMsg, 500);
}
