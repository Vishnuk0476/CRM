<?php
require_once __DIR__ . '/../admin-guard.php';

$method = $_SERVER['REQUEST_METHOD'];
$adminId = $_SESSION['admin_id'];

if ($method === 'GET') {
    $search = $_GET['search'] ?? '';
    $paymentStatus = $_GET['payment_status'] ?? '';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

    $query = "
        SELECT i.*, 
               c.case_number as order_number
        FROM crm_invoices i
        LEFT JOIN crm_cases c ON c.id = i.case_id
        WHERE 1=1
    ";
    
    $params = [];
    if (!empty($search)) {
        $query .= " AND (i.invoice_number LIKE :search OR i.client_name LIKE :search OR c.case_number LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    if (!empty($paymentStatus)) {
        // We'll use status field for payment_status and support comma-separated values
        $statuses = explode(',', $paymentStatus);
        $statusPlaceholders = [];
        foreach ($statuses as $i => $stat) {
            $key = ":status_$i";
            $statusPlaceholders[] = $key;
            $params[$key] = trim($stat);
        }
        $query .= " AND i.status IN (" . implode(',', $statusPlaceholders) . ")";
    }
    
    $query .= " ORDER BY i.created_at DESC LIMIT :limit";
    
    $stmt = $pdo->prepare($query);
    foreach ($params as $key => &$val) {
        $stmt->bindParam($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $invoices_db = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Summary
    $summaryStmt = $pdo->query("
        SELECT 
            SUM(grand_total) as total_invoiced,
            SUM(amount_paid) as total_collected,
            SUM(balance_due) as total_pending,
            SUM(total_tax) as total_gst
        FROM crm_invoices
        WHERE status != 'cancelled'
    ");
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);
    
    // Map to React component's expected format
    $invoices = [];
    foreach ($invoices_db as $inv) {
        $invoices[] = [
            'id' => $inv['id'],
            'invoice_number' => $inv['invoice_number'],
            'customer_name' => $inv['client_name'],
            'order_number' => $inv['order_number'] ?: 'Manual',
            'amount' => (float) $inv['subtotal'],
            'gst_amount' => (float) $inv['total_tax'],
            'gst_rate' => (float) ($inv['cgst_rate'] + $inv['sgst_rate'] + $inv['igst_rate']),
            'total_amount' => (float) $inv['grand_total'],
            'total_paid' => (float) $inv['amount_paid'],
            'total_pending' => (float) $inv['balance_due'],
            'payment_status' => $inv['status'],
            'created_at_formatted' => date('d M Y', strtotime($inv['created_at']))
        ];
    }
    
    jsonResponse(true, ['invoices' => $invoices, 'summary' => $summary]);
}

if ($method === 'POST') {
    $data = getInput();
    
    $is_manual = $data['is_manual'] ?? false;
    $order_id = $data['order_id'] ?? null;      // can be crm_orders.id OR crm_cases.id
    $due_date = $data['due_date'] ?? null;
    $notes = $data['notes'] ?? null;
    $client_name = $data['client_name'] ?? null;
    $client_phone = $data['client_phone'] ?? null;
    $client_address = $data['client_address'] ?? null;
    
    $customer_gstin = $data['customer_gstin'] ?? null;
    $place_of_supply = $data['place_of_supply'] ?? null;
    $challan_no = $data['challan_no'] ?? null;
    $transport_details = $data['transport_details'] ?? null;
    $eway_bill_no = $data['eway_bill_no'] ?? null;
    
    $items = $data['items'] ?? [];

    // ─── QUICK INVOICE: OrderManagement sends { order_id, amount, gst_rate } ───
    // If no items but amount is given, auto-build a single line item
    if ((empty($items) || !is_array($items)) && isset($data['amount']) && (float)$data['amount'] > 0) {
        $quick_amount  = (float)$data['amount'];
        $quick_gst     = (float)($data['gst_rate'] ?? 18);

        // Resolve order_id → case_id via crm_orders if it exists there
        $orderStmt = $pdo->prepare("SELECT case_id FROM crm_orders WHERE id = ?");
        $orderStmt->execute([$order_id]);
        $orderRow = $orderStmt->fetch(PDO::FETCH_ASSOC);
        if ($orderRow && $orderRow['case_id']) {
            $order_id = $orderRow['case_id'];   // now order_id = crm_cases.id
        }

        $items = [[
            'service_name' => 'Relocation / Moving Services',
            'hsn_sac'      => '996719',
            'quantity'     => 1,
            'rate'         => $quick_amount,
            'gst_rate'     => $quick_gst,
            'is_igst'      => false,
        ]];
        $is_manual = false;
    }

    if (empty($items) || !is_array($items)) {
        jsonResponse(false, null, 'At least one item is required', 400);
    }
    
    $case = null;
    if (!$is_manual) {
        if (!$order_id) {
            jsonResponse(false, null, 'Case ID is required for linked invoices', 400);
        }
        $stmt = $pdo->prepare("SELECT * FROM crm_cases WHERE id = ?");
        $stmt->execute([$order_id]);
        $case = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$case) {
            jsonResponse(false, null, 'Case not found', 404);
        }
    } else {
        if (!$client_name) {
            jsonResponse(false, null, 'Client name is required for manual invoices', 400);
        }
    }
    
    // Calculate totals
    $subtotal = 0;
    $cgst_amount = 0;
    $sgst_amount = 0;
    $igst_amount = 0;

    foreach ($items as $item) {
        $qty = (float)($item['quantity'] ?? 1);
        $rate = (float)($item['rate'] ?? 0);
        $gst_percent = (float)($item['gst_rate'] ?? 18);
        $is_igst = (bool)($item['is_igst'] ?? false);
        
        $line_val = $qty * $rate;
        $subtotal += $line_val;
        
        $tax = $line_val * ($gst_percent / 100);
        if ($is_igst) {
            $igst_amount += $tax;
        } else {
            $cgst_amount += ($tax / 2);
            $sgst_amount += ($tax / 2);
        }
    }
    
    $total_tax = $cgst_amount + $sgst_amount + $igst_amount;
    $grand_total = $subtotal + $total_tax;
    
    // Generate Invoice Number format: INV/PG/seq/MM/YYYY
    $month = date('m');
    $year = date('Y');
    
    // Get count for current month
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM crm_invoices WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?");
    $stmt->execute([$month, $year]);
    $count = $stmt->fetchColumn() + 1;
    $seq = str_pad($count, 2, '0', STR_PAD_LEFT);
    
    $invoice_number = "INV/PG/{$seq}/{$month}/{$year}";
    
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            INSERT INTO crm_invoices (
                invoice_number, case_id, lead_id, client_name, client_phone, client_address, client_email,
                customer_gstin, place_of_supply, challan_no, transport_details, eway_bill_no,
                due_date, subtotal, cgst_amount, sgst_amount, igst_amount, total_tax, grand_total, balance_due,
                notes, status, created_by
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?
            )
        ");
        
        $c_name    = $is_manual ? $client_name  : $case['client_name'];
        $c_phone   = $is_manual ? $client_phone : $case['client_phone'];
        $c_address = $is_manual ? $client_address : ($case['origin_address'] ?? null);
        $c_email   = $is_manual ? null : $case['client_email'];
        $c_lead_id = $is_manual ? null : $case['lead_id'];
        $c_case_id = $is_manual ? null : $case['id'];
        
        $stmt->execute([
            $invoice_number, $c_case_id, $c_lead_id, $c_name, $c_phone, $c_address, $c_email,
            $customer_gstin, $place_of_supply, $challan_no, $transport_details, $eway_bill_no,
            $due_date, $subtotal, $cgst_amount, $sgst_amount, $igst_amount, $total_tax, $grand_total, $grand_total,
            $notes, 'pending', $adminId
        ]);
        
        $invoice_id = $pdo->lastInsertId();
        
        $lineStmt = $pdo->prepare("
            INSERT INTO crm_invoice_line_items (
                invoice_id, service_name, hsn_sac, quantity, unit_price, gst_rate, line_total
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($items as $item) {
            $qty = (float)($item['quantity'] ?? 1);
            $rate = (float)($item['rate'] ?? 0);
            $gst_percent = (float)($item['gst_rate'] ?? 18);
            $line_val = $qty * $rate;
            
            $lineStmt->execute([
                $invoice_id,
                $item['service_name'] ?? 'Service',
                $item['hsn_sac'] ?? null,
                $qty,
                $rate,
                $gst_percent,
                $line_val
            ]);
        }
        
        $pdo->commit();
        jsonResponse(true, [
            'message'        => 'Invoice created successfully',
            'invoice_id'     => $invoice_id,
            'invoice_number' => $invoice_number,
            'grand_total'    => $grand_total
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
}

if ($method === 'DELETE') {
    $data = getInput();
    $id = (int)($data['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Invoice ID is required', 400);

    try {
        $pdo->beginTransaction();
        $pdo->prepare("DELETE FROM crm_invoice_line_items WHERE invoice_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM crm_invoices WHERE id = ?")->execute([$id]);
        $pdo->commit();
        jsonResponse(true, ['message' => 'Invoice deleted']);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, null, 'Delete error: ' . $e->getMessage(), 500);
    }
}

if ($method === 'PUT') {
    $data = getInput();
    $id = (int)($data['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'Invoice ID is required', 400);
    
    $is_manual = $data['is_manual'] ?? false;
    $order_id = $data['order_id'] ?? null;
    $due_date = $data['due_date'] ?? null;
    $notes = $data['notes'] ?? null;
    $client_name = $data['client_name'] ?? null;
    $client_phone = $data['client_phone'] ?? null;
    $client_address = $data['client_address'] ?? null;
    $customer_gstin = $data['customer_gstin'] ?? null;
    $place_of_supply = $data['place_of_supply'] ?? null;
    $challan_no = $data['challan_no'] ?? null;
    $transport_details = $data['transport_details'] ?? null;
    $eway_bill_no = $data['eway_bill_no'] ?? null;
    
    $items = $data['items'] ?? [];

    if (empty($items) || !is_array($items)) {
        jsonResponse(false, null, 'At least one item is required', 400);
    }
    
    $case = null;
    if (!$is_manual) {
        if (!$order_id) jsonResponse(false, null, 'Order ID is required', 400);
        $stmt = $pdo->prepare("SELECT client_name, client_phone FROM crm_cases WHERE id = ?");
        $stmt->execute([$order_id]);
        $case = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$case) jsonResponse(false, null, 'Invalid Case ID', 400);
        
        $client_name = $case['client_name'];
        $client_phone = $case['client_phone'];
        // Use client_address from $data instead of $case
        $client_address = $data['client_address'] ?? null;
    }

    $subtotal = 0;
    $cgst_amount = 0;
    $sgst_amount = 0;
    $igst_amount = 0;

    foreach ($items as $item) {
        $qty = (float)($item['quantity'] ?? 1);
        $rate = (float)($item['rate'] ?? 0);
        $gst_percent = (float)($item['gst_rate'] ?? 18);
        $is_igst = (bool)($item['is_igst'] ?? false);
        
        $line_val = $qty * $rate;
        $subtotal += $line_val;
        
        $tax = $line_val * ($gst_percent / 100);
        if ($is_igst) {
            $igst_amount += $tax;
        } else {
            $cgst_amount += ($tax / 2);
            $sgst_amount += ($tax / 2);
        }
    }
    
    $total_tax = $cgst_amount + $sgst_amount + $igst_amount;
    $grand_total = $subtotal + $total_tax;

    try {
        $pdo->beginTransaction();
        
        // We will keep existing amount_paid, but update balance_due.
        $stmt = $pdo->prepare("SELECT amount_paid FROM crm_invoices WHERE id = ?");
        $stmt->execute([$id]);
        $inv = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$inv) {
            throw new Exception("Invoice not found");
        }
        $amount_paid = (float)$inv['amount_paid'];
        $balance_due = $grand_total - $amount_paid;
        
        // Update payment status if needed
        $status = 'pending';
        if ($balance_due <= 0 && $amount_paid > 0) $status = 'paid';
        elseif ($amount_paid > 0) $status = 'partial';
        
        // Keep cgst_rate, sgst_rate, igst_rate logic simple based on items, or just store 0 for global since line items track it.
        $stmt = $pdo->prepare("
            UPDATE crm_invoices SET 
                case_id = ?, client_name = ?, client_phone = ?, client_address = ?, subtotal = ?, 
                cgst_rate = 0, cgst_amount = ?, sgst_rate = 0, sgst_amount = ?, 
                igst_rate = 0, igst_amount = ?, total_tax = ?, grand_total = ?, 
                due_date = ?, notes = ?, balance_due = ?, status = ?,
                customer_gstin = ?, place_of_supply = ?, challan_no = ?, 
                transport_details = ?, eway_bill_no = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $is_manual ? null : $order_id,
            $client_name,
            $client_phone,
            $client_address,
            $subtotal,
            $cgst_amount,
            $sgst_amount,
            $igst_amount,
            $total_tax,
            $grand_total,
            $due_date,
            $notes,
            $balance_due,
            $status,
            $customer_gstin,
            $place_of_supply,
            $challan_no,
            $transport_details,
            $eway_bill_no,
            $id
        ]);
        
        // Re-insert line items
        $pdo->prepare("DELETE FROM crm_invoice_line_items WHERE invoice_id = ?")->execute([$id]);
        
        $lineStmt = $pdo->prepare("
            INSERT INTO crm_invoice_line_items (
                invoice_id, service_name, hsn_sac, quantity, unit_price, gst_rate, line_total
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($items as $item) {
            $qty = (float)($item['quantity'] ?? 1);
            $rate = (float)($item['rate'] ?? 0);
            $gst_percent = (float)($item['gst_rate'] ?? 18);
            $line_val = $qty * $rate;
            
            $lineStmt->execute([
                $id,
                $item['service_name'] ?? 'Service',
                $item['hsn_sac'] ?? null,
                $qty,
                $rate,
                $gst_percent,
                $line_val
            ]);
        }
        
        $pdo->commit();
        jsonResponse(true, ['message' => 'Invoice updated successfully', 'invoice_id' => $id]);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
}

jsonResponse(false, null, 'Method not allowed', 405);
