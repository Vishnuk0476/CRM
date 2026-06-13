<?php
// ============================================================
// CRM Social Posts API
// GET    /api/crm/social.php          → List posts
// POST   /api/crm/social.php          → Create post
// PUT    /api/crm/social.php          → Update post status
// DELETE /api/crm/social.php          → Delete post
// ============================================================
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $status   = $_GET['status'] ?? null;
    $platform = $_GET['platform'] ?? null;
    $limit    = min((int)($_GET['limit'] ?? 50), 200);

    $where  = ['1=1'];
    $params = [];

    if ($status) {
        $where[] = 'status = :status';
        $params[':status'] = $status;
    }
    if ($platform) {
        $where[] = 'platform = :platform';
        $params[':platform'] = $platform;
    }

    $sql = "SELECT * FROM crm_social_posts WHERE " . implode(' AND ', $where) . " ORDER BY scheduled_for DESC LIMIT :limit";
    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $posts = $stmt->fetchAll();

    jsonResponse(true, ['posts' => $posts]);
}

if ($method === 'POST') {
    $data = getInput();

    $platform      = $data['platform']      ?? 'facebook';
    $content       = trim($data['content']  ?? '');
    $scheduled_for = $data['scheduled_for'] ?? null;
    $media_url     = $data['media_url']     ?? null;

    if (empty($content) || empty($scheduled_for)) {
        jsonResponse(false, null, 'Content and scheduled date are required', 400);
    }

    $stmt = $pdo->prepare("INSERT INTO crm_social_posts (platform, content, media_url, scheduled_for, created_by, status) VALUES (?, ?, ?, ?, ?, 'draft')");
    $stmt->execute([$platform, $content, $media_url, $scheduled_for, $_SESSION['admin_id']]);
    $post_id = $pdo->lastInsertId();

    jsonResponse(true, ['id' => $post_id, 'message' => 'Post created successfully'], null, 201);
}

if ($method === 'PUT') {
    $data   = getInput();
    $id     = (int)($data['id']     ?? 0);
    $status = $data['status']       ?? null;

    if (!$id || !$status) {
        jsonResponse(false, null, 'ID and status are required', 400);
    }

    $pdo->prepare("UPDATE crm_social_posts SET status = ?, updated_at = NOW() WHERE id = ?")
        ->execute([$status, $id]);

    jsonResponse(true, ['id' => $id, 'message' => 'Status updated']);
}

if ($method === 'DELETE') {
    $data = getInput();
    $id   = (int)($data['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'ID required', 400);

    $pdo->prepare("DELETE FROM crm_social_posts WHERE id = ?")->execute([$id]);
    jsonResponse(true, ['message' => 'Post deleted']);
}

jsonResponse(false, null, 'Method not allowed', 405);
