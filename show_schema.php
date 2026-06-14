<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/config.php';
try {
    $stmt = $pdo->query("SHOW CREATE TABLE crm_leads");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo $row['Create Table'];
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
