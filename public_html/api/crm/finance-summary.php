<?php
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Total Revenue (Paid Invoices or Payments)
    $stmt = $pdo->query("SELECT SUM(amount) FROM crm_payments WHERE status = 'confirmed'");
    $totalRevenue = (float)$stmt->fetchColumn() ?: 0;
    
    // Total Expenses
    $stmt = $pdo->query("SELECT SUM(amount) FROM crm_expenses");
    $totalExpenses = (float)$stmt->fetchColumn() ?: 0;
    
    // Net Profit
    $netProfit = $totalRevenue - $totalExpenses;
    
    // Pending Receivables (Balance Due from Invoices)
    $stmt = $pdo->query("SELECT SUM(grand_total - amount_paid) FROM crm_invoices WHERE status != 'cancelled'");
    $pendingReceivables = (float)$stmt->fetchColumn() ?: 0;
    
    // Recent Transactions
    $recentTransactions = [];
    
    // Get recent payments
    $stmt = $pdo->query("
        SELECT p.id, p.amount, i.invoice_number as description, p.payment_date as date
        FROM crm_payments p
        LEFT JOIN crm_invoices i ON i.id = p.invoice_id
        WHERE p.status = 'confirmed'
        ORDER BY p.payment_date DESC LIMIT 5
    ");
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($payments as $p) {
        $recentTransactions[] = [
            'id' => 'p' . $p['id'],
            'type' => 'income',
            'amount' => (float)$p['amount'],
            'desc' => 'Invoice ' . ($p['description'] ?: 'N/A'),
            'date' => date('d M Y', strtotime($p['date'])),
            'timestamp' => strtotime($p['date'])
        ];
    }
    
    // Get recent expenses
    $stmt = $pdo->query("
        SELECT id, amount, category as description, expense_date as date
        FROM crm_expenses
        ORDER BY expense_date DESC LIMIT 5
    ");
    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($expenses as $e) {
        $recentTransactions[] = [
            'id' => 'e' . $e['id'],
            'type' => 'expense',
            'amount' => (float)$e['amount'],
            'desc' => $e['description'],
            'date' => date('d M Y', strtotime($e['date'])),
            'timestamp' => strtotime($e['date'])
        ];
    }
    
    // Sort transactions by date descending
    usort($recentTransactions, function($a, $b) {
        return $b['timestamp'] <=> $a['timestamp'];
    });
    
    // Take top 5
    $recentTransactions = array_slice($recentTransactions, 0, 5);
    
    jsonResponse(true, [
        'totalRevenue' => $totalRevenue,
        'totalExpenses' => $totalExpenses,
        'netProfit' => $netProfit,
        'pendingReceivables' => $pendingReceivables,
        'recentTransactions' => $recentTransactions
    ]);
}

jsonResponse(false, null, 'Method not allowed', 405);
