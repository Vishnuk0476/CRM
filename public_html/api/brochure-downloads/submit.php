<?php
// ============================================================
// Brochure Downloads — Public submit + Admin list
// POST /api/brochure-downloads/submit.php  { name, email, phone, company? }
// GET  /api/brochure-downloads/list.php  (admin)
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input   = getInput();
    $name    = sanitizeInput($input['name']    ?? '');
    $email   = sanitizeInput($input['email']   ?? '');
    $phone   = sanitizeInput($input['phone']   ?? '');
    $company = sanitizeInput($input['company'] ?? '') ?: null;

    if (empty($name))  jsonResponse(false, null, 'Name required.', 400);
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) jsonResponse(false, null, 'Valid email required.', 400);
    if (empty($phone)) jsonResponse(false, null, 'Phone required.', 400);

    $pdo->prepare("INSERT INTO brochure_downloads (name, email, phone, company) VALUES (?,?,?,?)")->execute([$name, $email, $phone, $company]);

    // Email admin notification
    $adminBody = "<p>A new brochure download lead has been received.</p>
        <div class='field'><div class='label'>Name</div><div class='value'>" . htmlspecialchars($name) . "</div></div>
        <div class='field'><div class='label'>Email</div><div class='value'>" . htmlspecialchars($email) . "</div></div>
        <div class='field'><div class='label'>Phone</div><div class='value'>" . htmlspecialchars($phone) . "</div></div>" .
        ($company ? "<div class='field'><div class='label'>Company</div><div class='value'>" . htmlspecialchars($company) . "</div></div>" : '');
    sendEmail('admin@panyaglobal.in', '📄 New Brochure Download Lead', emailTemplate('New Brochure Lead', $adminBody));

    jsonResponse(true, ['message' => 'Brochure sent to your email. Thank you!'], null, 201);
}

// Admin list
require_once __DIR__ . '/../admin-guard.php';
$page   = max(1, intval($_GET['page'] ?? 1));
$limit  = min(100, max(1, intval($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;
$stmt   = $pdo->prepare("SELECT * FROM brochure_downloads ORDER BY created_at DESC LIMIT :l OFFSET :o");
$stmt->bindValue(':l', $limit, PDO::PARAM_INT);
$stmt->bindValue(':o', $offset, PDO::PARAM_INT);
$stmt->execute();
$rows  = $stmt->fetchAll();
$total = (int)$pdo->query("SELECT COUNT(*) FROM brochure_downloads")->fetchColumn();
jsonResponse(true, ['downloads' => $rows, 'total' => $total]);
