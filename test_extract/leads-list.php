<?php
// ============================================================
// Leads — Combined list from quote_submissions + service_inquiries
// GET /api/leads-list.php
// Returns unified leads feed sorted by latest first
// ============================================================
require_once __DIR__ . '/admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonResponse(false, null, 'Method not allowed', 405);

$status = trim($_GET['status'] ?? '');
$search = trim($_GET['search'] ?? '');

// Build parameterized search condition
$searchCondition = '';
$params = [];
if (!empty($search)) {
    $escapedSearch = str_replace(['%', '_'], ['\\%', '\\_'], $search);
    $searchCondition = "AND (name LIKE :search OR email LIKE :search OR reference_number LIKE :search)";
    $params[':search'] = '%' . $escapedSearch . '%';
}

// UNION quote_submissions + service_inquiries into one flat shape
$sql = "
    SELECT * FROM (
        SELECT
            CONCAT('quote_', id) AS uid,
            id,
            'quote' AS lead_type,
            reference_number,
            name,
            email,
            phone AS mobile,
            service_type AS source,
            status,
            status_message,
            created_at,
            updated_at,
            DATE_FORMAT(created_at, '%d %b %Y, %h:%i %p') AS created_at_formatted
        FROM quote_submissions
        WHERE 1=1 $searchCondition
        UNION ALL
        SELECT
            CONCAT('inquiry_', id) AS uid,
            id,
            'inquiry' AS lead_type,
            reference_number,
            name,
            email,
            phone AS mobile,
            service_name AS source,
            status,
            status_message,
            created_at,
            updated_at,
            DATE_FORMAT(created_at, '%d %b %Y, %h:%i %p') AS created_at_formatted
        FROM service_inquiries
        WHERE 1=1 $searchCondition
    ) AS combined
    ORDER BY created_at DESC
";

try {
    $stmt = $pdo->prepare($sql);
    // Bind search param to both legs of the UNION
    if (!empty($search)) {
        $stmt->bindValue(':search', '%' . $escapedSearch . '%');
    }
    $stmt->execute();
    $leads = $stmt->fetchAll();

    // Apply status filter in PHP (safe, parameterized)
    if (!empty($status)) {
        $leads = array_values(array_filter($leads, fn($l) => $l['status'] === $status));
    }

    // Summary counts
    $counts = [
        'total'       => count($leads),
        'pending'     => count(array_filter($leads, fn($l) => $l['status'] === 'pending')),
        'confirmed'   => count(array_filter($leads, fn($l) => $l['status'] === 'confirmed')),
        'in_progress' => count(array_filter($leads, fn($l) => $l['status'] === 'in_progress')),
        'completed'   => count(array_filter($leads, fn($l) => $l['status'] === 'completed')),
        'quotes'      => count(array_filter($leads, fn($l) => $l['lead_type'] === 'quote')),
        'inquiries'   => count(array_filter($leads, fn($l) => $l['lead_type'] === 'inquiry')),
    ];

    jsonResponse(true, ['leads' => $leads, 'counts' => $counts]);
} catch (PDOException $e) {
    jsonResponse(true, ['leads' => [], 'counts' => ['total'=>0,'pending'=>0,'confirmed'=>0,'in_progress'=>0,'completed'=>0,'quotes'=>0,'inquiries'=>0]]);
}
