-- ============================================================
-- Panya Global CRM — Database Schema
-- MySQL 5.7+ / MariaDB 10.3+
-- Run this against panyaglobal_db
-- ============================================================

USE panyaglobal_db;

-- ─── 0. Add role column to existing admins table if missing ──
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS role ENUM('owner','manager','salesperson','accountant') NOT NULL DEFAULT 'salesperson' AFTER password;

-- ─── 1. CRM_LEADS — Full lead details ───────────────────────
CREATE TABLE IF NOT EXISTS crm_leads (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id    VARCHAR(30) NOT NULL COMMENT 'Manually entered, e.g. MP-56119',
    customer_name   VARCHAR(150) NOT NULL,
    phone           VARCHAR(20) DEFAULT NULL,
    email           VARCHAR(150) DEFAULT NULL,
    pickup_city     VARCHAR(100) DEFAULT NULL,
    drop_city       VARCHAR(100) DEFAULT NULL,
    shipping_date   DATE DEFAULT NULL,
    property_type   VARCHAR(80) DEFAULT NULL COMMENT 'e.g. 1BHK, 2BHK, 3BHK, Villa, Office',
    load_type       VARCHAR(80) DEFAULT NULL COMMENT 'e.g. Household, Commercial, Vehicle',
    salesperson_id  INT DEFAULT NULL,
    status          ENUM('enquiry','quoted','confirmed','in_transit','completed','cancelled') NOT NULL DEFAULT 'enquiry',
    lead_source     VARCHAR(80) DEFAULT NULL COMMENT 'e.g. Website, IndiaMART, JustDial, Referral',
    estimated_amount DECIMAL(12,2) DEFAULT NULL,
    notes           TEXT DEFAULT NULL,
    sheets_row_id   INT DEFAULT NULL COMMENT 'Row index in Google Sheets LEADS tab',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_quotation_id (quotation_id),
    INDEX idx_status (status),
    INDEX idx_salesperson (salesperson_id),
    INDEX idx_created (created_at),
    INDEX idx_shipping_date (shipping_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 2. CRM_ORDERS — Confirmed leads become orders ─────────
CREATE TABLE IF NOT EXISTS crm_orders (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    lead_id             INT NOT NULL,
    order_number        VARCHAR(30) NOT NULL COMMENT 'e.g. ORD-20260501-001',
    pickup_address      TEXT DEFAULT NULL,
    pickup_floor        VARCHAR(10) DEFAULT NULL,
    pickup_lift         ENUM('yes','no','na') DEFAULT 'na',
    drop_address        TEXT DEFAULT NULL,
    drop_floor          VARCHAR(10) DEFAULT NULL,
    drop_lift           ENUM('yes','no','na') DEFAULT 'na',
    eta                 DATE DEFAULT NULL,
    team_assigned       VARCHAR(200) DEFAULT NULL COMMENT 'Comma-separated team member names',
    special_instructions TEXT DEFAULT NULL,
    status              ENUM('scheduled','packing','in_transit','delivered','completed','cancelled') NOT NULL DEFAULT 'scheduled',
    sheets_row_id       INT DEFAULT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_order_number (order_number),
    INDEX idx_lead (lead_id),
    INDEX idx_status (status),
    INDEX idx_eta (eta),
    CONSTRAINT fk_order_lead FOREIGN KEY (lead_id) REFERENCES crm_leads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 3. CRM_INVOICES — Billing from orders ─────────────────
CREATE TABLE IF NOT EXISTS crm_invoices (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT NOT NULL,
    invoice_number  VARCHAR(30) NOT NULL COMMENT 'e.g. INV-20260501-001',
    amount          DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Base amount before GST',
    gst_rate        DECIMAL(5,2) NOT NULL DEFAULT 18.00 COMMENT 'GST percentage',
    gst_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_status  ENUM('pending','partial','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
    due_date        DATE DEFAULT NULL,
    notes           TEXT DEFAULT NULL,
    sheets_row_id   INT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_invoice_number (invoice_number),
    INDEX idx_order (order_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_due_date (due_date),
    CONSTRAINT fk_invoice_order FOREIGN KEY (order_id) REFERENCES crm_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 4. CRM_PAYMENTS — Payment records against invoices ────
CREATE TABLE IF NOT EXISTS crm_payments (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id      INT NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    payment_method  ENUM('upi','neft','rtgs','cash','cheque','card','other') NOT NULL DEFAULT 'upi',
    transaction_id  VARCHAR(100) DEFAULT NULL,
    payment_date    DATE NOT NULL,
    notes           TEXT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_invoice (invoice_id),
    INDEX idx_payment_date (payment_date),
    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES crm_invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 5. CRM_FOLLOW_UPS — Salesperson follow-up reminders ───
CREATE TABLE IF NOT EXISTS crm_follow_ups (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    lead_id         INT NOT NULL,
    salesperson_id  INT DEFAULT NULL,
    follow_up_date  DATE NOT NULL,
    follow_up_type  ENUM('call','email','whatsapp','visit','other') NOT NULL DEFAULT 'call',
    notes           TEXT DEFAULT NULL,
    status          ENUM('pending','completed','skipped') NOT NULL DEFAULT 'pending',
    completed_at    TIMESTAMP NULL DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_lead (lead_id),
    INDEX idx_salesperson (salesperson_id),
    INDEX idx_follow_up_date (follow_up_date),
    INDEX idx_status (status),
    CONSTRAINT fk_followup_lead FOREIGN KEY (lead_id) REFERENCES crm_leads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 6. CRM_CALL_LOGS — Customer call history ──────────────
CREATE TABLE IF NOT EXISTS crm_call_logs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    lead_id         INT NOT NULL,
    salesperson_id  INT DEFAULT NULL,
    call_type       ENUM('incoming','outgoing','missed') NOT NULL DEFAULT 'outgoing',
    duration_minutes INT DEFAULT NULL,
    notes           TEXT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_lead (lead_id),
    INDEX idx_salesperson (salesperson_id),
    CONSTRAINT fk_calllog_lead FOREIGN KEY (lead_id) REFERENCES crm_leads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 7. CRM_EXPENSES — Business expense tracking ───────────
CREATE TABLE IF NOT EXISTS crm_expenses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT DEFAULT NULL COMMENT 'Nullable — expense may not be order-linked',
    category        VARCHAR(80) NOT NULL COMMENT 'e.g. Fuel, Labor, Packaging, Toll, Rent, Misc',
    description     VARCHAR(255) DEFAULT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    expense_date    DATE NOT NULL,
    added_by        INT DEFAULT NULL COMMENT 'FK → admins.id',
    receipt_url     VARCHAR(500) DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_order (order_id),
    INDEX idx_category (category),
    INDEX idx_expense_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 8. CRM_TEAM_TASKS — Task assignment for operations ────
CREATE TABLE IF NOT EXISTS crm_team_tasks (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT DEFAULT NULL,
    assigned_to     VARCHAR(150) NOT NULL COMMENT 'Team member name',
    task_description TEXT NOT NULL,
    task_date       DATE NOT NULL,
    status          ENUM('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
    completed_at    TIMESTAMP NULL DEFAULT NULL,
    sheets_row_id   INT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_order (order_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_task_date (task_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 9. CRM_SHEETS_SYNC_LOG — Track Google Sheets sync state ─
CREATE TABLE IF NOT EXISTS crm_sheets_sync_log (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    sync_type       ENUM('full','incremental','manual') NOT NULL DEFAULT 'incremental',
    sheet_name      VARCHAR(50) NOT NULL,
    rows_synced     INT NOT NULL DEFAULT 0,
    direction       ENUM('to_sheets','from_sheets','bidirectional') NOT NULL DEFAULT 'to_sheets',
    status          ENUM('success','partial','failed') NOT NULL DEFAULT 'success',
    error_message   TEXT DEFAULT NULL,
    started_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
