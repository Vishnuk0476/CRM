<?php
// ============================================================
// GET / POST / PUT / DELETE — /api/crm/settings/templates.php
// Manages quotation templates (T&C, Include/Exclude, Payment)
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];
$admin_id = $_SESSION['admin_id'] ?? null;

if ($method === 'GET') {
    $type = $_GET['type'] ?? null;
    $activeOnly = isset($_GET['active']) ? (bool)$_GET['active'] : false;
    
    $query = "SELECT * FROM crm_quotation_templates WHERE 1=1";
    $params = [];
    
    if ($type) {
        $query .= " AND type = :type";
        $params['type'] = $type;
    }
    
    if ($activeOnly) {
        $query .= " AND is_active = 1";
    }
    
    $query .= " ORDER BY id ASC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $templates = $stmt->fetchAll();
    
    jsonResponse(true, $templates);
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['type'], $data['name'], $data['content'])) {
        jsonResponse(false, null, 'Type, name, and content are required.', 400);
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO crm_quotation_templates (type, name, content, is_active, created_by)
        VALUES (:type, :name, :content, :is_active, :created_by)
    ");
    
    $stmt->execute([
        'type' => $data['type'],
        'name' => trim($data['name']),
        'content' => is_array($data['content']) ? json_encode($data['content']) : $data['content'],
        'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
        'created_by' => $admin_id
    ]);
    
    $id = $pdo->lastInsertId();
    jsonResponse(true, ['id' => $id, 'message' => 'Template created successfully']);
} 
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'])) {
        jsonResponse(false, null, 'Template ID is required.', 400);
    }
    
    $updates = [];
    $params = ['id' => $data['id']];
    
    if (isset($data['name'])) {
        $updates[] = "name = :name";
        $params['name'] = trim($data['name']);
    }
    if (isset($data['content'])) {
        $updates[] = "content = :content";
        $params['content'] = is_array($data['content']) ? json_encode($data['content']) : $data['content'];
    }
    if (isset($data['is_active'])) {
        $updates[] = "is_active = :is_active";
        $params['is_active'] = (int)$data['is_active'];
    }
    
    if (empty($updates)) {
        jsonResponse(false, null, 'No fields to update.', 400);
    }
    
    $query = "UPDATE crm_quotation_templates SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    jsonResponse(true, ['message' => 'Template updated successfully']);
} 
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
    }
    
    if (!$id) {
        jsonResponse(false, null, 'Template ID is required.', 400);
    }
    
    $stmt = $pdo->prepare("DELETE FROM crm_quotation_templates WHERE id = :id");
    $stmt->execute(['id' => $id]);
    
    jsonResponse(true, ['message' => 'Template deleted successfully']);
} else {
    jsonResponse(false, null, 'Method not allowed.', 405);
}
