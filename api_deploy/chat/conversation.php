<?php
// ============================================================
// Chat — Conversation + Messages (AI replaces Supabase Edge Fn)
// POST /api/chat/conversation.php  { session_id }  → get/create conversation
// POST /api/chat/messages.php      { conversation_id, role, content }
// GET  /api/chat/messages.php?session_id=...  → get history
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

$path = basename($_SERVER['PHP_SELF']);

if ($path === 'conversation.php') {
    $input     = getInput();
    $sessionId = sanitizeInput($input['session_id'] ?? $_GET['session_id'] ?? '');
    if (empty($sessionId)) jsonResponse(false, null, 'session_id required.', 400);

    // Get or create
    $stmt = $pdo->prepare("SELECT * FROM chat_conversations WHERE session_id = ?");
    $stmt->execute([$sessionId]);
    $conv = $stmt->fetch();

    if (!$conv) {
        $token = bin2hex(random_bytes(16));
        $pdo->prepare("INSERT INTO chat_conversations (session_id, session_token) VALUES (?, ?)")->execute([$sessionId, $token]);
        $stmt = $pdo->prepare("SELECT * FROM chat_conversations WHERE session_id = ?");
        $stmt->execute([$sessionId]);
        $conv = $stmt->fetch();
    }
    jsonResponse(true, ['conversation' => $conv]);
}

if ($path === 'messages.php') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sessionId = trim($_GET['session_id'] ?? '');
        if (empty($sessionId)) jsonResponse(false, null, 'session_id required.', 400);

        $conv = $pdo->prepare("SELECT id FROM chat_conversations WHERE session_id = ?");
        $conv->execute([$sessionId]);
        $convRow = $conv->fetch();
        if (!$convRow) jsonResponse(true, ['messages' => []]);

        $msgs = $pdo->prepare("SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC");
        $msgs->execute([$convRow['id']]);
        jsonResponse(true, ['messages' => $msgs->fetchAll()]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input    = getInput();
        $convId   = sanitizeInput($input['conversation_id'] ?? '');
        $role     = $input['role'] ?? 'user';
        $content  = sanitizeInput($input['content'] ?? '');

        if (empty($convId) || empty($content)) jsonResponse(false, null, 'conversation_id and content required.', 400);
        if (!in_array($role, ['user','assistant'])) jsonResponse(false, null, 'Invalid role.', 400);

        $pdo->prepare("INSERT INTO chat_messages (conversation_id, role, content) VALUES (?,?,?)")->execute([$convId, $role, $content]);
        $pdo->prepare("UPDATE chat_conversations SET updated_at = NOW() WHERE id = ?")->execute([$convId]);

        jsonResponse(true, ['message' => 'Message saved.'], null, 201);
    }
}

jsonResponse(false, null, 'Invalid chat endpoint.', 404);
