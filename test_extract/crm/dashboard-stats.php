<?php
// ============================================================
// CRM Dashboard Stats — Owner/Manager KPIs
// GET /api/crm/dashboard-stats.php
// ============================================================
require_once __DIR__ . '/../admin-guard.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonResponse(false, null, 'Method not allowed', 405);

$role = $_SESSION['admin_role'] ?? '';
$myId = $_SESSION['admin_id'] ?? 0;

// Salesperson filter — crm_leads uses assigned_to not salesperson_id
$spWhere = '';
$spParams = [];
if ($role === 'salesperson') {
    $spWhere = ' AND l.assigned_to = :my_id';
    $spParams[':my_id'] = $myId;
}

$month = trim($_GET['month'] ?? date('Y-m')); // YYYY-MM

// ─── Lead stats ──────────────────────────────────────────────
$leadSql = "SELECT
    COUNT(*) AS total_leads,
    SUM(status = 'new') AS new_leads,
    SUM(status = 'contacted') AS contacted,
    SUM(status = 'qualified') AS qualified,
    SUM(status = 'quoted') AS quoted,
    SUM(status = 'confirmed') AS confirmed,
    SUM(status = 'in_transit') AS in_transit,
    SUM(status = 'completed') AS completed,
    SUM(status = 'cancelled') AS cancelled,
    COALESCE(SUM(estimated_amount), 0) AS total_estimated
    FROM crm_leads l WHERE DATE_FORMAT(l.created_at, '%Y-%m') = :month $spWhere";
$stmt = $pdo->prepare($leadSql);
$stmt->execute(array_merge([':month' => $month], $spParams));
$leadStats = $stmt->fetch();

// Conversion rate
$totalNonCancelled = ($leadStats['total_leads'] ?? 0) - ($leadStats['cancelled'] ?? 0);
$converted = ($leadStats['confirmed'] ?? 0) + ($leadStats['in_transit'] ?? 0) + ($leadStats['completed'] ?? 0);
$conversionRate = $totalNonCancelled > 0 ? round(($converted / $totalNonCancelled) * 100, 1) : 0;

// ─── Revenue stats (use actual amount_paid/balance_due columns) ─
$revSql = "SELECT
    COALESCE(SUM(grand_total), 0) AS total_invoiced,
    COALESCE(SUM(amount_paid), 0) AS total_collected,
    COALESCE(SUM(balance_due), 0) AS total_pending,
    COALESCE(SUM(total_tax), 0) AS total_gst,
    COUNT(*) AS invoice_count
    FROM crm_invoices
    WHERE DATE_FORMAT(created_at, '%Y-%m') = :month
    AND status != 'cancelled'";
$rStmt = $pdo->prepare($revSql);
$rStmt->execute([':month' => $month]);
$revStats = $rStmt->fetch();

// ─── Expenses ────────────────────────────────────────────────
$expSql = "SELECT COALESCE(SUM(amount), 0) AS total_expenses FROM crm_expenses WHERE DATE_FORMAT(expense_date, '%Y-%m') = :month";
$eStmt = $pdo->prepare($expSql);
$eStmt->execute([':month' => $month]);
$totalExpenses = (float)$eStmt->fetchColumn();

// ─── Team performance (only for owner/manager/super_admin) ────
$teamPerf = [];
if (in_array($role, ['owner', 'manager', 'super_admin'])) {
    $tSql = "SELECT a.id, a.name, a.email,
        COUNT(l.id) AS total_leads,
        SUM(l.status IN ('confirmed','in_transit','completed')) AS converted,
        COALESCE(SUM(l.estimated_amount), 0) AS estimated_total
        FROM admins a
        LEFT JOIN crm_leads l ON l.assigned_to = a.id AND DATE_FORMAT(l.created_at, '%Y-%m') = :month
        WHERE a.role IN ('salesperson','manager','owner','super_admin')
        GROUP BY a.id, a.name, a.email ORDER BY converted DESC";
    $tStmt = $pdo->prepare($tSql);
    $tStmt->execute([':month' => $month]);
    $teamPerf = $tStmt->fetchAll();
}

// ─── City-wise distribution (origin_city, not pickup_city) ───
$citySql = "SELECT origin_city AS city, COUNT(*) AS count FROM crm_leads l
    WHERE origin_city IS NOT NULL AND DATE_FORMAT(l.created_at, '%Y-%m') = :month $spWhere
    GROUP BY origin_city ORDER BY count DESC LIMIT 10";
$cStmt = $pdo->prepare($citySql);
$cStmt->execute(array_merge([':month' => $month], $spParams));
$cityWise = $cStmt->fetchAll();

// ─── Today's follow-ups from crm_followups ───────────────────
$todayFollowUps = 0;
try {
    $fuSql = "SELECT COUNT(*) FROM crm_followups WHERE DATE(scheduled_at) = CURDATE() AND status = 'pending'";
    $todayFollowUps = (int)$pdo->query($fuSql)->fetchColumn();
} catch (Exception $e) {}

// ─── Overdue payments ────────────────────────────────────────
$overduePayments = 0;
try {
    $odSql = "SELECT COUNT(*) FROM crm_invoices WHERE status IN ('pending','partial') AND due_date < CURDATE() AND due_date IS NOT NULL";
    $overduePayments = (int)$pdo->query($odSql)->fetchColumn();
} catch (Exception $e) {}

// ─── Monthly trend (last 6 months) ──────────────────────────
$monthlyTrend = [];
try {
    $trendSql = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS leads,
        SUM(status IN ('confirmed','in_transit','completed')) AS converted
        FROM crm_leads l
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) $spWhere
        GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month ASC";
    $trStmt = $pdo->prepare($trendSql);
    $trStmt->execute($spParams);
    $monthlyTrend = $trStmt->fetchAll();
} catch (Exception $e) {}

// ─── Cases stats ─────────────────────────────────────────────
$casesStats = ['total' => 0, 'active' => 0, 'on_hold' => 0, 'completed' => 0, 'cancelled' => 0];
try {
    $cStmt2 = $pdo->prepare("SELECT
        COUNT(*) AS total,
        SUM(case_status = 'active') AS active,
        SUM(case_status = 'on_hold') AS on_hold,
        SUM(case_status = 'completed') AS completed,
        SUM(case_status = 'cancelled') AS cancelled
        FROM crm_cases WHERE DATE_FORMAT(created_at, '%Y-%m') = :month");
    $cStmt2->execute([':month' => $month]);
    $casesStats = $cStmt2->fetch() ?: $casesStats;
} catch (Exception $e) {}

// ─── Quotations stats ─────────────────────────────────────────
$quotStats = ['total' => 0, 'total_value' => 0, 'accepted' => 0];
try {
    $qStmt = $pdo->prepare("SELECT COUNT(*) AS total,
        COALESCE(SUM(grand_total), 0) AS total_value,
        SUM(status = 'accepted') AS accepted
        FROM crm_quotations WHERE DATE_FORMAT(created_at, '%Y-%m') = :month");
    $qStmt->execute([':month' => $month]);
    $quotStats = $qStmt->fetch() ?: $quotStats;
} catch (Exception $e) {}

jsonResponse(true, [
    'month'            => $month,
    'leads'            => $leadStats,
    'conversion_rate'  => $conversionRate,
    'revenue'          => $revStats,
    'total_expenses'   => $totalExpenses,
    'net_profit'       => (float)($revStats['total_collected'] ?? 0) - $totalExpenses,
    'team_performance' => $teamPerf,
    'city_wise'        => $cityWise,
    'today_followups'  => $todayFollowUps,
    'overdue_payments' => $overduePayments,
    'monthly_trend'    => $monthlyTrend,
    'cases'            => $casesStats,
    'quotations'       => $quotStats,
]);
