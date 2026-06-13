<?php
// ============================================================
// GET /api/consignments/track.php
// Public endpoint — Consignment lookup by LR or AWB number
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

// CORS for public tracking page (allow all origins for this read-only endpoint)
// config.php already sets restrictive CORS — override for this public endpoint only
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
// Remove credentials header — public endpoint should NOT send cookies cross-origin
header_remove('Access-Control-Allow-Credentials');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

// ─── Rate Limiting ─────────────────────────────────────────────
rateLimit($pdo, 'track:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 20, 60);

// ─── Input ────────────────────────────────────────────────────
$searchType = strtolower(trim($_GET['type'] ?? 'lr'));   // default to 'lr'
$query      = trim($_GET['q']    ?? '');
$number     = trim($_GET['number'] ?? '');               // legacy fallback

// Legacy fallback: old links used ?number=XXX
if (!empty($number) && empty($query)) {
    $query      = $number;
    $searchType = 'lr';
}

$allowedTypes = ['lr', 'awb'];
if (!in_array($searchType, $allowedTypes)) {
    $searchType = 'lr';   // safe fallback instead of hard error
}

if (empty($query)) {
    jsonResponse(false, null, 'Please provide a search value.', 400);
}

// Prevent SQL wildcard abuse
if (preg_match('/[%_\'";\\\\ ]/', $query)) {
    jsonResponse(false, null, 'Invalid characters in search query.', 400);
}

// ─── Build Query ───────────────────────────────────────────────
if ($searchType === 'lr') {
    $stmt = $pdo->prepare("
        SELECT
            id, consignment_number, lr_number, awb_number, origin, destination,
            service_type, estimated_delivery, status, tracking_steps, packages_count, created_at
        FROM consignments
        WHERE lr_number = :val1 OR consignment_number = :val2
        ORDER BY created_at DESC LIMIT 5
    ");
    $stmt->execute([':val1' => $query, ':val2' => $query]);
} else {
    $stmt = $pdo->prepare("
        SELECT
            id, consignment_number, lr_number, awb_number, origin, destination,
            service_type, estimated_delivery, status, tracking_steps, packages_count, created_at
        FROM consignments
        WHERE awb_number = :val1
        ORDER BY created_at DESC LIMIT 5
    ");
    $stmt->execute([':val1' => $query]);
}


$rows = $stmt->fetchAll();

if (empty($rows)) {
    jsonResponse(false, null, 'No consignment found. Please check your ' . strtoupper($searchType) . ' number and try again.', 404);
}

$row   = $rows[0];
$steps = json_decode($row['tracking_steps'] ?? '[]', true);

$statusLabels = [
    'booked'            => 'Booking Confirmed',
    'picked_up'         => 'Picked Up',
    'in_transit'        => 'In Transit',
    'storage'           => 'In Storage',
    'out_for_delivery'  => 'Out for Delivery',
    'delivered'         => 'Delivered',
    'cancelled'         => 'Cancelled',
];

// If lr_number is null, use consignment_number as the display LR Number
$displayLR = !empty($row['lr_number']) ? $row['lr_number'] : $row['consignment_number'];

jsonResponse(true, [
    'multiple'          => false,
    'consignmentNo'     => $row['consignment_number'],
    'lrNumber'          => $displayLR,
    'awbNumber'         => $row['awb_number'] ?? null,
    'packagesCount'     => $row['packages_count'] ?? null,
    'status'            => $statusLabels[$row['status']] ?? ucfirst(str_replace('_', ' ', $row['status'])),
    'statusRaw'         => $row['status'],
    'origin'            => $row['origin'],
    'destination'       => $row['destination'],
    'serviceType'       => $row['service_type'],
    'estimatedDelivery' => $row['estimated_delivery']
                            ? date('M d, Y', strtotime($row['estimated_delivery']))
                            : 'To be confirmed',
    'steps'             => $steps,
    'bookedOn'          => date('M d, Y', strtotime($row['created_at'])),
]);
?>
