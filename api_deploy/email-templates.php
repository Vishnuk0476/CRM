<?php
// ============================================================
// Email Templates — Status-specific premium email bodies
// ============================================================

// Admin notification recipients
define('ADMIN_EMAILS', ['cartoonfunonly@gmail.com', 'vishnu.kumar@panyaglobal.in']);

// Logo URL (black logo for all emails)
define('PG_LOGO_URL', 'https://panyaglobal.in/assets/logo-black.png');

// Testimonial / feedback page
define('FEEDBACK_URL', 'https://panyaglobal.in/reviews');

/**
 * Send email to all admin recipients
 */
function sendAdminNotification(string $subject, string $bodyHtml): void {
    foreach (ADMIN_EMAILS as $email) {
        sendEmail($email, $subject, emailTemplate($subject, $bodyHtml, 'eab308'));
    }
}

/**
 * Builds a visual progress bar for email (HTML table-based)
 */
function emailProgressBar(string $currentStatus): string {
    $allStatuses = [
        'booked'           => 'Booked',
        'picked_up'        => 'Picked Up',
        'in_transit'       => 'In Transit',
        'storage'          => 'In Storage',
        'out_for_delivery' => 'Out for Delivery',
        'delivered'        => 'Delivered',
    ];

    // Remove storage from progress if not relevant
    if ($currentStatus !== 'storage') {
        unset($allStatuses['storage']);
    }

    $keys = array_keys($allStatuses);
    $currentIdx = array_search($currentStatus, $keys);
    if ($currentIdx === false) $currentIdx = 0;

    $dots = '';
    $labels = '';
    $count = count($allStatuses);
    $i = 0;
    foreach ($allStatuses as $key => $label) {
        $isActive = ($i <= $currentIdx);
        $isCurrent = ($key === $currentStatus);
        $dotColor = $isActive ? '#ef4444' : '#cbd5e1';
        $border = $isCurrent ? 'border:3px solid #ef4444;' : '';
        $textWeight = $isActive ? 'font-weight:700;color:#0f172a;' : 'color:#94a3b8;';
        $width = round(100 / $count, 1);

        $dots .= "<td style='width:{$width}%;text-align:center;padding:0 2px;'>
            <div style='width:28px;height:28px;border-radius:50%;background:{$dotColor};{$border}margin:0 auto;'></div>
        </td>";
        $labels .= "<td style='width:{$width}%;text-align:center;padding:6px 2px 0;font-size:11px;{$textWeight}'>{$label}</td>";
        $i++;
    }

    // Connector line
    return "
    <div style='margin:24px 0 32px;'>
      <table style='width:100%;border-collapse:collapse;'><tr>{$dots}</tr></table>
      <div style='height:3px;background:linear-gradient(to right, #ef4444 " . round(($currentIdx / max($count - 1, 1)) * 100) . "%, #e2e8f0 " . round(($currentIdx / max($count - 1, 1)) * 100) . "%);margin:-16px 8% 0;border-radius:4px;'></div>
      <table style='width:100%;border-collapse:collapse;margin-top:12px;'><tr>{$labels}</tr></table>
    </div>";
}

/**
 * Common consignment details table
 */
function emailDetailsTable(array $fields): string {
    $rows = '';
    $lastKey = array_key_last($fields);
    foreach ($fields as $label => $value) {
        $isLast = ($label === $lastKey);
        $border = $isLast ? '' : 'border-bottom:1px solid #e2e8f0;';
        $isLR = (stripos($label, 'LR') !== false);
        $valStyle = $isLR
            ? "color:#ef4444;font-size:16px;font-weight:800;letter-spacing:0.5px;"
            : "color:#0f172a;font-size:14px;font-weight:600;";

        $rows .= "<tr>
            <td style='padding:12px 0;{$border}color:#64748b;font-size:14px;'>{$label}</td>
            <td style='padding:12px 0;{$border}{$valStyle}text-align:right;'>{$value}</td>
        </tr>";
    }
    return "
    <div style='background-color:#f8fafc;border-radius:12px;padding:24px;margin-bottom:24px;'>
        <div style='font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;text-align:center;'>Shipment Details</div>
        <table style='width:100%;border-collapse:collapse;'>{$rows}</table>
    </div>";
}

/**
 * Delay notice — shown ONLY when delivery is past estimated date
 */
function emailDelayNotice(string $customerName): string {
    return "
    <div style='background-color:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:20px;margin-bottom:24px;'>
        <div style='font-size:15px;font-weight:700;color:#92400e;margin-bottom:8px;'>We sincerely apologise, {$customerName}</div>
        <p style='color:#78350f;font-size:14px;line-height:1.6;margin:0;'>
            We understand your shipment has taken longer than expected, and we truly regret the inconvenience.
            Our team is working round the clock to ensure your belongings reach you at the earliest.
            Your patience means the world to us. For any queries, please reach us at <strong>info@panyaglobal.in</strong>
        </p>
    </div>";
}

/**
 * Check if shipment is actually delayed (estimated_delivery is in the past)
 */
function isShipmentDelayed(array $c): bool {
    if (empty($c['estimated_delivery'])) return false;
    return (strtotime($c['estimated_delivery']) < strtotime('today'));
}

// ─── STATUS-SPECIFIC EMAIL BODIES ─────────────────────────────

/**
 * BOOKING CONFIRMED — when consignment is first created
 */
function emailBodyBooked(array $c, string $trackingUrl): string {
    $name = htmlspecialchars($c['customer_name'], ENT_QUOTES, 'UTF-8');
    $lr = $c['lr_number'] ?? $c['consignment_number'] ?? '';
    $origin = htmlspecialchars($c['origin'] ?? '', ENT_QUOTES, 'UTF-8');
    $dest = htmlspecialchars($c['destination'] ?? '', ENT_QUOTES, 'UTF-8');
    $service = htmlspecialchars($c['service_type'] ?? 'Relocation', ENT_QUOTES, 'UTF-8');
    $estDel = !empty($c['estimated_delivery']) ? date('l, M d, Y', strtotime($c['estimated_delivery'])) : 'To be confirmed';

    $progress = emailProgressBar('booked');
    $details = emailDetailsTable([
        'LR Number' => $lr,
        'Customer' => $name,
        'Service' => $service,
        'From' => $origin,
        'To' => $dest,
        'Est. Delivery' => $estDel,
    ]);

    return "
    <div style='text-align:center;margin-bottom:24px;'>
        <div style='font-size:26px;font-weight:800;color:#0f172a;margin-bottom:6px;'>Dear {$name},</div>
        <div style='font-size:20px;font-weight:600;color:#334155;margin-bottom:8px;'>Your consignment has been booked successfully!</div>
        <div style='width:40px;height:3px;background:#ef4444;margin:12px auto;border-radius:2px;'></div>
        <p style='color:#64748b;font-size:15px;line-height:1.6;max-width:440px;margin:0 auto;'>
            Thank you for choosing Panya Global Relocation. We are committed to delivering your belongings safely and on time.
        </p>
    </div>

    {$progress}
    {$details}

    <p style='text-align:center;color:#475569;font-size:14px;margin-bottom:24px;line-height:1.6;'>
        You can track your shipment anytime by visiting <strong>panyaglobal.in/track</strong> and entering your <strong>LR Number</strong>.
    </p>

    <div style='text-align:center;margin:28px 0;'>
        <a href='{$trackingUrl}' style='display:inline-block;padding:14px 40px;background-color:#ef4444;color:#ffffff;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;'>
            Track Your Shipment
        </a>
    </div>";
}

/**
 * PICKED UP — shipment has been collected
 */
function emailBodyPickedUp(array $c, string $trackingUrl): string {
    $name = htmlspecialchars($c['customer_name'], ENT_QUOTES, 'UTF-8');
    $lr = $c['lr_number'] ?? $c['consignment_number'] ?? '';
    $origin = htmlspecialchars($c['origin'] ?? '', ENT_QUOTES, 'UTF-8');
    $dest = htmlspecialchars($c['destination'] ?? '', ENT_QUOTES, 'UTF-8');
    $estDel = !empty($c['estimated_delivery']) ? date('l, M d, Y', strtotime($c['estimated_delivery'])) : 'To be confirmed';
    $progress = emailProgressBar('picked_up');
    $details = emailDetailsTable([
        'LR Number' => $lr,
        'Status' => 'Picked Up',
        'From' => $origin,
        'To' => $dest,
        'Est. Delivery' => $estDel,
    ]);
    $delay = isShipmentDelayed($c) ? emailDelayNotice($name) : '';

    return "
    <div style='text-align:center;margin-bottom:24px;'>
        <div style='font-size:26px;font-weight:800;color:#0f172a;margin-bottom:6px;'>Dear {$name},</div>
        <div style='font-size:20px;font-weight:600;color:#334155;margin-bottom:8px;'>Your shipment has been picked up!</div>
        <div style='width:40px;height:3px;background:#ef4444;margin:12px auto;border-radius:2px;'></div>
        <p style='color:#64748b;font-size:15px;line-height:1.6;max-width:440px;margin:0 auto;'>
            Our team has safely collected your consignment from <strong>{$origin}</strong> and it is now being prepared for dispatch.
        </p>
    </div>

    {$progress}
    {$delay}
    {$details}

    <div style='background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;'>
        <div style='font-size:13px;color:#166534;font-weight:600;'>Expected Arrival</div>
        <div style='font-size:22px;font-weight:800;color:#15803d;margin-top:4px;'>{$estDel}</div>
    </div>

    <div style='text-align:center;margin:28px 0;'>
        <a href='{$trackingUrl}' style='display:inline-block;padding:14px 40px;background-color:#ef4444;color:#ffffff;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;'>
            Track Your Shipment
        </a>
    </div>";
}

/**
 * IN TRANSIT — shipment is on the road
 */
function emailBodyInTransit(array $c, string $trackingUrl, string $stepNote = ''): string {
    $name = htmlspecialchars($c['customer_name'], ENT_QUOTES, 'UTF-8');
    $lr = $c['lr_number'] ?? $c['consignment_number'] ?? '';
    $origin = htmlspecialchars($c['origin'] ?? '', ENT_QUOTES, 'UTF-8');
    $dest = htmlspecialchars($c['destination'] ?? '', ENT_QUOTES, 'UTF-8');
    $estDel = !empty($c['estimated_delivery']) ? date('l, M d, Y', strtotime($c['estimated_delivery'])) : 'To be confirmed';
    $progress = emailProgressBar('in_transit');
    $fields = ['LR Number' => $lr, 'Status' => 'In Transit', 'From' => $origin, 'To' => $dest, 'Est. Delivery' => $estDel];
    if ($stepNote) $fields['Current Update'] = htmlspecialchars($stepNote, ENT_QUOTES, 'UTF-8');
    $details = emailDetailsTable($fields);
    $delay = isShipmentDelayed($c) ? emailDelayNotice($name) : '';

    return "
    <div style='text-align:center;margin-bottom:24px;'>
        <div style='font-size:26px;font-weight:800;color:#0f172a;margin-bottom:6px;'>Dear {$name},</div>
        <div style='font-size:20px;font-weight:600;color:#334155;margin-bottom:8px;'>Your shipment is on the move!</div>
        <div style='width:40px;height:3px;background:#ef4444;margin:12px auto;border-radius:2px;'></div>
        <p style='color:#64748b;font-size:15px;line-height:1.6;max-width:440px;margin:0 auto;'>
            Your consignment is currently in transit from <strong>{$origin}</strong> towards <strong>{$dest}</strong>. Our team is ensuring a safe and timely journey.
        </p>
    </div>

    {$progress}
    {$delay}
    {$details}

    <div style='background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;'>
        <div style='font-size:13px;color:#166534;font-weight:600;'>Expected Arrival</div>
        <div style='font-size:22px;font-weight:800;color:#15803d;margin-top:4px;'>{$estDel}</div>
    </div>

    <div style='text-align:center;margin:28px 0;'>
        <a href='{$trackingUrl}' style='display:inline-block;padding:14px 40px;background-color:#ef4444;color:#ffffff;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;'>
            Track Live Location
        </a>
    </div>";
}

/**
 * STORAGE — items placed in storage facility
 */
function emailBodyStorage(array $c, string $trackingUrl, string $stepNote = ''): string {
    $name = htmlspecialchars($c['customer_name'], ENT_QUOTES, 'UTF-8');
    $lr = $c['lr_number'] ?? $c['consignment_number'] ?? '';
    $origin = htmlspecialchars($c['origin'] ?? '', ENT_QUOTES, 'UTF-8');
    $dest = htmlspecialchars($c['destination'] ?? '', ENT_QUOTES, 'UTF-8');
    $storageNote = $stepNote ? htmlspecialchars($stepNote, ENT_QUOTES, 'UTF-8') : 'Contact us for storage duration details.';

    $progress = emailProgressBar('storage');
    $details = emailDetailsTable([
        'LR Number' => $lr,
        'Status' => 'In Storage',
        'From' => $origin,
        'To' => $dest,
        'Storage Info' => $storageNote,
    ]);

    return "
    <div style='text-align:center;margin-bottom:24px;'>
        <div style='font-size:26px;font-weight:800;color:#0f172a;margin-bottom:6px;'>Dear {$name},</div>
        <div style='font-size:20px;font-weight:600;color:#334155;margin-bottom:8px;'>Your belongings are safely stored!</div>
        <div style='width:40px;height:3px;background:#ef4444;margin:12px auto;border-radius:2px;'></div>
        <p style='color:#64748b;font-size:15px;line-height:1.6;max-width:460px;margin:0 auto;'>
            Your consignment has been securely placed in our storage facility. Your items are insured and monitored 24/7 for complete peace of mind.
        </p>
    </div>

    {$progress}
    {$details}

    <div style='background:#eff6ff;border:1px solid #93c5fd;border-radius:12px;padding:20px;margin-bottom:24px;'>
        <div style='font-size:14px;font-weight:700;color:#1e40af;margin-bottom:8px;'>Storage Details</div>
        <p style='color:#1e3a5f;font-size:14px;line-height:1.6;margin:0;'>
            {$storageNote}<br><br>
            Need to extend, reduce, or schedule delivery? Simply reply to this email or write to us at <strong>info@panyaglobal.in</strong>. We are here to help!
        </p>
    </div>

    <div style='text-align:center;margin:28px 0;'>
        <a href='{$trackingUrl}' style='display:inline-block;padding:14px 40px;background-color:#ef4444;color:#ffffff;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;'>
            Track Your Shipment
        </a>
    </div>";
}

/**
 * OUT FOR DELIVERY — shipment is arriving today
 */
function emailBodyOutForDelivery(array $c, string $trackingUrl): string {
    $name = htmlspecialchars($c['customer_name'], ENT_QUOTES, 'UTF-8');
    $lr = $c['lr_number'] ?? $c['consignment_number'] ?? '';
    $origin = htmlspecialchars($c['origin'] ?? '', ENT_QUOTES, 'UTF-8');
    $dest = htmlspecialchars($c['destination'] ?? '', ENT_QUOTES, 'UTF-8');
    $progress = emailProgressBar('out_for_delivery');
    $details = emailDetailsTable([
        'LR Number' => $lr,
        'Status' => 'Out for Delivery',
        'From' => $origin,
        'Delivering To' => $dest,
    ]);
    $delay = isShipmentDelayed($c) ? emailDelayNotice($name) : '';

    return "
    <div style='text-align:center;margin-bottom:24px;'>
        <div style='font-size:26px;font-weight:800;color:#0f172a;margin-bottom:6px;'>Dear {$name},</div>
        <div style='font-size:20px;font-weight:600;color:#15803d;margin-bottom:8px;'>Your shipment is out for delivery!</div>
        <div style='width:40px;height:3px;background:#22c55e;margin:12px auto;border-radius:2px;'></div>
        <p style='color:#64748b;font-size:15px;line-height:1.6;max-width:460px;margin:0 auto;'>
            Great news! Your consignment is on its way to you right now. Please ensure someone is available at the delivery address to receive it.
        </p>
    </div>

    {$progress}
    {$delay}
    {$details}

    <div style='background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;'>
        <div style='font-size:18px;font-weight:800;color:#15803d;'>Arriving Today!</div>
        <p style='color:#166534;font-size:14px;margin:8px 0 0;'>Our delivery team will contact you shortly. Please keep your phone accessible.</p>
    </div>

    <div style='text-align:center;margin:28px 0;'>
        <a href='{$trackingUrl}' style='display:inline-block;padding:14px 40px;background-color:#22c55e;color:#ffffff;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;'>
            Track Live Delivery
        </a>
    </div>";
}

/**
 * DELIVERED — final email with feedback/testimonial link
 */
function emailBodyDelivered(array $c, string $trackingUrl): string {
    $name = htmlspecialchars($c['customer_name'], ENT_QUOTES, 'UTF-8');
    $lr = $c['lr_number'] ?? $c['consignment_number'] ?? '';
    $origin = htmlspecialchars($c['origin'] ?? '', ENT_QUOTES, 'UTF-8');
    $dest = htmlspecialchars($c['destination'] ?? '', ENT_QUOTES, 'UTF-8');
    $service = htmlspecialchars($c['service_type'] ?? 'Relocation', ENT_QUOTES, 'UTF-8');

    $progress = emailProgressBar('delivered');
    $details = emailDetailsTable([
        'LR Number' => $lr,
        'Status' => 'Delivered',
        'Service' => $service,
        'From' => $origin,
        'To' => $dest,
        'Delivered On' => date('l, M d, Y'),
    ]);

    return "
    <div style='text-align:center;margin-bottom:24px;'>
        <div style='font-size:26px;font-weight:800;color:#0f172a;margin-bottom:6px;'>Dear {$name},</div>
        <div style='font-size:20px;font-weight:600;color:#15803d;margin-bottom:8px;'>Your shipment has been delivered!</div>
        <div style='width:40px;height:3px;background:#22c55e;margin:12px auto;border-radius:2px;'></div>
        <p style='color:#64748b;font-size:15px;line-height:1.6;max-width:460px;margin:0 auto;'>
            We are delighted to confirm that your consignment has been successfully delivered. We hope everything arrived safely and to your satisfaction.
        </p>
    </div>

    {$progress}
    {$details}

    <div style='background:linear-gradient(135deg,#fef3c7,#fde68a);border:1px solid #f59e0b;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;'>
        <div style='font-size:18px;font-weight:800;color:#92400e;margin-bottom:8px;'>We would love your feedback!</div>
        <p style='color:#78350f;font-size:14px;line-height:1.6;margin:0 0 16px;'>
            Your experience matters to us. Share a quick testimonial to help other families trust Panya Global with their precious belongings.
        </p>
        <a href='" . FEEDBACK_URL . "' style='display:inline-block;padding:12px 32px;background-color:#f59e0b;color:#ffffff;text-decoration:none;border-radius:50px;font-size:14px;font-weight:700;'>
            Share Your Experience
        </a>
    </div>

    <p style='text-align:center;color:#475569;font-size:14px;line-height:1.6;'>
        Thank you for choosing <strong>Panya Global Relocation</strong>. We look forward to serving you again!
    </p>";
}

/**
 * Generic update email — fallback for manual step pushes without status change
 */
function emailBodyGenericUpdate(array $c, string $trackingUrl, string $statusLabel, string $stepNote = ''): string {
    $name = htmlspecialchars($c['customer_name'], ENT_QUOTES, 'UTF-8');
    $lr = $c['lr_number'] ?? $c['consignment_number'] ?? '';
    $origin = htmlspecialchars($c['origin'] ?? '', ENT_QUOTES, 'UTF-8');
    $dest = htmlspecialchars($c['destination'] ?? '', ENT_QUOTES, 'UTF-8');
    $estDel = !empty($c['estimated_delivery']) ? date('l, M d, Y', strtotime($c['estimated_delivery'])) : 'To be confirmed';
    $safeNote = $stepNote ? htmlspecialchars($stepNote, ENT_QUOTES, 'UTF-8') : '';

    $currentStatus = $c['status'] ?? 'booked';
    $progress = emailProgressBar($currentStatus);
    $fields = ['LR Number' => $lr, 'Status' => $statusLabel, 'From' => $origin, 'To' => $dest, 'Est. Delivery' => $estDel];
    if ($safeNote) $fields['Update Note'] = $safeNote;
    $details = emailDetailsTable($fields);
    $delay = isShipmentDelayed($c) ? emailDelayNotice($name) : '';

    return "
    <div style='text-align:center;margin-bottom:24px;'>
        <div style='font-size:26px;font-weight:800;color:#0f172a;margin-bottom:6px;'>Dear {$name},</div>
        <div style='font-size:20px;font-weight:600;color:#334155;margin-bottom:8px;'>Shipment Update</div>
        <div style='width:40px;height:3px;background:#ef4444;margin:12px auto;border-radius:2px;'></div>
        <p style='color:#64748b;font-size:15px;'>Your consignment status has been updated.</p>
    </div>

    {$progress}
    {$delay}
    {$details}

    <div style='text-align:center;margin:28px 0;'>
        <a href='{$trackingUrl}' style='display:inline-block;padding:14px 40px;background-color:#ef4444;color:#ffffff;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;'>
            Track Your Shipment
        </a>
    </div>";
}

/**
 * Master dispatcher — returns the right email body based on status
 */
function getStatusEmailBody(string $status, array $consignment, string $trackingUrl, string $stepNote = ''): string {
    switch ($status) {
        case 'booked':           return emailBodyBooked($consignment, $trackingUrl);
        case 'picked_up':        return emailBodyPickedUp($consignment, $trackingUrl);
        case 'in_transit':       return emailBodyInTransit($consignment, $trackingUrl, $stepNote);
        case 'storage':          return emailBodyStorage($consignment, $trackingUrl, $stepNote);
        case 'out_for_delivery': return emailBodyOutForDelivery($consignment, $trackingUrl);
        case 'delivered':        return emailBodyDelivered($consignment, $trackingUrl);
        default:
            $label = ucfirst(str_replace('_', ' ', $status));
            return emailBodyGenericUpdate($consignment, $trackingUrl, $label, $stepNote);
    }
}

/**
 * Returns the subject line based on status
 */
function getStatusEmailSubject(string $status, string $lrNumber): string {
    $subjects = [
        'booked'           => "Booking Confirmed — LR No: {$lrNumber} | Panya Global Relocation",
        'picked_up'        => "Shipment Picked Up — LR No: {$lrNumber} | Panya Global",
        'in_transit'       => "Shipment In Transit — LR No: {$lrNumber} | Panya Global",
        'storage'          => "Items In Storage — LR No: {$lrNumber} | Panya Global",
        'out_for_delivery' => "Out for Delivery Today — LR No: {$lrNumber} | Panya Global",
        'delivered'        => "Delivered Successfully — LR No: {$lrNumber} | Panya Global",
        'cancelled'        => "Shipment Cancelled — LR No: {$lrNumber} | Panya Global",
    ];
    return $subjects[$status] ?? "Shipment Update — LR No: {$lrNumber} | Panya Global";
}

/**
 * Returns the heading for the email template wrapper
 */
function getStatusEmailHeading(string $status): string {
    $headings = [
        'booked'           => 'Booking Confirmed',
        'picked_up'        => 'Shipment Picked Up',
        'in_transit'       => 'Shipment In Transit',
        'storage'          => 'Items In Storage',
        'out_for_delivery' => 'Out for Delivery',
        'delivered'        => 'Shipment Delivered',
        'cancelled'        => 'Shipment Cancelled',
    ];
    return $headings[$status] ?? 'Shipment Update';
}
