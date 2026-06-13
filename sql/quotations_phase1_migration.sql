-- Table structure for crm_quotation_templates
CREATE TABLE IF NOT EXISTS `crm_quotation_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('tc', 'include', 'exclude', 'payment_schedule') NOT NULL,
  `name` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `crm_quotation_templates_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default templates based on existing Panya Global standard
INSERT IGNORE INTO `crm_quotation_templates` (`type`, `name`, `content`, `is_active`) VALUES
('tc', 'Default Terms & Conditions', '<ul>\n<li>We request you to confirm packing dates 3 working days in advance to give you our best services.</li>\n<li>Once the move dates are confirmed to us, should you wish to postponement or cancel the move, please inform us 36 hours in advance else cancellation charges will be applicable.</li>\n<li>All services are provided in accordance with our Business Terms &amp; Conditions. A copy of this is available on request.</li>\n</ul>\n<p><strong>Carrier\'s Risk Terms and Conditions:</strong></p>\n<ol>\n<li><strong>Breakage:</strong> If due to any reason there is any breakage at the time of loading, unloading and transporter, shipper would not deduct any amount from our payment and all the claim will be settled by Insurance Co. directly.</li>\n<li>If any breakage will have to make the claim within 48 hours of your shipment reaching destination location.</li>\n<li>Do not get a breakage claim of less than INR 5,000.00</li>\n<li>If you are breakage claim above INR 5,000.00 then INR 5,000.00 processing fees deductions.</li>\n<li>Minimum premium chargeable will be INR 2,500.00</li>\n</ol>', 1),

('payment_schedule', 'B2C (Consumer) Payment Terms', '<ul>\n<li>A 20% advance payment is required to secure the reservation.</li>\n<li>Full payment (100% advance) is required upfront upon commencement of the packaging process.</li>\n<li>Payment Option - Cheque / D.D / Credit Card / NEFT / IMPS</li>\n<li>All payment in favour of M/s: PANYA GLOBAL RELOCATION PVT. LTD.</li>\n</ul>', 1),

('payment_schedule', 'B2B (Business) Payment Terms', '<ul>\n<li>50% Advance Along with Company Purchase Order.</li>\n<li>Payment is due within 7 to 45 days from the date of invoice submission.</li>\n</ul>', 0),

('include', 'Origin Include', '["Packing & Handling of household goods", "One Point Packing & Pickup", "Pickup 1st floor."]', 1),
('exclude', 'Origin Exclude', '["Wooden Crating Service", "Vehicle Halting", "Union / Society / Lift Charges would be additional basis actuals (if applicable)", "Shuttle Service, Long carry", "Handyman Services"]', 1),

('include', 'Destination Include', '["Door delivery with Unloading & Unwrapping of all Goods", "One Point delivery", "Delivery 4th floor carry by lift."]', 1),
('exclude', 'Destination Exclude', '["Shuttle Service and Long carry", "Vehicle Halting", "Union / Society / Lift Charges would be additional basis actuals (if applicable)", "Shuttle Service, Long carry", "Handyman Services"]', 1);

-- Default Application Settings (Company Profile + Quotation Defaults)
INSERT IGNORE INTO `crm_app_settings` (`setting_key`, `setting_value`, `setting_group`) VALUES
('company_name', 'Panya Global Relocation Pvt. Ltd.', 'company'),
('company_address', '18/1, Basement, Village Samalkha,\nOld Delhi Gurgaon Road, New Delhi - 110037', 'company'),
('company_phone', '+91-8800446447, +91-8800331157, +91-8800112304', 'company'),
('company_email', 'info@panyaglobal.in', 'company'),
('company_website', 'www.panyaglobal.in', 'company'),
('company_gstin', '', 'company'),
('company_pan', 'AAJCP2435L', 'company'),
('company_sac', '996511', 'company'),
('company_cin', 'U74999DL2017PTC319048', 'company'),
('company_bank_name', 'ICICI BANK LTD., SUBHASH NAGAR.', 'company'),
('company_bank_account', '336105000210', 'company'),
('company_bank_ifsc', 'ICIC0003361', 'company'),
('company_bank_micr', '110229018', 'company'),
('company_bank_beneficiary', 'PANYA GLOBAL RELOCATION PVT. LTD.', 'company'),
('company_upi_id', 'panyaglobalrelocationprivate.ibz@icici', 'company'),
('company_logo_url', '/assets/images/logo.png', 'company'),
('quotation_default_validity_days', '30', 'quotations'),
('quotation_default_gst_rate', '18', 'quotations');
