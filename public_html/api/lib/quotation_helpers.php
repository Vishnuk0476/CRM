<?php
/**
 * Quotation Helpers
 */

function generateQuotationNumber($pdo) {
    $year = date('Y');
    $prefix = "QT-{$year}-";

    // Find the highest sequence number for the current year
    $stmt = $pdo->prepare("
        SELECT quotation_number 
        FROM crm_quotations 
        WHERE quotation_number LIKE :prefix 
        ORDER BY id DESC 
        LIMIT 1
    ");
    $stmt->execute(['prefix' => $prefix . '%']);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        $parts = explode('-', $row['quotation_number']);
        $lastSeq = (int)end($parts);
        $nextSeq = $lastSeq + 1;
    } else {
        $nextSeq = 1;
    }

    return $prefix . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
}
