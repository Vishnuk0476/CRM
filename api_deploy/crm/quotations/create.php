<?php
// ============================================================
// POST — /api/crm/quotations/create.php
// Create a new quotation
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';
require_once __DIR__ . '/../../lib/quotation_helpers.php';
require_once __DIR__ . '/../../lib/quotation_calculator.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$data = getInput();

$clientName = trim($data['client_name'] ?? '');
if (!$clientName) {
    jsonResponse(false, null, 'Client name is required.', 400);
}

$lineItems = $data['line_items'] ?? [];
$discountType = $data['discount_type'] ?? 'amount';
$discountValue = (float)($data['discount_value'] ?? 0);
$gstType = $data['gst_type'] ?? '18';
$isInterState = isset($data['is_inter_state']) ? (bool)$data['is_inter_state'] : false;
$insurances = $data['insurances'] ?? [];

$financials = calculateQuotationFinancials($lineItems, $discountType, $discountValue, $gstType, $isInterState, $insurances);

$pdo->beginTransaction();
try {
    $qtNumber = generateQuotationNumber($pdo);
    
    $stmt = $pdo->prepare("
        INSERT INTO crm_quotations (
            quotation_number, case_id, lead_id, survey_id, client_name, client_phone, client_email,
            client_address, client_company, client_gst, origin_city, destination_city, bhk_type,
            move_date, quotation_date, valid_until, subtotal, discount_type, discount_value, discount_amount,
            cgst_rate, sgst_rate, igst_rate, cgst_amount, sgst_amount, igst_amount, total_tax, grand_total,
            payment_terms, notes, terms_and_conditions, inclusions, exclusions, status, version, created_by,
            is_move_date_confirmed, lift_origin, lift_destination, lift_type, car_declared_value,
            car_insurance_percentage, gst_type, relocation_type, move_details, insurances,
            origin_pincode, destination_pincode, origin_address, destination_address, scope_intro_text,
            internal_notes, assigned_sales_id
        ) VALUES (
            :qt, :case_id, :lead_id, :survey_id, :c_name, :c_phone, :c_email,
            :c_address, :c_company, :c_gst, :origin, :dest, :bhk,
            :move_date, :qt_date, :valid_until, :subtotal, :disc_type, :disc_val, :disc_amt,
            :cgst_r, :sgst_r, :igst_r, :cgst_a, :sgst_a, :igst_a, :total_tax, :grand_total,
            :payment, :notes, :tc, :inc, :exc, 'draft', 1, :created_by,
            :is_move, :lift_o, :lift_d, :lift_t, :car_val, :car_ins, :gst_t,
            :reloc_type, :move_det, :ins_arr,
            :o_pincode, :d_pincode, :o_address, :d_address, :scope_intro,
            :internal_notes, :assigned_sales_id
        )
    ");
    
    $stmt->execute([
        'qt' => $qtNumber,
        'case_id' => (isset($data['case_id']) && is_numeric($data['case_id']) && $data['case_id'] > 0) ? (int)$data['case_id'] : null,
        'lead_id' => (isset($data['lead_id']) && is_numeric($data['lead_id']) && $data['lead_id'] > 0) ? (int)$data['lead_id'] : null,
        'survey_id' => (isset($data['survey_id']) && is_numeric($data['survey_id']) && $data['survey_id'] > 0) ? (int)$data['survey_id'] : null,
        'c_name' => $clientName,
        'c_phone' => $data['client_phone'] ?? null,
        'c_email' => $data['client_email'] ?? null,
        'c_address' => $data['client_address'] ?? null,
        'c_company' => $data['client_company'] ?? null,
        'c_gst' => $data['client_gst'] ?? null,
        'origin' => $data['origin_city'] ?? null,
        'dest' => $data['destination_city'] ?? null,
        'bhk' => $data['bhk_type'] ?? null,
        'move_date' => !empty($data['move_date']) ? $data['move_date'] : null,
        'qt_date' => !empty($data['quotation_date']) ? $data['quotation_date'] : date('Y-m-d'),
        'valid_until' => !empty($data['valid_until']) ? $data['valid_until'] : null,
        
        'subtotal' => $financials['subtotal'],
        'disc_type' => $discountType,
        'disc_val' => $discountValue,
        'disc_amt' => $financials['discount_amount'],
        'cgst_r' => $financials['cgst_rate'],
        'sgst_r' => $financials['sgst_rate'],
        'igst_r' => $financials['igst_rate'],
        'cgst_a' => $financials['cgst_amount'],
        'sgst_a' => $financials['sgst_amount'],
        'igst_a' => $financials['igst_amount'],
        'total_tax' => $financials['total_tax'],
        'grand_total' => $financials['grand_total'],
        
        'payment' => $data['payment_terms'] ?? null,
        'notes' => $data['notes'] ?? null,
        'tc' => $data['terms_and_conditions'] ?? null,
        'inc' => isset($data['inclusions']) ? (is_array($data['inclusions']) ? json_encode($data['inclusions']) : $data['inclusions']) : null,
        'exc' => isset($data['exclusions']) ? (is_array($data['exclusions']) ? json_encode($data['exclusions']) : $data['exclusions']) : null,
        'created_by' => $_SESSION['admin_id'] ?? null,
        
        'is_move' => !empty($data['is_move_date_confirmed']) ? 1 : 0,
        'lift_o' => !empty($data['lift_origin']) ? 1 : 0,
        'lift_d' => !empty($data['lift_destination']) ? 1 : 0,
        'lift_t' => $data['lift_type'] ?? null,
        'car_val' => (float)($data['car_declared_value'] ?? 0),
        'car_ins' => (float)($data['car_insurance_percentage'] ?? 0),
        'gst_t' => $gstType,
        'reloc_type' => $data['relocation_type'] ?? 'Household Relocation',
        'move_det' => isset($data['move_details']) ? json_encode($data['move_details']) : null,
        'ins_arr' => !empty($insurances) ? json_encode($insurances) : null,
        'o_pincode' => $data['origin_pincode'] ?? null,
        'd_pincode' => $data['destination_pincode'] ?? null,
        'o_address' => $data['origin_address'] ?? null,
        'd_address' => $data['destination_address'] ?? null,
        'scope_intro' => $data['scope_intro_text'] ?? null,
        'internal_notes' => $data['internal_notes'] ?? null,
        'assigned_sales_id' => (isset($data['assigned_sales_id']) && is_numeric($data['assigned_sales_id']) && $data['assigned_sales_id'] > 0) ? (int)$data['assigned_sales_id'] : null
    ]);
    
    $quotationId = $pdo->lastInsertId();
    
    // Insert line items
    if (!empty($lineItems)) {
        $stmtLi = $pdo->prepare("
            INSERT INTO crm_quotation_line_items (
                quotation_id, sort_order, service_name, description, quantity, unit, unit_price, gst_rate, line_total
            ) VALUES (
                :qid, :sort, :name, :desc, :qty, :unit, :price, :gst, :total
            )
        ");
        
        foreach ($lineItems as $idx => $item) {
            $qty = (float)($item['quantity'] ?? 1);
            $price = (float)($item['unit_price'] ?? 0);
            $stmtLi->execute([
                'qid' => $quotationId,
                'sort' => $idx,
                'name' => $item['service_name'] ?? 'Service',
                'desc' => $item['description'] ?? null,
                'qty' => $qty,
                'unit' => $item['unit'] ?? 'job',
                'price' => $price,
                'gst' => isset($item['gst_rate']) ? (float)$item['gst_rate'] : (is_numeric($gstType) ? (float)$gstType : 18.0),
                'total' => $qty * $price
            ]);
        }
    }
    logActivity($pdo, 'created_quotation', 'quotation', $quotationId, $qtNumber, ['client' => $clientName, 'total' => $financials['grand_total']]);
    
    // Update case milestone
    if (!empty($data['case_id'])) {
        $pdo->prepare("UPDATE crm_cases SET milestone = 'quotation_sent' WHERE id = ?")->execute([(int)$data['case_id']]);
    }
    
    // Send email to client
    if (!empty($data['client_email'])) {
        $body = "<p>Dear <strong>" . htmlspecialchars($clientName) . "</strong>,</p>";
        $body .= "<p>Thank you for choosing Panya Global Relocation. Your quotation <strong>{$qtNumber}</strong> has been generated successfully.</p>";
        $body .= "<table style='width:100%;border-collapse:collapse;margin-top:15px;margin-bottom:15px;'>";
        $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;width:35%;'>Route</td><td style='padding:10px;border:1px solid #e2e8f0;'>" . htmlspecialchars($data['origin_city'] ?? 'N/A') . " &rarr; " . htmlspecialchars($data['destination_city'] ?? 'N/A') . "</td></tr>";
        $body .= "<tr><td style='padding:10px;border:1px solid #e2e8f0;font-weight:600;background-color:#f8fafc;'>Grand Total</td><td style='padding:10px;border:1px solid #e2e8f0;'>₹" . number_format($financials['grand_total'], 2) . "</td></tr>";
        $body .= "</table>";
        $body .= "<p>Our consultant will be in touch with you shortly to discuss the details.</p>";
        
        sendEmail(
            $data['client_email'],
            "Your Quotation {$qtNumber} - Panya Global",
            crmEmailTemplate("Quotation Generated", $body),
            "Panya Global Quotes",
            "rates@panyaglobal.in"
        );
    }

    $pdo->commit();
    jsonResponse(true, ['id' => $quotationId, 'quotation_number' => $qtNumber, 'message' => 'Quotation created successfully']);
    
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
