<?php
// ============================================================
// Newsletter — Public subscribe + Admin list/update
// POST /api/newsletter/subscribe.php  { email, name? }
// GET  /api/newsletter/list.php  (admin)
// POST /api/newsletter/update.php { id, is_active } (admin)
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getInput();
    $email = sanitizeInput($input['email'] ?? '');
    $name  = sanitizeInput($input['name']  ?? '') ?: null;

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(false, null, 'Valid email address is required.', 400);
    }

    // Upsert: reactivate if already subscribed
    $pdo->prepare("INSERT INTO newsletter_subscribers (email, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE is_active = 1, name = COALESCE(VALUES(name), name)")
        ->execute([$email, $name]);

    // Welcome email
    $body = "<p>Dear " . ($name ? "<strong>" . htmlspecialchars($name) . "</strong>" : "Subscriber") . ",</p>
        <p>Welcome to the Panya Global Relocation newsletter! You will now receive the latest updates, tips, and industry news directly in your inbox.</p>
        <div class='alert'>To unsubscribe at any time, simply reply to any newsletter email with 'Unsubscribe'.</div>";
    sendEmail($email, '🎉 Welcome to Panya Global Relocation Newsletter!', emailTemplate('You\'re Subscribed!', $body));

    jsonResponse(true, ['message' => 'Subscribed successfully! Welcome aboard.'], null, 201);
}

// Admin list
require_once __DIR__ . '/../admin-guard.php';
$page   = max(1, intval($_GET['page'] ?? 1));
$limit  = min(100, max(1, intval($_GET['limit'] ?? 50)));
$offset = ($page - 1) * $limit;

$activeFilterSql = isset($_GET['active']) ? 'WHERE is_active = :active' : '';
$stmt = $pdo->prepare("SELECT * FROM newsletter_subscribers $activeFilterSql ORDER BY subscribed_at DESC LIMIT :l OFFSET :o");
if (isset($_GET['active'])) {
    $stmt->bindValue(':active', intval($_GET['active']), PDO::PARAM_INT);
}
$stmt->bindValue(':l', $limit, PDO::PARAM_INT);
$stmt->bindValue(':o', $offset, PDO::PARAM_INT);
$stmt->execute();
$rows  = $stmt->fetchAll();

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM newsletter_subscribers $activeFilterSql");
if (isset($_GET['active'])) {
    $countStmt->bindValue(':active', intval($_GET['active']), PDO::PARAM_INT);
}
$countStmt->execute();
$total = (int)$countStmt->fetchColumn();
foreach ($rows as &$r) $r['is_active'] = (bool)$r['is_active'];

jsonResponse(true, ['subscribers' => $rows, 'total' => $total]);
