<?php
// ============================================================
// POST — /api/crm/quotations/revise.php
// Revise a quotation
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';
require_once __DIR__ . '/../../helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$data = getInput();
$id = $data['id'] ?? null;

if (!$id) jsonResponse(false, null, 'Quotation ID is required.', 400);

$stmt = $pdo->prepare("SELECT * FROM crm_quotations WHERE id = :id");
$stmt->execute(['id' => $id]);
$oldQuot = $stmt->fetch();

if (!$oldQuot) jsonResponse(false, null, 'Quotation not found.', 404);

$baseNumber = preg_replace('/-V\d+$/', '', $oldQuot['quotation_number']);
$stmtV = $pdo->prepare("SELECT MAX(version) FROM crm_quotations WHERE quotation_number LIKE :base");
$stmtV->execute(['base' => $baseNumber . '%']);
$maxVersion = (int)$stmtV->fetchColumn();
$newVersion = $maxVersion + 1;
$newQtNumber = $baseNumber . '-V' . $newVersion;

$pdo->beginTransaction();
try {
    $cols = array_keys($oldQuot);
    $excludeCols = ['id', 'quotation_number', 'version', 'status', 'parent_quotation_id', 'sent_at', 'accepted_at', 'rejected_at', 'rejection_reason', 'created_at', 'updated_at'];
    
    $insertCols = [];
    $insertVals = [];
    $params = [
        'qt' => $newQtNumber,
        'ver' => $newVersion,
        'parent' => $id
    ];
    
    foreach ($cols as $col) {
        if (!in_array($col, $excludeCols)) {
            $insertCols[] = $col;
            $insertVals[] = ':' . $col;
            $params[$col] = $oldQuot[$col];
        }
    }
    
    $insertColsStr = implode(', ', $insertCols) . ', quotation_number, version, status, parent_quotation_id';
    $insertValsStr = implode(', ', $insertVals) . ", :qt, :ver, 'draft', :parent";
    
    $stmtNew = $pdo->prepare("INSERT INTO crm_quotations ($insertColsStr) VALUES ($insertValsStr)");
    $stmtNew->execute($params);
    $newId = $pdo->lastInsertId();
    
    $stmtLi = $pdo->prepare("SELECT * FROM crm_quotation_line_items WHERE quotation_id = :old");
    $stmtLi->execute(['old' => $id]);
    $items = $stmtLi->fetchAll();
    
    if ($items) {
        $stmtInsertLi = $pdo->prepare("
            INSERT INTO crm_quotation_line_items (quotation_id, sort_order, service_name, description, quantity, unit, unit_price, gst_rate, line_total)
            VALUES (:qid, :sort, :name, :desc, :qty, :unit, :price, :gst, :total)
        ");
        foreach ($items as $it) {
            $stmtInsertLi->execute([
                'qid' => $newId,
                'sort' => $it['sort_order'],
                'name' => $it['service_name'],
                'desc' => $it['description'],
                'qty' => $it['quantity'],
                'unit' => $it['unit'],
                'price' => $it['unit_price'],
                'gst' => $it['gst_rate'],
                'total' => $it['line_total']
            ]);
        }
    }
    
    $pdo->prepare("UPDATE crm_quotations SET status = 'revised' WHERE id = :id")->execute(['id' => $id]);
    
    logActivity($pdo, 'revised_quotation', 'quotation', $newId, $newQtNumber, ['from_version' => $oldQuot['version']]);
    
    $pdo->commit();
    jsonResponse(true, ['id' => $newId, 'quotation_number' => $newQtNumber, 'message' => 'Quotation revised successfully']);
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
