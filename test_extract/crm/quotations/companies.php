<?php
header("Content-Type: application/json");
require_once "../../config.php";

if (session_status() === PHP_SESSION_NONE) { session_start(); }
if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit;
}

try {
    // Fetch unique non-empty company names from quotations
    $stmt = $pdo->prepare("SELECT DISTINCT client_company FROM quotations WHERE client_company IS NOT NULL AND client_company != '' ORDER BY client_company ASC");
    $stmt->execute();
    $companies = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        "success" => true,
        "data" => $companies
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
