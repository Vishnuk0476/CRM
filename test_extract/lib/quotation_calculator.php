<?php
// ============================================================
// Financial Calculation Engine for Quotations
// ============================================================

function calculateQuotationFinancials(array $lineItems, string $discountType, float $discountValue, string $gstType, bool $isInterState = false, array $insurances = []) {
    $subtotal = 0.0;
    
    // Calculate subtotal from line items
    foreach ($lineItems as $item) {
        $qty = (float)($item['quantity'] ?? 1);
        $price = (float)($item['unit_price'] ?? 0);
        $subtotal += ($qty * $price);
    }
    
    // Calculate discount
    $discountAmount = 0.0;
    if ($discountType === 'percent') {
        $discountAmount = $subtotal * ($discountValue / 100);
    } else {
        $discountAmount = $discountValue;
    }
    
    // Ensure discount doesn't exceed subtotal
    $discountAmount = min($discountAmount, $subtotal);
    
    // Insurance Premiums Calculation
    $totalInsurancePremium = 0.0;
    foreach ($insurances as $ins) {
        $idv = (float)($ins['declared_value'] ?? 0);
        $pct = (float)($ins['percentage'] ?? 0);
        $totalInsurancePremium += ($idv * ($pct / 100));
    }

    // Taxable Amount now includes the sum of insurance premiums
    $taxableAmount = $subtotal - $discountAmount + $totalInsurancePremium;
    
    // Determine global GST rate
    $baseGstRate = is_numeric($gstType) ? (float)$gstType : 18.0;
    
    $cgstAmount = 0.0;
    $sgstAmount = 0.0;
    $igstAmount = 0.0;
    $cgstRate = 0.0;
    $sgstRate = 0.0;
    $igstRate = 0.0;
    
    // GST on Line Items
    if ($subtotal > 0) {
        foreach ($lineItems as $item) {
            $qty = (float)($item['quantity'] ?? 1);
            $price = (float)($item['unit_price'] ?? 0);
            $lineTotal = $qty * $price;
            
            // Proportional discount for this line
            $lineDiscount = ($lineTotal / $subtotal) * $discountAmount;
            $lineTaxable = $lineTotal - $lineDiscount;
            
            $itemGstRate = isset($item['gst_rate']) ? (float)$item['gst_rate'] : $baseGstRate;
            $lineTax = $lineTaxable * ($itemGstRate / 100);
            
            if ($isInterState) {
                $igstAmount += $lineTax;
                $igstRate = max($igstRate, $itemGstRate);
            } else {
                $cgstAmount += ($lineTax / 2);
                $sgstAmount += ($lineTax / 2);
                $cgstRate = max($cgstRate, $itemGstRate / 2);
                $sgstRate = max($sgstRate, $itemGstRate / 2);
            }
        }
    }

    // GST on Insurance Premiums (usually always 18%)
    if ($totalInsurancePremium > 0) {
        $insuranceTax = $totalInsurancePremium * ($baseGstRate / 100);
        if ($isInterState) {
            $igstAmount += $insuranceTax;
            $igstRate = max($igstRate, $baseGstRate);
        } else {
            $cgstAmount += ($insuranceTax / 2);
            $sgstAmount += ($insuranceTax / 2);
            $cgstRate = max($cgstRate, $baseGstRate / 2);
            $sgstRate = max($sgstRate, $baseGstRate / 2);
        }
    }
    
    $totalTax = $cgstAmount + $sgstAmount + $igstAmount;
    $grandTotal = $taxableAmount + $totalTax;
    
    return [
        'subtotal' => round($subtotal, 2),
        'discount_amount' => round($discountAmount, 2),
        'taxable_amount' => round($taxableAmount, 2),
        'cgst_rate' => $cgstRate,
        'sgst_rate' => $sgstRate,
        'igst_rate' => $igstRate,
        'cgst_amount' => round($cgstAmount, 2),
        'sgst_amount' => round($sgstAmount, 2),
        'igst_amount' => round($igstAmount, 2),
        'total_tax' => round($totalTax, 2),
        'grand_total' => round($grandTotal, 2)
    ];
}
