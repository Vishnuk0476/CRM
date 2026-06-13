<?php
// ============================================================
// CRM Case Detail — GET /api/crm/cases/detail.php?id=X
// Returns full case data with linked quotations, invoices, milestones
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$id = (int)($_GET['id'] ?? 0);

if (!$id) {
    jsonResponse(false, null, 'Case ID is required.', 400);
}

// Fetch case with all linked admin names
$stmt = $pdo->prepare("
    SELECT c.*,
           a.name  AS assigned_to_name,
           s.name  AS assigned_sales_name,
           m.name  AS assigned_manager_name,
           a2.name AS created_by_name
    FROM crm_cases c
    LEFT JOIN admins a  ON a.id  = c.assigned_consultant_id
    LEFT JOIN admins s  ON s.id  = c.assigned_sales_id
    LEFT JOIN admins m  ON m.id  = c.assigned_manager_id
    LEFT JOIN admins a2 ON a2.id = c.created_by
    WHERE c.id = :id
");
$stmt->execute([':id' => $id]);
$case = $stmt->fetch();

if (!$case) {
    jsonResponse(false, null, 'Case not found.', 404);
}

// IDOR check for non-managers/admins
$adminRole = $_SESSION['admin_role'] ?? '';
$adminId   = $_SESSION['admin_id']   ?? 0;
if (!in_array($adminRole, ['owner', 'super_admin', 'manager'])) {
    if ($case['assigned_consultant_id'] != $adminId && $case['assigned_sales_id'] != $adminId) {
        jsonResponse(false, null, 'Access denied. You do not own this case.', 403);
    }
}

// Fetch milestone history
$mStmt = $pdo->prepare("SELECT * FROM crm_case_milestones WHERE case_id = :id ORDER BY created_at ASC");
$mStmt->execute([':id' => $id]);
$milestones = $mStmt->fetchAll();

// Fetch linked quotations
$qStmt = $pdo->prepare("
    SELECT id, quotation_number, grand_total, status, created_at
    FROM crm_quotations
    WHERE case_id = :id
    ORDER BY created_at DESC
");
$qStmt->execute([':id' => $id]);
$quotations = $qStmt->fetchAll();

// Fetch linked invoices
$iStmt = $pdo->prepare("
    SELECT id, invoice_number, grand_total, amount_paid, balance_due, status, created_at
    FROM crm_invoices
    WHERE case_id = :id
    ORDER BY created_at DESC
");
$iStmt->execute([':id' => $id]);
$invoices = $iStmt->fetchAll();

// Fetch linked lead (for phone/email fallback)
$lead = null;
if ($case['lead_id']) {
    $lStmt = $pdo->prepare("SELECT id, customer_name, phone, email, origin_city, destination_city FROM crm_leads WHERE id = :id");
    $lStmt->execute([':id' => $case['lead_id']]);
    $lead = $lStmt->fetch() ?: null;
}

jsonResponse(true, [
    'case'       => $case,
    'lead'       => $lead,
    'milestones' => $milestones,
    'quotations' => $quotations,
    'invoices'   => $invoices,
]);
