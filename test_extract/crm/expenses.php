<?php
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];
$adminId = $_SESSION['admin_id'];

if ($method === 'GET') {
    $month = $_GET['month'] ?? date('Y-m');
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

    $query = "
        SELECT e.*, 
               c.case_number as order_number,
               a.name as added_by_name
        FROM crm_expenses e
        LEFT JOIN crm_cases c ON c.id = e.case_id
        LEFT JOIN admins a ON a.id = e.added_by
        WHERE DATE_FORMAT(e.expense_date, '%Y-%m') = :month
        ORDER BY e.expense_date DESC, e.created_at DESC 
        LIMIT :limit
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->bindValue(':month', $month);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $expenses_db = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Category Breakdown
    $catStmt = $pdo->prepare("
        SELECT category, SUM(amount) as total 
        FROM crm_expenses 
        WHERE DATE_FORMAT(expense_date, '%Y-%m') = ? 
        GROUP BY category 
        ORDER BY total DESC
    ");
    $catStmt->execute([$month]);
    $byCategory = $catStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Total expenses
    $totalExpenses = 0;
    foreach ($byCategory as $cat) {
        $totalExpenses += (float)$cat['total'];
    }
    
    $expenses = [];
    foreach ($expenses_db as $e) {
        $expenses[] = [
            'id'                     => $e['id'],
            'expense_number'         => $e['expense_number'],
            'amount'                 => (float) $e['amount'],
            'category'               => $e['category'],
            'description'            => $e['description'],
            'payment_mode'           => $e['payment_mode'],
            'order_number'           => $e['order_number'],
            'case_id'                => $e['case_id'],
            'added_by_name'          => $e['added_by_name'],
            'expense_date'           => $e['expense_date'],
            'expense_date_formatted' => date('d M Y', strtotime($e['expense_date']))
        ];
    }
    
    jsonResponse(true, [
        'expenses' => $expenses, 
        'by_category' => $byCategory, 
        'total_expenses' => $totalExpenses
    ]);
}

if ($method === 'POST') {
    $data = getInput();
    
    $case_id = !empty($data['order_id']) ? (int)$data['order_id'] : null;
    $amount = (float)($data['amount'] ?? 0);
    $category = $data['category'] ?? 'Misc';
    $description = $data['description'] ?? '';
    $expense_date = $data['expense_date'] ?? date('Y-m-d');
    $receipt_url = $data['receipt_url'] ?? null;
    
    $payment_mode = $data['payment_mode'] ?? null;
    
    if (!$amount || !$category) {
        jsonResponse(false, null, 'Category and amount are required', 400);
    }
    
    // Generate Expense Number (use MAX to avoid collisions)
    $countStmt = $pdo->query("SELECT COALESCE(MAX(id), 0) + 1 FROM crm_expenses");
    $count = (int)$countStmt->fetchColumn();
    $expense_number = 'EXP-' . date('Y') . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO crm_expenses (
                expense_number, case_id, expense_date, category, description, amount,
                receipt_url, added_by, payment_mode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $expense_number, $case_id, $expense_date, $category, $description, $amount,
            $receipt_url, $adminId, $payment_mode
        ]);
        
        jsonResponse(true, ['message' => 'Expense added successfully', 'expense_number' => $expense_number, 'expense_id' => $pdo->lastInsertId()]);
    } catch (Exception $e) {
        jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        jsonResponse(false, null, 'Expense ID required', 400);
    }
    
    // Check permission
    $stmt = $pdo->prepare("SELECT role FROM admins WHERE id = ?");
    $stmt->execute([$adminId]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!in_array($admin['role'], ['owner', 'super_admin', 'accountant'])) {
        jsonResponse(false, null, 'Unauthorized to delete expenses', 403);
    }
    
    try {
        $delStmt = $pdo->prepare("DELETE FROM crm_expenses WHERE id = ?");
        $delStmt->execute([$id]);
        jsonResponse(true, ['message' => 'Expense deleted successfully']);
    } catch (Exception $e) {
        jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
}

jsonResponse(false, null, 'Method not allowed', 405);
