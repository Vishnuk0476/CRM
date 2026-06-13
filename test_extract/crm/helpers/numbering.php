<?php
// ============================================================
// CRM Numbering Helpers — Auto-generate document numbers
// Usage: require_once __DIR__ . '/../helpers/numbering.php';
// ============================================================

/**
 * Get a CRM app setting value from crm_app_settings table.
 * Falls back to $default if not found.
 */
function getCrmSetting(PDO $pdo, string $key, string $default = ''): string {
    try {
        $stmt = $pdo->prepare("SELECT setting_value FROM crm_app_settings WHERE setting_key = :k LIMIT 1");
        $stmt->execute([':k' => $key]);
        $val = $stmt->fetchColumn();
        return ($val !== false && $val !== null) ? $val : $default;
    } catch (Exception $e) {
        return $default;
    }
}

/**
 * Generate next sequential number for a given table + column + prefix.
 * Pattern: PREFIX + YYYY + '-' + 4-digit-seq  e.g. PG-2026-0012
 */
function generateSequentialNumber(PDO $pdo, string $table, string $column, string $prefix): string {
    $year = date('Y');
    try {
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM {$table} WHERE {$column} LIKE :pat"
        );
        $stmt->execute([':pat' => $prefix . $year . '-%']);
        $count = (int)$stmt->fetchColumn();
        return $prefix . $year . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);
    } catch (Exception $e) {
        // Fallback to timestamp-based
        return $prefix . date('Ymd-His');
    }
}

function generateCaseNumber(PDO $pdo): string {
    $prefix = getCrmSetting($pdo, 'case_prefix', 'PG-');
    return generateSequentialNumber($pdo, 'crm_cases', 'case_number', $prefix);
}

function generateSurveyNumber(PDO $pdo): string {
    $prefix = getCrmSetting($pdo, 'survey_prefix', 'SRV-');
    return generateSequentialNumber($pdo, 'crm_surveys', 'survey_number', $prefix);
}

function generateQuotationNumber(PDO $pdo): string {
    $prefix = getCrmSetting($pdo, 'quotation_prefix', 'QT-');
    return generateSequentialNumber($pdo, 'crm_quotations', 'quotation_number', $prefix);
}

function generateInvoiceNumber(PDO $pdo): string {
    $prefix = getCrmSetting($pdo, 'invoice_prefix', 'INV-');
    // Use crm_invoices but only new-style rows
    $year = date('Y');
    try {
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM crm_invoices WHERE invoice_number LIKE :pat"
        );
        $stmt->execute([':pat' => $prefix . $year . '-%']);
        $count = (int)$stmt->fetchColumn();
        return $prefix . $year . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);
    } catch (Exception $e) {
        return $prefix . date('Ymd-His');
    }
}

function generatePaymentNumber(PDO $pdo): string {
    $prefix = getCrmSetting($pdo, 'payment_prefix', 'PAY-');
    $year = date('Y');
    try {
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM crm_payments WHERE payment_number LIKE :pat"
        );
        $stmt->execute([':pat' => $prefix . $year . '-%']);
        $count = (int)$stmt->fetchColumn();
        return $prefix . $year . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);
    } catch (Exception $e) {
        return $prefix . date('Ymd-His');
    }
}

function generateExpenseNumber(PDO $pdo): string {
    $prefix = getCrmSetting($pdo, 'expense_prefix', 'EXP-');
    $year = date('Y');
    try {
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM crm_expenses WHERE expense_number LIKE :pat"
        );
        $stmt->execute([':pat' => $prefix . $year . '-%']);
        $count = (int)$stmt->fetchColumn();
        return $prefix . $year . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);
    } catch (Exception $e) {
        return $prefix . date('Ymd-His');
    }
}

/**
 * Calculate GST amounts based on same-state vs inter-state logic.
 * Returns array with cgst, sgst, igst amounts and grand_total.
 */
function calculateGstAmounts(float $subtotal, float $discountAmount, string $originState, string $destState): array {
    $taxable = max(0, $subtotal - $discountAmount);
    $sameState = (strtolower(trim($originState)) !== '' && 
                  strtolower(trim($originState)) === strtolower(trim($destState)));
    
    if ($sameState) {
        $cgst = round($taxable * 0.09, 2);
        $sgst = round($taxable * 0.09, 2);
        $igst = 0.0;
    } else {
        $cgst = 0.0;
        $sgst = 0.0;
        $igst = round($taxable * 0.18, 2);
    }

    $totalTax  = $cgst + $sgst + $igst;
    $grandTotal = round($taxable + $totalTax, 2);

    return [
        'same_state'    => $sameState,
        'taxable_amount'=> $taxable,
        'cgst_rate'     => $sameState ? 9.00 : 0.00,
        'sgst_rate'     => $sameState ? 9.00 : 0.00,
        'igst_rate'     => $sameState ? 0.00 : 18.00,
        'cgst_amount'   => $cgst,
        'sgst_amount'   => $sgst,
        'igst_amount'   => $igst,
        'total_tax'     => round($totalTax, 2),
        'grand_total'   => $grandTotal,
    ];
}
