<?php
// AUTOFIX TRIGGERS FOR ALL UUID TABLES
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/config.php';

try {
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $fixed = [];

    foreach ($tables as $table) {
        // Check if table has an 'id' column of type char(36)
        $colStmt = $pdo->query("SHOW COLUMNS FROM `$table` WHERE Field = 'id'");
        $col = $colStmt->fetch(PDO::FETCH_ASSOC);

        if ($col && stripos($col['Type'], 'char(36)') !== false) {
            // 1. Modify column to have DEFAULT ''
            $pdo->exec("ALTER TABLE `$table` MODIFY `id` CHAR(36) NOT NULL DEFAULT ''");

            // 2. Drop existing trigger if any
            $pdo->exec("DROP TRIGGER IF EXISTS `before_insert_{$table}`");

            // 3. Create BEFORE INSERT trigger
            $triggerSql = "
            CREATE TRIGGER `before_insert_{$table}`
            BEFORE INSERT ON `$table`
            FOR EACH ROW
            BEGIN
                IF NEW.id IS NULL OR NEW.id = '' THEN
                    SET NEW.id = UUID();
                END IF;
            END;
            ";
            $pdo->exec($triggerSql);

            $fixed[] = $table;
        }
    }

    echo "SUCCESS: Added UUID triggers to tables: " . implode(', ', $fixed);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
