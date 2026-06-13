<?php
// ============================================================
// Quote Submissions — Admin delete
// POST /api/quote-submissions/delete.php  { id }
// ============================================================
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../admin-guard.php';

requireRole('admin', 'super_admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed', 405);
}

$input = getInput();
$id    = sanitizeInput($input['id'] ?? '');

if (empty($id)) {
    jsonResponse(false, null, 'Quote ID is required.', 400);
}

// Fetch reference for logging
$row = $pdo->prepare("SELECT reference_number, name FROM quote_submissions WHERE id = ?");
$row->execute([$id]);
$quote = $row->fetch();

if (!$quote) {
    jsonResponse(false, null, 'Quote not found.', 404);
}

$pdo->prepare("DELETE FROM quote_submissions WHERE id = ?")->execute([$id]);

try {
    logActivity($pdo, 'delete', 'quote_submission', $id, $quote['reference_number'], [
        'customer_name' => $quote['name']
    ]);
} catch (Exception $e) { /* Non-fatal */ }

jsonResponse(true, ['message' => 'Quote deleted successfully.']);
?>
