<?php
$host = 'localhost';
$db   = 'panyaglobal_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$pdo = new PDO($dsn, $user, $pass);

$stmt = $pdo->query("SELECT id, milestone, lead_id FROM crm_cases WHERE milestone IN ('packing_scheduled', 'in_transit', 'delivered')");
$cases = $stmt->fetchAll();

foreach ($cases as $c) {
    $id = $c['id'];
    $val = $c['milestone'];
    $lead_id = $c['lead_id'];
    $chkStmt = $pdo->prepare("SELECT id FROM crm_orders WHERE case_id = ?");
    $chkStmt->execute([$id]);
    if (!$chkStmt->fetch()) {
        $today = date('Ymd');
        $cntStmt = $pdo->prepare("SELECT COUNT(*) FROM crm_orders WHERE DATE(created_at) = CURDATE()");
        $cntStmt->execute();
        $dayCount = (int)$cntStmt->fetchColumn() + 1;
        $orderNumber = "ORD-{$today}-" . str_pad($dayCount, 3, '0', STR_PAD_LEFT);
        
        $statusMap = ['packing_scheduled' => 'scheduled', 'in_transit' => 'in_transit', 'delivered' => 'delivered'];
        $oStatus = $statusMap[$val] ?? 'scheduled';
        
        $oStmt = $pdo->prepare("INSERT INTO crm_orders (case_id, lead_id, order_number, status, created_at) VALUES (?, ?, ?, ?, NOW())");
        $oStmt->execute([$id, $lead_id, $orderNumber, $oStatus]);
        echo "Created order for case $id\n";
    }
}
echo "Done\n";
