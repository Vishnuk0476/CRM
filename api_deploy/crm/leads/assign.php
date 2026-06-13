<?php
require_once '../../config.php';
require_once '../../admin-guard.php';
require_once '../../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    requirePermission('leads', 'cases'); // need access to leads
    
    $input = getInput();
    $leadIds = $input['lead_ids'] ?? [];
    $assignedTo = isset($input['assigned_to']) ? (int)$input['assigned_to'] : null;
    
    if (empty($leadIds) || !is_array($leadIds)) {
        jsonResponse(false, null, 'No leads selected.', 400);
    }
    if (!$assignedTo) {
        jsonResponse(false, null, 'User to assign is required.', 400);
    }
    
    $placeholders = str_repeat('?,', count($leadIds) - 1) . '?';
    $sql = "UPDATE crm_leads SET assigned_to = ? WHERE id IN ($placeholders)";
    $params = array_merge([$assignedTo], $leadIds);
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Fetch newly assigned admin info
    $adminInfo = getAdminById($pdo, $assignedTo);
    
    // Fetch leads to send emails
    $leadsStmt = $pdo->prepare("SELECT customer_name, phone, email, origin_city, destination_city FROM crm_leads WHERE id IN ($placeholders)");
    $leadsStmt->execute($leadIds);
    $updatedLeads = $leadsStmt->fetchAll(PDO::FETCH_ASSOC);

    if ($adminInfo && !empty($adminInfo['email'])) {
        foreach ($updatedLeads as $lead) {
            $body = "<p>Hello <strong>{$adminInfo['name']}</strong>,</p>";
            $body .= "<p>A new lead has been assigned to you. Here are the details:</p>";
            $body .= "<table style='width:100%;border-collapse:collapse;margin-top:15px;margin-bottom:15px;'>";
            $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;width:35%;'>Customer Name</td><td style='padding:10px;border:1px solid #e2e8f0;'>" . htmlspecialchars($lead['customer_name']) . "</td></tr>";
            $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;'>Phone</td><td style='padding:10px;border:1px solid #e2e8f0;'>" . htmlspecialchars($lead['phone']) . "</td></tr>";
            $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;'>Email</td><td style='padding:10px;border:1px solid #e2e8f0;'>" . htmlspecialchars($lead['email']) . "</td></tr>";
            $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;'>Route</td><td style='padding:10px;border:1px solid #e2e8f0;'>" . htmlspecialchars($lead['origin_city']) . " &rarr; " . htmlspecialchars($lead['destination_city']) . "</td></tr>";
            $body .= "</table>";
            $body .= "<p style='margin-top:25px;'><a href='https://panyaglobal.in/admin/leads' style='display:inline-block;padding:12px 24px;background-color:#0f172a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;'>View in CRM</a></p>";

            sendEmail(
                $adminInfo['email'], 
                "New Lead Assigned: " . htmlspecialchars($lead['customer_name']), 
                crmEmailTemplate('New Lead Assigned', $body)
            );
        }
    }

    // Log activity
    $adminId = $_SESSION['admin_id'];
    foreach ($leadIds as $id) {
        logActivity($pdo, 'LEAD_ASSIGNED', 'crm_lead', (string)$id, null, [
            'assigned_to' => $assignedTo,
            'assigned_by' => $adminId
        ]);
    }
    
    jsonResponse(true, null, 'Leads assigned successfully.', 200);
} else {
    jsonResponse(false, null, 'Method not allowed.', 405);
}
