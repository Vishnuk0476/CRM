<?php
require_once __DIR__ . '/../admin-guard.php';
requirePermission('cases'); // Use 'cases' permission as documents are tied to cases

$method = $_SERVER['REQUEST_METHOD'];
$adminId = $_SESSION['admin_id'] ?? null;
$adminRole = $_SESSION['admin_role'] ?? '';

// Helper for IDOR prevention
function verifyCaseOwnership($pdo, $caseId) {
    global $adminRole, $adminId;
    if (in_array($adminRole, ['owner', 'super_admin', 'manager'])) return true;
    
    $stmt = $pdo->prepare("SELECT assigned_consultant_id FROM crm_cases WHERE id = ?");
    $stmt->execute([$caseId]);
    $case = $stmt->fetch();
    if (!$case || $case['assigned_consultant_id'] != $adminId) {
        jsonResponse(false, null, 'Access denied. You do not own this case.', 403);
    }
    return true;
}

if ($method === 'GET') {
    $case_id = isset($_GET['case_id']) ? (int)$_GET['case_id'] : null;
    $type = isset($_GET['type']) ? $_GET['type'] : null;

    $query = "SELECT d.* FROM crm_case_documents d";
    
    if (!in_array($adminRole, ['owner', 'super_admin', 'manager'])) {
        // Force JOIN to only show documents for cases owned by this salesperson
        $query .= " JOIN crm_cases c ON c.id = d.case_id WHERE c.assigned_consultant_id = :my_id";
        $params = [':my_id' => $adminId];
    } else {
        $query .= " WHERE 1=1";
        $params = [];
    }

    if ($case_id) {
        $query .= " AND d.case_id = :case_id";
        $params[':case_id'] = $case_id;
    }
    if ($type) {
        $query .= " AND d.document_type = :type";
        $params[':type'] = $type;
    }

    $query .= " ORDER BY d.uploaded_at DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, ['documents' => $documents]);
}

if ($method === 'POST') {
    $case_id = isset($_POST['case_id']) ? (int)$_POST['case_id'] : null;
    $document_type = isset($_POST['document_type']) ? $_POST['document_type'] : 'other';
    $document_name = isset($_POST['document_name']) ? $_POST['document_name'] : 'Document';

    if (!$case_id || !isset($_FILES['file'])) {
        jsonResponse(false, null, 'Case ID and file are required', 400);
    }
    
    verifyCaseOwnership($pdo, $case_id);

    $file = $_FILES['file'];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $allowed_exts = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    
    if (!in_array(strtolower($ext), $allowed_exts)) {
        jsonResponse(false, null, 'Invalid file type', 400);
    }

    $upload_dir = __DIR__ . '/../../uploads/crm_documents/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    $filename = uniqid('doc_') . '_' . time() . '.' . $ext;
    $filepath = $upload_dir . $filename;
    $file_url = '/uploads/crm_documents/' . $filename;

    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        $stmt = $pdo->prepare("INSERT INTO crm_case_documents (case_id, document_type, document_name, file_path, uploaded_by) VALUES (:case_id, :type, :name, :path, :admin_id)");
        $success = $stmt->execute([
            ':case_id' => $case_id,
            ':type' => $document_type,
            ':name' => $document_name,
            ':path' => $file_url,
            ':admin_id' => $adminId
        ]);
        
        if ($success) {
            $doc_id = $pdo->lastInsertId();
            jsonResponse(true, ['message' => 'Document uploaded', 'id' => $doc_id, 'file_url' => $file_url]);
        } else {
            jsonResponse(false, null, 'Database error', 500);
        }
    } else {
        jsonResponse(false, null, 'Failed to upload file', 500);
    }
}

if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = isset($data['id']) ? (int)$data['id'] : null;
    
    if (!$id) {
        jsonResponse(false, null, 'ID is required', 400);
    }

    $stmt = $pdo->prepare("SELECT file_path, case_id FROM crm_case_documents WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        verifyCaseOwnership($pdo, $row['case_id']);
        
        $file_path = __DIR__ . '/../..' . $row['file_path'];
        if (file_exists($file_path)) {
            unlink($file_path);
        }
        $delStmt = $pdo->prepare("DELETE FROM crm_case_documents WHERE id = :id");
        $delStmt->execute([':id' => $id]);
        
        jsonResponse(true, ['message' => 'Document deleted']);
    } else {
        jsonResponse(false, null, 'Document not found', 404);
    }
}

jsonResponse(false, null, 'Method not allowed', 405);
