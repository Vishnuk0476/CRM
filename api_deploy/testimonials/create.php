<?php
// ============================================================
// Testimonials — Public submission with media support
// POST /api/testimonials/submit.php
// Body: { name, role?, location?, rating, content, avatar_url?, media_urls? }
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input     = getInput();
$name      = sanitizeInput($input['name'] ?? '');
$role      = sanitizeInput($input['role'] ?? '') ?: null;
$loc       = sanitizeInput($input['location'] ?? '') ?: null;
$rating    = intval($input['rating'] ?? 5);
$content   = sanitizeInput($input['content'] ?? '');
$avatarUrl = sanitizeInput($input['avatar_url'] ?? '') ?: null;
$mediaUrls = $input['media_urls'] ?? null;

if (empty($name))    jsonResponse(false, null, 'Name is required.', 400);
if (empty($content)) jsonResponse(false, null, 'Review content is required.', 400);
if ($rating < 1 || $rating > 5) $rating = 5;
if (strlen($content) < 20) jsonResponse(false, null, 'Review must be at least 20 characters.', 400);

// Validate media_urls JSON
$mediaJson = null;
if ($mediaUrls !== null) {
    if (is_string($mediaUrls)) {
        $decoded = json_decode($mediaUrls, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $mediaJson = json_encode($decoded);
        }
    } elseif (is_array($mediaUrls)) {
        $mediaJson = json_encode($mediaUrls);
    }
}

// Check if any media is a video
$isVideo = false;
if ($mediaJson) {
    $decoded = json_decode($mediaJson, true);
    if (is_array($decoded)) {
        foreach ($decoded as $m) {
            if (isset($m['type']) && $m['type'] === 'video') {
                $isVideo = true;
                break;
            }
        }
    }
}

$stmt = $pdo->prepare("
    INSERT INTO testimonials (name, role, location, rating, content, avatar_url, media_urls, is_video, is_approved)
    VALUES (:name, :role, :location, :rating, :content, :avatar_url, :media_urls, :is_video, 1)
");
$stmt->execute([
    ':name'       => $name,
    ':role'       => $role,
    ':location'   => $loc,
    ':rating'     => $rating,
    ':content'    => $content,
    ':avatar_url' => $avatarUrl,
    ':media_urls' => $mediaJson,
    ':is_video'   => $isVideo ? 1 : 0,
]);

$id = $pdo->lastInsertId();

// Notify admin via email
$safeName    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeContent = htmlspecialchars($content, ENT_QUOTES, 'UTF-8');
$stars       = str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);

$mediaCount = 0;
if ($mediaJson) {
    $decoded = json_decode($mediaJson, true);
    $mediaCount = is_array($decoded) ? count($decoded) : 0;
}

$emailBody = "<p>A new testimonial has been submitted and is pending approval.</p>
<div style='background:#f8fafc;border-radius:12px;padding:20px;margin:16px 0;'>
    <table style='width:100%;border-collapse:collapse;'>
        <tr><td style='padding:8px 0;color:#64748b;font-size:14px;'>Name</td><td style='padding:8px 0;color:#0f172a;font-weight:600;text-align:right;'>{$safeName}</td></tr>
        <tr><td style='padding:8px 0;color:#64748b;font-size:14px;'>Rating</td><td style='padding:8px 0;color:#f59e0b;font-size:16px;text-align:right;'>{$stars}</td></tr>
        <tr><td style='padding:8px 0;color:#64748b;font-size:14px;'>Media Files</td><td style='padding:8px 0;color:#0f172a;font-weight:600;text-align:right;'>{$mediaCount} file(s)</td></tr>
    </table>
    <div style='margin-top:16px;padding:12px;background:#fff;border-radius:8px;border:1px solid #e2e8f0;'>
        <p style='color:#334155;font-size:14px;line-height:1.6;margin:0;font-style:italic;'>\"{$safeContent}\"</p>
    </div>
</div>
<p style='text-align:center;color:#475569;font-size:14px;'>Log in to the admin panel to approve or reject this testimonial.</p>";

sendAdminNotification("New Testimonial — Pending Approval | {$safeName}", $emailBody);

jsonResponse(true, ['id' => $id, 'message' => 'Testimonial submitted successfully. It will appear after approval.'], null, 201);
