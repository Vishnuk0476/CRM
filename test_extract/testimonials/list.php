<?php
// ============================================================
// Testimonials — Public list (approved only) | Admin list (all)
// GET /api/testimonials/list.php?admin=1&page=1&limit=20
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

$isAdmin = false;
// If session is active and user is admin
if (isset($_SESSION['admin_id'])) {
    $isAdmin = true;
}

$page   = max(1, intval($_GET['page'] ?? 1));
$limit  = min(100, max(1, intval($_GET['limit'] ?? 50)));
$offset = ($page - 1) * $limit;

if ($isAdmin && isset($_GET['admin'])) {
    // Admin: return all testimonials
    $stmt = $pdo->prepare("SELECT * FROM testimonials ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
} else {
    // Public: approved only
    $stmt = $pdo->prepare("SELECT * FROM testimonials WHERE is_approved = 1 ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
}
$stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll();

// Count
if ($isAdmin && isset($_GET['admin'])) {
    $total = $pdo->query("SELECT COUNT(*) FROM testimonials")->fetchColumn();
} else {
    $total = $pdo->query("SELECT COUNT(*) FROM testimonials WHERE is_approved = 1")->fetchColumn();
}

// Cast booleans and parse JSON
foreach ($rows as &$row) {
    $row['is_video']    = (bool) $row['is_video'];
    $row['is_approved'] = (bool) $row['is_approved'];
    if (!empty($row['media_urls']) && is_string($row['media_urls'])) {
        $row['media_urls'] = json_decode($row['media_urls'], true) ?? [];
    } else {
        $row['media_urls'] = [];
    }
}

jsonResponse(true, [
    'testimonials' => $rows,
    'pagination'   => [
        'current_page' => $page,
        'per_page'     => $limit,
        'total'        => (int)$total,
        'total_pages'  => ceil($total / $limit),
    ]
]);
