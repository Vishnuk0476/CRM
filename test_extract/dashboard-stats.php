<?php
// ============================================================
// Dashboard Stats — Period-over-period analytics
// GET /api/dashboard-stats.php
// ============================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

if (!isset($_SESSION['admin_id'])) jsonResponse(false, null, 'Authentication required', 401);

// ─── Date boundaries ─────────────────────────────────────────
$today       = date('Y-m-d');
$monthStart  = date('Y-m-01');
$lastMonthStart = date('Y-m-01', strtotime('-1 month'));
$lastMonthEnd   = date('Y-m-t', strtotime('-1 month'));
$weekStart   = date('Y-m-d', strtotime('monday this week'));
$lastWeekStart = date('Y-m-d', strtotime('monday last week'));
$lastWeekEnd   = date('Y-m-d', strtotime('sunday last week'));

// ─── Helper: count rows in a date range ──────────────────────
function countBetween(PDO $pdo, string $table, string $from, string $to, string $status = ''): int {
    $allowed = ['quote_submissions', 'service_inquiries', 'consignments', 'contact_messages'];
    if (!in_array($table, $allowed, true)) return 0;
    $sql = "SELECT COUNT(*) FROM $table WHERE created_at BETWEEN :f AND :t";
    if ($status) $sql .= " AND status = :s";
    $s = $pdo->prepare($sql);
    $s->execute(array_filter([':f' => $from . ' 00:00:00', ':t' => $to . ' 23:59:59', ':s' => $status ?: null]));
    return (int)$s->fetchColumn();
}

// ─── This month ───────────────────────────────────────────────
$thisMonthQuotes    = countBetween($pdo, 'quote_submissions', $monthStart, $today);
$thisMonthInquiries = countBetween($pdo, 'service_inquiries',  $monthStart, $today);
$thisMonthTotal     = $thisMonthQuotes + $thisMonthInquiries;

$thisMonthPending    = countBetween($pdo,'quote_submissions',$monthStart,$today,'pending')   + countBetween($pdo,'service_inquiries',$monthStart,$today,'pending');
$thisMonthCompleted  = countBetween($pdo,'quote_submissions',$monthStart,$today,'completed') + countBetween($pdo,'service_inquiries',$monthStart,$today,'completed');

// ─── Last month ───────────────────────────────────────────────
$lastMonthQuotes    = countBetween($pdo, 'quote_submissions', $lastMonthStart, $lastMonthEnd);
$lastMonthInquiries = countBetween($pdo, 'service_inquiries',  $lastMonthStart, $lastMonthEnd);
$lastMonthTotal     = $lastMonthQuotes + $lastMonthInquiries;

// ─── This week ────────────────────────────────────────────────
$thisWeekTotal  = countBetween($pdo,'quote_submissions',$weekStart,$today) + countBetween($pdo,'service_inquiries',$weekStart,$today);
$lastWeekTotal  = countBetween($pdo,'quote_submissions',$lastWeekStart,$lastWeekEnd) + countBetween($pdo,'service_inquiries',$lastWeekStart,$lastWeekEnd);

// ─── All-time total ───────────────────────────────────────────
$allTotal = (int)$pdo->query("SELECT (SELECT COUNT(*) FROM quote_submissions) + (SELECT COUNT(*) FROM service_inquiries)")->fetchColumn();

// ─── Unread contact messages ─────────────────────────────────
$unread = 0;
try {
    $unread = (int)$pdo->query("SELECT COUNT(*) FROM contact_messages WHERE is_read = 0")->fetchColumn();
} catch (Exception $e) {
    // Table may not exist yet — default to 0
}

// ─── 14-day daily sparkline ───────────────────────────────────
$sparkline = [];
for ($i = 13; $i >= 0; $i--) {
    $day = date('Y-m-d', strtotime("-$i days"));
    $cnt = countBetween($pdo, 'quote_submissions', $day, $day)
         + countBetween($pdo, 'service_inquiries',  $day, $day);
    $sparkline[] = ['date' => date('d M', strtotime("-$i days")), 'count' => $cnt];
}

// ─── Last 6 months trend ─────────────────────────────────
$monthly_trend = [];
for ($i = 5; $i >= 0; $i--) {
    $mStart = date('Y-m-01', strtotime("-$i months"));
    $mEnd   = date('Y-m-t',  strtotime("-$i months"));
    $label  = date('M Y',    strtotime("-$i months"));
    $q = countBetween($pdo, 'quote_submissions', $mStart, $mEnd);
    $s = countBetween($pdo, 'service_inquiries',  $mStart, $mEnd);
    $monthly_trend[] = ['month' => $label, 'quotes' => $q, 'inquiries' => $s, 'total' => $q + $s];
}

jsonResponse(true, [
    'period'        => 'This month vs last month',
    'all_time'      => $allTotal,
    'this_month'    => $thisMonthTotal,
    'last_month'    => $lastMonthTotal,
    'month_delta'   => delta($thisMonthTotal, $lastMonthTotal),
    'quotes'        => ['current' => $thisMonthQuotes,   'prev' => $lastMonthQuotes,    'delta' => delta($thisMonthQuotes, $lastMonthQuotes)],
    'inquiries'     => ['current' => $thisMonthInquiries,'prev' => $lastMonthInquiries, 'delta' => delta($thisMonthInquiries, $lastMonthInquiries)],
    'pending'       => ['current' => $thisMonthPending,  'delta' => ['value' => $thisMonthPending, 'direction' => 'flat']],
    'completed'     => ['current' => $thisMonthCompleted,'delta' => delta($thisMonthCompleted, 0)],
    'this_week'     => ['current' => $thisWeekTotal,  'delta' => delta($thisWeekTotal, $lastWeekTotal)],
    'unread_msgs'   => $unread,
    'sparkline'     => $sparkline,
    'monthly_trend' => $monthly_trend,
]);
