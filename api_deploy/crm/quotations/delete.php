<?php
// ============================================================
// POST — /api/crm/quotations/delete.php
// Delete a quotation
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;

if (!$id) {
    jsonResponse(false, null, 'Quotation ID required', 400);
}

try {
    $pdo->beginTransaction();
    
    // First delete associated line items
    $stmt1 = $pdo->prepare("DELETE FROM crm_quotation_line_items WHERE quotation_id = ?");
    $stmt1->execute([$id]);

    // Handle self-referencing foreign key for revisions
    $stmtRef = $pdo->prepare("UPDATE crm_quotations SET parent_quotation_id = NULL WHERE parent_quotation_id = ?");
    $stmtRef->execute([$id]);

    // Then delete the quotation itself
    $stmt2 = $pdo->prepare("DELETE FROM crm_quotations WHERE id = ?");
    $stmt2->execute([$id]);
    
    $pdo->commit();
    jsonResponse(true, null, 'Deleted successfully');
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
