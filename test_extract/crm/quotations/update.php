<?php
// ============================================================
// PUT — /api/crm/quotations/update.php
// Update an existing quotation
// ============================================================
require_once __DIR__ . '/../../admin-guard.php';
require_once __DIR__ . '/../../lib/quotation_calculator.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(false, null, 'Method not allowed.', 405);
}

$data = getInput();
$id = $data['id'] ?? null;

if (!$id) {
    jsonResponse(false, null, 'Quotation ID is required.', 400);
}

$stmt = $pdo->prepare("SELECT status FROM crm_quotations WHERE id = :id");
$stmt->execute(['id' => $id]);
$existing = $stmt->fetch();

if (!$existing) {
    jsonResponse(false, null, 'Quotation not found.', 404);
}

if (in_array($existing['status'], ['sent', 'accepted']) && empty($data['force_update'])) {
    jsonResponse(false, null, "Quotation is already {$existing['status']}. Use force_update to modify it.", 403);
}

$clientName = trim($data['client_name'] ?? '');
$lineItems = $data['line_items'] ?? [];
$discountType = $data['discount_type'] ?? 'amount';
$discountValue = (float)($data['discount_value'] ?? 0);
$gstType = $data['gst_type'] ?? '18';
$isInterState = isset($data['is_inter_state']) ? (bool)$data['is_inter_state'] : false;
$insurances = $data['insurances'] ?? [];

$financials = calculateQuotationFinancials($lineItems, $discountType, $discountValue, $gstType, $isInterState, $insurances);

$pdo->beginTransaction();
try {
    $stmtUpdate = $pdo->prepare("
        UPDATE crm_quotations SET
            case_id = :case_id, lead_id = :lead_id, survey_id = :survey_id, client_name = :c_name,
            client_phone = :c_phone, client_email = :c_email, client_address = :c_address,
            client_company = :c_company, client_gst = :c_gst, origin_city = :origin,
            destination_city = :dest, bhk_type = :bhk, move_date = :move_date,
            quotation_date = :qt_date, valid_until = :valid_until, subtotal = :subtotal,
            discount_type = :disc_type, discount_value = :disc_val, discount_amount = :disc_amt,
            cgst_rate = :cgst_r, sgst_rate = :sgst_r, igst_rate = :igst_r,
            cgst_amount = :cgst_a, sgst_amount = :sgst_a, igst_amount = :igst_a,
            total_tax = :total_tax, grand_total = :grand_total, payment_terms = :payment,
            notes = :notes, terms_and_conditions = :tc, inclusions = :inc, exclusions = :exc,
            is_move_date_confirmed = :is_move, lift_origin = :lift_o, lift_destination = :lift_d,
            lift_type = :lift_t, car_declared_value = :car_val, car_insurance_percentage = :car_ins,
            gst_type = :gst_t, relocation_type = :reloc_type, move_details = :move_det, insurances = :ins_arr,
            internal_notes = :internal_notes, assigned_sales_id = :assigned_sales_id,
            origin_pincode = :o_pincode, destination_pincode = :d_pincode,
            origin_address = :o_address, destination_address = :d_address,
            scope_intro_text = :scope_intro
        WHERE id = :id
    ");

    $stmtUpdate->execute([
        'id' => $id,
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
        'internal_notes' => $data['internal_notes'] ?? null,
        'assigned_sales_id' => (isset($data['assigned_sales_id']) && is_numeric($data['assigned_sales_id']) && $data['assigned_sales_id'] > 0) ? (int)$data['assigned_sales_id'] : null,
        'o_pincode' => $data['origin_pincode'] ?? null,
        'd_pincode' => $data['destination_pincode'] ?? null,
        'o_address' => $data['origin_address'] ?? null,
        'd_address' => $data['destination_address'] ?? null,
        'scope_intro' => $data['scope_intro_text'] ?? null
    ]);
    
    $pdo->prepare("DELETE FROM crm_quotation_line_items WHERE quotation_id = :id")->execute(['id' => $id]);
    
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
                'qid' => $id,
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
    
    logActivity($pdo, 'updated_quotation', 'quotation', $id, null, ['client' => $clientName, 'total' => $financials['grand_total']]);
    
    $pdo->commit();
    jsonResponse(true, ['message' => 'Quotation updated successfully']);
    
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
