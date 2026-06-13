<?php
require_once __DIR__ . '/admin-guard.php';

$stmt = $pdo->query("DESCRIBE crm_invoices");
$invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stmt = $pdo->query("DESCRIBE crm_quotations");
$quotations = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Invoices:\n";
foreach ($invoices as $row) {
    echo $row['Field'] . "\n";
}

echo "\nQuotations:\n";
foreach ($quotations as $row) {
    echo $row['Field'] . "\n";
}
