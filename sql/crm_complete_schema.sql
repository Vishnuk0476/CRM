-- ============================================================
-- PanyaFlow CRM — Complete MySQL Schema
-- Idempotent: safe to run multiple times
-- All tables use crm_ prefix to match existing codebase
-- Run against: panyaglobal_db
-- ============================================================

USE panyaglobal_db;

-- ─── 0. Extend admins table ───────────────────────────────────
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS avatar_path VARCHAR(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1;

-- ─── 1. Extend crm_leads table ────────────────────────────────
ALTER TABLE crm_leads
  ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS designation VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS relocation_type VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS origin_city VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS destination_city VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS move_timeline VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS budget_min DECIMAL(12,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS budget_max DECIMAL(12,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS family_adults INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS family_children INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS special_requirements TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS temperature ENUM('cold','warm','hot','urgent') DEFAULT 'cold',
  ADD COLUMN IF NOT EXISTS assigned_to INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS referral_source_name VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS next_followup_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_gulf_nri TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_pinned TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_archived TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS converted_to_case TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS case_id INT DEFAULT NULL;

-- ─── 2. crm_cases ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(20) NOT NULL UNIQUE,
    lead_id INT DEFAULT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL DEFAULT '',
    client_alternate_phone VARCHAR(20) DEFAULT NULL,
    client_email VARCHAR(255) DEFAULT NULL,
    company_name VARCHAR(255) DEFAULT NULL,
    relocation_type VARCHAR(100) DEFAULT NULL,
    origin_address TEXT DEFAULT NULL,
    origin_city VARCHAR(255) DEFAULT NULL,
    origin_state VARCHAR(100) DEFAULT NULL,
    origin_pincode VARCHAR(10) DEFAULT NULL,
    destination_address TEXT DEFAULT NULL,
    destination_city VARCHAR(255) DEFAULT NULL,
    destination_state VARCHAR(100) DEFAULT NULL,
    destination_pincode VARCHAR(10) DEFAULT NULL,
    move_date_expected DATE DEFAULT NULL,
    move_date_confirmed DATE DEFAULT NULL,
    bhk_type VARCHAR(50) DEFAULT NULL,
    approx_area_sqft INT DEFAULT NULL,
    origin_floor INT DEFAULT NULL,
    destination_floor INT DEFAULT NULL,
    origin_elevator VARCHAR(20) DEFAULT NULL,
    destination_elevator VARCHAR(20) DEFAULT NULL,
    services_included JSON DEFAULT NULL,
    assigned_consultant_id INT DEFAULT NULL,
    assigned_at TIMESTAMP NULL DEFAULT NULL,
    milestone VARCHAR(100) DEFAULT 'inquiry_received',
    case_status ENUM('active','on_hold','completed','cancelled') DEFAULT 'active',
    is_gulf_nri TINYINT(1) DEFAULT 0,
    family_adults INT DEFAULT NULL,
    family_children INT DEFAULT NULL,
    special_requirements JSON DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    internal_tags JSON DEFAULT NULL,
    total_quoted DECIMAL(12,2) DEFAULT 0,
    total_invoiced DECIMAL(12,2) DEFAULT 0,
    total_collected DECIMAL(12,2) DEFAULT 0,
    total_pending DECIMAL(12,2) DEFAULT 0,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cases_status (case_status),
    INDEX idx_cases_consultant (assigned_consultant_id),
    INDEX idx_cases_milestone (milestone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 3. crm_case_milestones ──────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_case_milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    milestone VARCHAR(100) NOT NULL,
    milestone_date TIMESTAMP NULL DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    done_by INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cms_case (case_id),
    CONSTRAINT fk_cms_case FOREIGN KEY (case_id) REFERENCES crm_cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 4. crm_surveys ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_surveys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_number VARCHAR(20) NOT NULL UNIQUE,
    case_id INT DEFAULT NULL,
    lead_id INT DEFAULT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL DEFAULT '',
    survey_address TEXT NOT NULL,
    destination_address TEXT DEFAULT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    survey_type VARCHAR(50) DEFAULT 'pre_move',
    survey_status ENUM('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
    team_lead_id INT DEFAULT NULL,
    vehicle_assigned VARCHAR(100) DEFAULT NULL,
    bhk_type VARCHAR(50) DEFAULT NULL,
    total_area_sqft INT DEFAULT NULL,
    origin_floor INT DEFAULT NULL,
    destination_floor INT DEFAULT NULL,
    origin_elevator VARCHAR(20) DEFAULT NULL,
    destination_elevator VARCHAR(20) DEFAULT NULL,
    origin_parking TINYINT(1) DEFAULT NULL,
    destination_parking TINYINT(1) DEFAULT NULL,
    access_road_condition VARCHAR(50) DEFAULT NULL,
    access_challenges TEXT DEFAULT NULL,
    total_boxes_estimated INT DEFAULT NULL,
    total_items_count INT DEFAULT NULL,
    special_packing_needed TINYINT(1) DEFAULT 0,
    special_packing_notes TEXT DEFAULT NULL,
    checkin_latitude DECIMAL(10,8) DEFAULT NULL,
    checkin_longitude DECIMAL(11,8) DEFAULT NULL,
    checkin_time TIMESTAMP NULL DEFAULT NULL,
    checkout_time TIMESTAMP NULL DEFAULT NULL,
    general_notes TEXT DEFAULT NULL,
    client_special_instructions TEXT DEFAULT NULL,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_surveys_date (scheduled_date),
    INDEX idx_surveys_status (survey_status),
    INDEX idx_surveys_case (case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 5. crm_survey_items ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_survey_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    room_name VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    size_notes VARCHAR(100) DEFAULT NULL,
    is_fragile TINYINT(1) DEFAULT 0,
    special_packing TINYINT(1) DEFAULT 0,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_si_survey FOREIGN KEY (survey_id) REFERENCES crm_surveys(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 6. crm_survey_photos ────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_survey_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) DEFAULT NULL,
    photo_type VARCHAR(50) DEFAULT 'general',
    caption TEXT DEFAULT NULL,
    uploaded_by INT DEFAULT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sp_survey FOREIGN KEY (survey_id) REFERENCES crm_surveys(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 7. crm_quotations ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_number VARCHAR(20) NOT NULL UNIQUE,
    case_id INT DEFAULT NULL,
    lead_id INT DEFAULT NULL,
    survey_id INT DEFAULT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) DEFAULT NULL,
    client_email VARCHAR(255) DEFAULT NULL,
    client_address TEXT DEFAULT NULL,
    client_company VARCHAR(255) DEFAULT NULL,
    client_gst VARCHAR(20) DEFAULT NULL,
    origin_city VARCHAR(255) DEFAULT NULL,
    origin_state VARCHAR(100) DEFAULT NULL,
    destination_city VARCHAR(255) DEFAULT NULL,
    destination_state VARCHAR(100) DEFAULT NULL,
    bhk_type VARCHAR(50) DEFAULT NULL,
    move_date DATE DEFAULT NULL,
    quotation_date DATE DEFAULT (CURDATE()),
    valid_until DATE DEFAULT NULL,
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_type ENUM('amount','percent') DEFAULT 'amount',
    discount_value DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    cgst_rate DECIMAL(5,2) DEFAULT 9.00,
    sgst_rate DECIMAL(5,2) DEFAULT 9.00,
    igst_rate DECIMAL(5,2) DEFAULT 0.00,
    cgst_amount DECIMAL(12,2) DEFAULT 0,
    sgst_amount DECIMAL(12,2) DEFAULT 0,
    igst_amount DECIMAL(12,2) DEFAULT 0,
    total_tax DECIMAL(12,2) DEFAULT 0,
    grand_total DECIMAL(12,2) DEFAULT 0,
    payment_terms TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    terms_and_conditions TEXT DEFAULT NULL,
    status ENUM('draft','sent','accepted','rejected','cancelled','converted') DEFAULT 'draft',
    sent_at TIMESTAMP NULL DEFAULT NULL,
    accepted_at TIMESTAMP NULL DEFAULT NULL,
    rejected_at TIMESTAMP NULL DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_quot_case (case_id),
    INDEX idx_quot_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 8. crm_quotation_line_items ─────────────────────────────
CREATE TABLE IF NOT EXISTS crm_quotation_line_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    sort_order INT DEFAULT 0,
    service_name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'job',
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    gst_rate DECIMAL(5,2) DEFAULT 18.00,
    line_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qli_quot FOREIGN KEY (quotation_id) REFERENCES crm_quotations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 9. crm_invoices (full replace of old simple crm_invoices) ─
-- Note: existing crm_invoices links order_id → keep but add new columns
ALTER TABLE crm_invoices
  ADD COLUMN IF NOT EXISTS case_id INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS quotation_id INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS client_name VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS client_email VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS client_address TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS client_company VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS client_gst VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(30) DEFAULT 'tax_invoice',
  ADD COLUMN IF NOT EXISTS invoice_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS origin_city VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS origin_state VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS destination_city VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS destination_state VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_type VARCHAR(10) DEFAULT 'amount',
  ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cgst_rate DECIMAL(5,2) DEFAULT 9.00,
  ADD COLUMN IF NOT EXISTS sgst_rate DECIMAL(5,2) DEFAULT 9.00,
  ADD COLUMN IF NOT EXISTS igst_rate DECIMAL(5,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_tax DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grand_total DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bank_ifsc VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS fully_paid_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reminder_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS created_by INT DEFAULT NULL;

-- ─── 10. crm_invoice_line_items ──────────────────────────────
CREATE TABLE IF NOT EXISTS crm_invoice_line_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    sort_order INT DEFAULT 0,
    service_name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'job',
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    gst_rate DECIMAL(5,2) DEFAULT 18.00,
    line_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ili_invoice (invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 11. crm_payments (extend existing) ──────────────────────
ALTER TABLE crm_payments
  ADD COLUMN IF NOT EXISTS payment_number VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS case_id INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS client_name VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reference_number VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bank_account_credited VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS received_by INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS proof_file_path VARCHAR(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'confirmed',
  ADD COLUMN IF NOT EXISTS is_reconciled TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;

-- ─── 12. crm_expenses (extend existing) ──────────────────────
ALTER TABLE crm_expenses
  ADD COLUMN IF NOT EXISTS expense_number VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS case_id INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS expense_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS paid_by INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reimbursement_status VARCHAR(30) DEFAULT 'not_applicable',
  ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS receipt_file_path VARCHAR(500) DEFAULT NULL;

-- ─── 13. crm_vendors ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) DEFAULT NULL,
    vendor_types JSON DEFAULT NULL,
    service_cities JSON DEFAULT NULL,
    contact_person VARCHAR(255) DEFAULT NULL,
    phone_primary VARCHAR(20) DEFAULT NULL,
    phone_alternate VARCHAR(20) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    gst_number VARCHAR(20) DEFAULT NULL,
    bank_name VARCHAR(255) DEFAULT NULL,
    bank_account_number VARCHAR(50) DEFAULT NULL,
    bank_ifsc VARCHAR(20) DEFAULT NULL,
    bank_account_holder VARCHAR(255) DEFAULT NULL,
    upi_id VARCHAR(100) DEFAULT NULL,
    rate_card_notes TEXT DEFAULT NULL,
    internal_rating DECIMAL(2,1) DEFAULT 0,
    tags JSON DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 14. crm_case_vendors ────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_case_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    vendor_id INT NOT NULL,
    service_type VARCHAR(100) DEFAULT NULL,
    scope_of_work TEXT DEFAULT NULL,
    agreed_amount DECIMAL(12,2) DEFAULT NULL,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    amount_pending DECIMAL(12,2) DEFAULT 0,
    payment_reference VARCHAR(255) DEFAULT NULL,
    payment_date DATE DEFAULT NULL,
    payment_mode VARCHAR(50) DEFAULT NULL,
    status VARCHAR(30) DEFAULT 'assigned',
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cv_case (case_id),
    INDEX idx_cv_vendor (vendor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 15. crm_activities ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT DEFAULT NULL,
    case_id INT DEFAULT NULL,
    admin_id INT DEFAULT NULL,
    activity_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_act_lead (lead_id),
    INDEX idx_act_case (case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 16. crm_followups ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_followups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT DEFAULT NULL,
    case_id INT DEFAULT NULL,
    assigned_to INT DEFAULT NULL,
    followup_type ENUM('call','email','whatsapp','visit','other') DEFAULT 'call',
    template_used VARCHAR(100) DEFAULT NULL,
    custom_message TEXT DEFAULT NULL,
    scheduled_at DATETIME NOT NULL,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    status ENUM('pending','completed','skipped','snoozed') DEFAULT 'pending',
    snooze_until DATETIME DEFAULT NULL,
    outcome TEXT DEFAULT NULL,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fu_assigned (assigned_to, status),
    INDEX idx_fu_scheduled (scheduled_at, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 17. crm_field_visits ────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_field_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    visit_date DATE NOT NULL DEFAULT (CURDATE()),
    case_id INT DEFAULT NULL,
    survey_id INT DEFAULT NULL,
    client_name VARCHAR(255) DEFAULT NULL,
    client_phone VARCHAR(20) DEFAULT NULL,
    client_address TEXT NOT NULL,
    checkin_time TIMESTAMP NULL DEFAULT NULL,
    checkin_latitude DECIMAL(10,8) DEFAULT NULL,
    checkin_longitude DECIMAL(11,8) DEFAULT NULL,
    checkout_time TIMESTAMP NULL DEFAULT NULL,
    checkout_latitude DECIMAL(10,8) DEFAULT NULL,
    checkout_longitude DECIMAL(11,8) DEFAULT NULL,
    time_spent_minutes INT DEFAULT NULL,
    kilometers_traveled DECIMAL(8,2) DEFAULT NULL,
    travel_mode VARCHAR(30) DEFAULT 'own_vehicle',
    visit_purpose TEXT NOT NULL,
    visit_type VARCHAR(50) DEFAULT 'survey',
    visit_notes TEXT DEFAULT NULL,
    visit_outcome TEXT DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'planned',
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fv_admin (admin_id),
    INDEX idx_fv_case (case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 18. crm_leave_requests ──────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    days_count DECIMAL(4,1) NOT NULL,
    reason TEXT NOT NULL,
    supporting_doc_path VARCHAR(500) DEFAULT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    approved_by INT DEFAULT NULL,
    approved_at TIMESTAMP NULL DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lr_admin (admin_id),
    INDEX idx_lr_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 19. crm_notifications ───────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT DEFAULT NULL,
    notification_type VARCHAR(50) DEFAULT 'info',
    related_entity_type VARCHAR(50) DEFAULT NULL,
    related_entity_id INT DEFAULT NULL,
    action_url VARCHAR(255) DEFAULT NULL,
    is_read TINYINT(1) DEFAULT 0,
    read_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_admin (admin_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 20. crm_app_settings ────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_app_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT DEFAULT NULL,
    setting_group VARCHAR(50) DEFAULT 'general',
    is_sensitive TINYINT(1) DEFAULT 0,
    updated_by INT DEFAULT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO crm_app_settings (setting_key, setting_value, setting_group) VALUES
('company_name', 'Panya Global Relocation Pvt. Ltd.', 'company'),
('company_gst', '', 'company'),
('company_address', 'New Delhi, India', 'company'),
('company_phone', '+91 11 4155 6447', 'company'),
('company_email', 'info@panyaglobal.in', 'company'),
('company_website', 'www.panyaglobal.in', 'company'),
('invoice_prefix', 'INV-', 'invoice'),
('quotation_prefix', 'QT-', 'invoice'),
('case_prefix', 'PG-', 'invoice'),
('survey_prefix', 'SRV-', 'invoice'),
('payment_prefix', 'PAY-', 'invoice'),
('expense_prefix', 'EXP-', 'invoice'),
('default_cgst_rate', '9', 'gst'),
('default_sgst_rate', '9', 'gst'),
('default_igst_rate', '18', 'gst'),
('bank_name', '', 'company'),
('bank_account_number', '', 'company'),
('bank_ifsc', '', 'company'),
('upi_id', '', 'company'),
('invoice_terms', 'Payment due within 7 days of invoice date.', 'invoice'),
('invoice_footer', 'Thank you for choosing Panya Global Relocation.', 'invoice'),
('office_start_time', '09:30', 'attendance'),
('office_end_time', '18:30', 'attendance'),
('late_grace_minutes', '15', 'attendance'),
('half_day_hours', '4', 'attendance'),
('travel_rate_per_km', '8', 'attendance')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- ─── 21. crm_case_documents ──────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_case_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    document_category VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT DEFAULT NULL,
    file_type VARCHAR(50) DEFAULT NULL,
    is_required TINYINT(1) DEFAULT 0,
    is_received TINYINT(1) DEFAULT 1,
    received_date DATE DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    uploaded_by INT DEFAULT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cd_case (case_id),
    CONSTRAINT fk_cd_case FOREIGN KEY (case_id) REFERENCES crm_cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 22. crm_social_posts ────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_social_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) DEFAULT NULL,
    caption TEXT DEFAULT NULL,
    post_type VARCHAR(50) DEFAULT NULL,
    category VARCHAR(100) DEFAULT NULL,
    media_paths JSON DEFAULT NULL,
    status ENUM('idea','scheduled','published','cancelled') DEFAULT 'idea',
    scheduled_at DATETIME DEFAULT NULL,
    published_at TIMESTAMP NULL DEFAULT NULL,
    assigned_to INT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
