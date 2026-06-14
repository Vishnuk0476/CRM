-- ============================================================
-- PanyaFlow CRM — FRESH DATABASE SETUP FOR cPANEL
-- Run this in phpMyAdmin → select your DB → SQL tab
-- Database: panyaglobalmoews_crmdb
-- ============================================================

-- ─── STEP 1: Create the base admins table (MUST run first) ───
CREATE TABLE IF NOT EXISTS admins (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL DEFAULT '',
    role            ENUM('super_admin','owner','manager','salesperson','accountant','operations','digital_marketing') NOT NULL DEFAULT 'salesperson',
    permissions     JSON DEFAULT NULL,
    phone           VARCHAR(20) DEFAULT NULL,
    avatar_path     VARCHAR(500) DEFAULT NULL,
    last_login_at   TIMESTAMP NULL DEFAULT NULL,
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_admins_email (email),
    INDEX idx_admins_role (role),
    INDEX idx_admins_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 2: Insert the Super Admin user ──────────────────────
-- Password is "Admin@PanyaGlobal2026" (bcrypt hashed)
INSERT INTO admins (name, email, password, role, permissions, is_active)
VALUES (
    'Vishnu Nishad',
    'panya-admin@panyaglobal.in',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'super_admin',
    '{"dashboard":"execute","consignments":"execute","quotes":"execute","inquiries":"execute","testimonials":"execute","blog":"execute","newsletter":"execute","brochures":"execute","logs":"execute","users":"execute","analytics":"execute","pipeline":"execute","leads":"execute","orders":"execute","invoices":"execute","payments":"execute","expenses":"execute","followups":"execute","tasks":"execute","fleet":"execute","packing":"execute","calllogs":"execute","gst":"execute"}',
    1
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    role = VALUES(role),
    permissions = VALUES(permissions),
    is_active = 1;

-- ─── STEP 3: Create CRM Leads table ───────────────────────────
CREATE TABLE IF NOT EXISTS crm_leads (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id         VARCHAR(30) DEFAULT NULL,
    customer_name        VARCHAR(150) NOT NULL,
    phone                VARCHAR(20) DEFAULT NULL,
    email                VARCHAR(150) DEFAULT NULL,
    pickup_city          VARCHAR(100) DEFAULT NULL,
    drop_city            VARCHAR(100) DEFAULT NULL,
    shipping_date        DATE DEFAULT NULL,
    property_type        VARCHAR(80) DEFAULT NULL,
    load_type            VARCHAR(80) DEFAULT NULL,
    salesperson_id       INT DEFAULT NULL,
    assigned_to          INT DEFAULT NULL,
    status               ENUM('enquiry','quoted','confirmed','in_transit','completed','cancelled') NOT NULL DEFAULT 'enquiry',
    lead_source          VARCHAR(80) DEFAULT NULL,
    estimated_amount     DECIMAL(12,2) DEFAULT NULL,
    temperature          ENUM('cold','warm','hot','urgent') DEFAULT 'cold',
    alternate_phone      VARCHAR(20) DEFAULT NULL,
    company_name         VARCHAR(255) DEFAULT NULL,
    designation          VARCHAR(255) DEFAULT NULL,
    relocation_type      VARCHAR(100) DEFAULT NULL,
    origin_city          VARCHAR(255) DEFAULT NULL,
    destination_city     VARCHAR(255) DEFAULT NULL,
    move_timeline        VARCHAR(100) DEFAULT NULL,
    budget_min           DECIMAL(12,2) DEFAULT NULL,
    budget_max           DECIMAL(12,2) DEFAULT NULL,
    family_adults        INT DEFAULT 1,
    family_children      INT DEFAULT 0,
    special_requirements TEXT DEFAULT NULL,
    referral_source_name VARCHAR(255) DEFAULT NULL,
    last_contacted_at    TIMESTAMP NULL DEFAULT NULL,
    next_followup_at     TIMESTAMP NULL DEFAULT NULL,
    is_gulf_nri          TINYINT(1) DEFAULT 0,
    is_pinned            TINYINT(1) DEFAULT 0,
    is_archived          TINYINT(1) DEFAULT 0,
    converted_to_case    TINYINT(1) DEFAULT 0,
    case_id              INT DEFAULT NULL,
    notes                TEXT DEFAULT NULL,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_salesperson (salesperson_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 4: Create CRM Orders table ─────────────────────────
CREATE TABLE IF NOT EXISTS crm_orders (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    lead_id              INT DEFAULT NULL,
    order_number         VARCHAR(30) NOT NULL,
    pickup_address       TEXT DEFAULT NULL,
    drop_address         TEXT DEFAULT NULL,
    eta                  DATE DEFAULT NULL,
    special_instructions TEXT DEFAULT NULL,
    status               ENUM('scheduled','packing','in_transit','delivered','completed','cancelled') NOT NULL DEFAULT 'scheduled',
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_order_number (order_number),
    INDEX idx_lead (lead_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 5: Create CRM Invoices table ───────────────────────
CREATE TABLE IF NOT EXISTS crm_invoices (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    order_id             INT DEFAULT NULL,
    invoice_number       VARCHAR(30) NOT NULL,
    amount               DECIMAL(12,2) NOT NULL DEFAULT 0,
    gst_rate             DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    gst_amount           DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount         DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_status       ENUM('pending','partial','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
    case_id              INT DEFAULT NULL,
    quotation_id         INT DEFAULT NULL,
    client_name          VARCHAR(255) DEFAULT NULL,
    client_phone         VARCHAR(20) DEFAULT NULL,
    client_email         VARCHAR(255) DEFAULT NULL,
    client_address       TEXT DEFAULT NULL,
    client_company       VARCHAR(255) DEFAULT NULL,
    client_gst           VARCHAR(20) DEFAULT NULL,
    invoice_type         VARCHAR(30) DEFAULT 'tax_invoice',
    invoice_date         DATE DEFAULT NULL,
    due_date             DATE DEFAULT NULL,
    subtotal             DECIMAL(12,2) DEFAULT 0,
    cgst_rate            DECIMAL(5,2) DEFAULT 9.00,
    sgst_rate            DECIMAL(5,2) DEFAULT 9.00,
    igst_rate            DECIMAL(5,2) DEFAULT 0.00,
    cgst_amount          DECIMAL(12,2) DEFAULT 0,
    sgst_amount          DECIMAL(12,2) DEFAULT 0,
    igst_amount          DECIMAL(12,2) DEFAULT 0,
    total_tax            DECIMAL(12,2) DEFAULT 0,
    grand_total          DECIMAL(12,2) DEFAULT 0,
    amount_paid          DECIMAL(12,2) DEFAULT 0,
    balance_due          DECIMAL(12,2) DEFAULT 0,
    payment_terms        TEXT DEFAULT NULL,
    internal_notes       TEXT DEFAULT NULL,
    status               VARCHAR(30) DEFAULT 'draft',
    sent_at              TIMESTAMP NULL DEFAULT NULL,
    created_by           INT DEFAULT NULL,
    notes                TEXT DEFAULT NULL,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_invoice_number (invoice_number),
    INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 6: Create CRM Payments table ───────────────────────
CREATE TABLE IF NOT EXISTS crm_payments (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id           INT DEFAULT NULL,
    payment_number       VARCHAR(20) DEFAULT NULL,
    case_id              INT DEFAULT NULL,
    client_name          VARCHAR(255) DEFAULT NULL,
    amount               DECIMAL(12,2) NOT NULL,
    payment_method       ENUM('upi','neft','rtgs','cash','cheque','card','other') NOT NULL DEFAULT 'upi',
    payment_mode         VARCHAR(50) DEFAULT NULL,
    transaction_id       VARCHAR(100) DEFAULT NULL,
    reference_number     VARCHAR(255) DEFAULT NULL,
    payment_date         DATE NOT NULL,
    notes                TEXT DEFAULT NULL,
    status               VARCHAR(30) DEFAULT 'confirmed',
    created_by           INT DEFAULT NULL,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_invoice (invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 7: Create CRM Expenses table ───────────────────────
CREATE TABLE IF NOT EXISTS crm_expenses (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    order_id             INT DEFAULT NULL,
    expense_number       VARCHAR(20) DEFAULT NULL,
    case_id              INT DEFAULT NULL,
    category             VARCHAR(80) NOT NULL,
    description          VARCHAR(255) DEFAULT NULL,
    amount               DECIMAL(12,2) NOT NULL,
    expense_date         DATE NOT NULL,
    paid_by              INT DEFAULT NULL,
    added_by             INT DEFAULT NULL,
    reimbursement_status VARCHAR(30) DEFAULT 'not_applicable',
    approved_by          INT DEFAULT NULL,
    receipt_file_path    VARCHAR(500) DEFAULT NULL,
    receipt_url          VARCHAR(500) DEFAULT NULL,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_expense_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 8: Create CRM Cases table ──────────────────────────
CREATE TABLE IF NOT EXISTS crm_cases (
    id                        INT AUTO_INCREMENT PRIMARY KEY,
    case_number               VARCHAR(20) NOT NULL UNIQUE,
    lead_id                   INT DEFAULT NULL,
    client_name               VARCHAR(255) NOT NULL,
    client_phone              VARCHAR(20) NOT NULL DEFAULT '',
    client_email              VARCHAR(255) DEFAULT NULL,
    company_name              VARCHAR(255) DEFAULT NULL,
    relocation_type           VARCHAR(100) DEFAULT NULL,
    origin_city               VARCHAR(255) DEFAULT NULL,
    destination_city          VARCHAR(255) DEFAULT NULL,
    move_date_expected        DATE DEFAULT NULL,
    move_date_confirmed       DATE DEFAULT NULL,
    assigned_consultant_id    INT DEFAULT NULL,
    milestone                 VARCHAR(100) DEFAULT 'inquiry_received',
    case_status               ENUM('active','on_hold','completed','cancelled') DEFAULT 'active',
    notes                     TEXT DEFAULT NULL,
    total_quoted              DECIMAL(12,2) DEFAULT 0,
    total_invoiced            DECIMAL(12,2) DEFAULT 0,
    total_collected           DECIMAL(12,2) DEFAULT 0,
    total_pending             DECIMAL(12,2) DEFAULT 0,
    created_by                INT DEFAULT NULL,
    created_at                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cases_status (case_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 9: Create CRM Quotations table ─────────────────────
CREATE TABLE IF NOT EXISTS crm_quotations (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    quotation_number VARCHAR(20) NOT NULL UNIQUE,
    case_id          INT DEFAULT NULL,
    lead_id          INT DEFAULT NULL,
    client_name      VARCHAR(255) NOT NULL,
    client_phone     VARCHAR(20) DEFAULT NULL,
    client_email     VARCHAR(255) DEFAULT NULL,
    origin_city      VARCHAR(255) DEFAULT NULL,
    destination_city VARCHAR(255) DEFAULT NULL,
    move_date        DATE DEFAULT NULL,
    quotation_date   DATE DEFAULT NULL,
    valid_until      DATE DEFAULT NULL,
    subtotal         DECIMAL(12,2) DEFAULT 0,
    cgst_amount      DECIMAL(12,2) DEFAULT 0,
    sgst_amount      DECIMAL(12,2) DEFAULT 0,
    igst_amount      DECIMAL(12,2) DEFAULT 0,
    total_tax        DECIMAL(12,2) DEFAULT 0,
    grand_total      DECIMAL(12,2) DEFAULT 0,
    status           ENUM('draft','sent','accepted','rejected','cancelled','converted') DEFAULT 'draft',
    created_by       INT DEFAULT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_quot_case (case_id),
    INDEX idx_quot_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── STEP 10: Other required CRM tables ──────────────────────
CREATE TABLE IF NOT EXISTS crm_followups (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    lead_id         INT DEFAULT NULL,
    case_id         INT DEFAULT NULL,
    assigned_to     INT DEFAULT NULL,
    followup_type   ENUM('call','email','whatsapp','visit','other') DEFAULT 'call',
    custom_message  TEXT DEFAULT NULL,
    scheduled_at    DATETIME NOT NULL,
    status          ENUM('pending','completed','skipped','snoozed') DEFAULT 'pending',
    outcome         TEXT DEFAULT NULL,
    created_by      INT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crm_activities (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    lead_id         INT DEFAULT NULL,
    case_id         INT DEFAULT NULL,
    admin_id        INT DEFAULT NULL,
    activity_type   VARCHAR(50) NOT NULL,
    title           VARCHAR(255) DEFAULT NULL,
    description     TEXT DEFAULT NULL,
    metadata        JSON DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crm_notifications (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    admin_id              INT NOT NULL,
    title                 VARCHAR(255) NOT NULL,
    message               TEXT DEFAULT NULL,
    notification_type     VARCHAR(50) DEFAULT 'info',
    related_entity_type   VARCHAR(50) DEFAULT NULL,
    related_entity_id     INT DEFAULT NULL,
    action_url            VARCHAR(255) DEFAULT NULL,
    is_read               TINYINT(1) DEFAULT 0,
    created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_admin (admin_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crm_app_settings (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    setting_key     VARCHAR(100) NOT NULL UNIQUE,
    setting_value   TEXT DEFAULT NULL,
    setting_group   VARCHAR(50) DEFAULT 'general',
    is_sensitive    TINYINT(1) DEFAULT 0,
    updated_by      INT DEFAULT NULL,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
('office_start_time', '09:30', 'attendance'),
('office_end_time', '18:30', 'attendance'),
('late_grace_minutes', '15', 'attendance')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- ─── STEP 11: Other website tables ───────────────────────────
CREATE TABLE IF NOT EXISTS quote_submissions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) DEFAULT NULL,
    phone           VARCHAR(20) DEFAULT NULL,
    from_city       VARCHAR(100) DEFAULT NULL,
    to_city         VARCHAR(100) DEFAULT NULL,
    move_date       DATE DEFAULT NULL,
    move_type       VARCHAR(80) DEFAULT NULL,
    message         TEXT DEFAULT NULL,
    status          ENUM('new','contacted','quoted','closed') DEFAULT 'new',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_inquiries (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) DEFAULT NULL,
    phone           VARCHAR(20) DEFAULT NULL,
    service         VARCHAR(100) DEFAULT NULL,
    message         TEXT DEFAULT NULL,
    status          ENUM('new','in_progress','closed') DEFAULT 'new',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) DEFAULT NULL,
    phone           VARCHAR(20) DEFAULT NULL,
    subject         VARCHAR(255) DEFAULT NULL,
    message         TEXT DEFAULT NULL,
    status          ENUM('new','read','replied') DEFAULT 'new',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS testimonials (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    rating          TINYINT DEFAULT 5,
    review          TEXT DEFAULT NULL,
    service         VARCHAR(100) DEFAULT NULL,
    is_approved     TINYINT(1) DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(150) NOT NULL UNIQUE,
    is_active       TINYINT(1) DEFAULT 1,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    content         LONGTEXT DEFAULT NULL,
    excerpt         TEXT DEFAULT NULL,
    featured_image  VARCHAR(500) DEFAULT NULL,
    is_published    TINYINT(1) DEFAULT 0,
    published_at    TIMESTAMP NULL DEFAULT NULL,
    created_by      INT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    admin_id        INT DEFAULT NULL,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50) DEFAULT NULL,
    entity_id       INT DEFAULT NULL,
    ip_address      VARCHAR(45) DEFAULT NULL,
    details         JSON DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS visitors (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    ip_address      VARCHAR(45) DEFAULT NULL,
    user_agent      TEXT DEFAULT NULL,
    page_url        VARCHAR(500) DEFAULT NULL,
    country         VARCHAR(100) DEFAULT NULL,
    city            VARCHAR(100) DEFAULT NULL,
    visit_count     INT DEFAULT 1,
    first_visit_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_visit_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── FINAL VERIFICATION ───────────────────────────────────────
SELECT id, name, email, role, is_active FROM admins;
