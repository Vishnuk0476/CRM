<?php
// ============================================================
// Calendar Stats — daily lead counts for a given month
// GET /api/calendar-stats.php?year=2026&month=02
// ============================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

if (!isset($_SESSION['admin_id'])) jsonResponse(false, null, 'Authentication required', 401);

$year  = intval($_GET['year']  ?? date('Y'));
$month = intval($_GET['month'] ?? date('n'));

// Clamp to valid ranges
$year  = max(2020, min(2030, $year));
$month = max(1, min(12, $month));

$from = sprintf('%04d-%02d-01', $year, $month);
$to   = date('Y-m-t', strtotime($from)); // last day of month

// Get daily totals: UNION quote_submissions + service_inquiries
$sql = "
  SELECT DATE(created_at) AS day, COUNT(*) AS cnt
  FROM (
    SELECT created_at FROM quote_submissions   WHERE created_at BETWEEN :f AND :t2
    UNION ALL
    SELECT created_at FROM service_inquiries   WHERE created_at BETWEEN :f2 AND :t3
  ) sub
  GROUP BY DATE(created_at)
  ORDER BY day ASC
";
$stmt = $pdo->prepare($sql);
$stmt->execute([':f' => $from . ' 00:00:00', ':t2' => $to . ' 23:59:59',
                ':f2'=> $from . ' 00:00:00', ':t3' => $to . ' 23:59:59']);
$rows = $stmt->fetchAll();

// Build a flat map: { "2026-02-05": 3, ... }
$daily = [];
foreach ($rows as $r) $daily[$r['day']] = (int)$r['cnt'];

$total = array_sum($daily);
$max   = $daily ? max($daily) : 0;

jsonResponse(true, [
    'year'   => $year,
    'month'  => $month,
    'from'   => $from,
    'to'     => $to,
    'total'  => $total,
    'max'    => $max,
    'daily'  => $daily,
]);
