# Phase 1: Foundation — Schema & Dynamic Settings — Research

**Researched:** 02 June 2026
**Domain:** MySQL schema migration, PDO-based PHP settings API, year-scoped numbering with race-condition protection, DB-driven templates (T&C, Include, Exclude, Payment Schedule)
**Confidence:** **HIGH** for MySQL DDL/PDO patterns, **MEDIUM** for assumed company info (phone numbers vary across codebase), **HIGH** for race-condition mitigation pattern

---

## 1. Overview

Phase 1 establishes the **data layer** of the Quotation module so that quotations, line items, company info, T&C templates, include/exclude templates, and payment schedule templates can all be persisted, queried, and updated from the CRM UI without code changes. The work splits into **four concrete deliverables**: (a) a single idempotent MySQL migration that creates four new tables (`company_settings`, `tc_templates`, `include_templates`, `exclude_templates`, `payment_schedule_templates`) and ALTERs the two existing tables (`crm_quotations`, `crm_quotation_line_items`) to add the missing revision/insurance/gst-type columns, (b) a PHP function `generateQuotationNumber(PDO $pdo): string` returning `QT-2026-XXXX` with year-scoped counters protected by a transaction, (c) a family of six settings REST endpoints under `/api/crm/settings/` (company GET/PUT, templates GET/POST/PUT/DELETE by type) all guarded by `admin-guard.php` + owner/super_admin role, and (d) one default `company_settings` row + a curated seed of T&C and Include/Exclude items extracted from the existing `QuotationBuilder.tsx` `DEFAULT_TERMS` constant and the `QuotationPDFTemplate.tsx` hardcoded bullets.

**Primary recommendation:** Treat this phase as a **clean-rebuild of the data layer** that runs alongside the existing `crm_complete_schema.sql` and `public_html/api/crm/quotations.php`. The new code lives under `public_html/api/crm/quotations-v2/` (or a similarly namespaced path) so cutover is a one-line import swap. Do not modify the existing `crm_quotations` row format in a breaking way — additive ALTERs only.

---

## 2. Existing Code Analysis

### 2.1 Database (current state in `panyaglobal_db`)

Per `public_html/api/.env` line 4: `DB_DRIVER=mysql`, port 3306, db `panyaglobal_db` (NOT PostgreSQL). The PRD header mentioning "PostgreSQL" is stale — see §8 Open Questions.

The MySQL schema file `sql/crm_complete_schema.sql` is the source of truth. Sections 7 and 8 are already partially built:

**`crm_quotations` (lines 179–224) — HAS:**
- `id`, `quotation_number VARCHAR(20) NOT NULL UNIQUE`
- `case_id`, `lead_id`, `survey_id` (FK-ready, no constraints)
- Client fields: `client_name`, `client_phone`, `client_email`, `client_address`, `client_company`, `client_gst`
- Route: `origin_city`, `origin_state`, `destination_city`, `destination_state`
- `bhk_type`, `move_date`, `quotation_date DEFAULT (CURDATE())`, `valid_until`
- Discount: `discount_type ENUM('amount','percent')`, `discount_value`, `discount_amount`
- GST: `cgst_rate/sgst_rate/igst_rate` (default 9/9/0), `cgst_amount/sgst_amount/igst_amount`, `total_tax`, `grand_total`
- `payment_terms TEXT`, `notes TEXT`, `terms_and_conditions TEXT`
- Status: `status ENUM('draft','sent','accepted','rejected','cancelled','converted')`
- Timestamps: `sent_at`, `accepted_at`, `rejected_at`, `rejection_reason`, `created_by`, `created_at`, `updated_at`
- Indexes: `idx_quot_case`, `idx_quot_status`

**`crm_quotations` — MISSING (must ADD per DB-05, DB-06, UI-01..09):**
- `parent_quotation_id INT NULL` (self-referencing FK) — DB-05
- `version INT NOT NULL DEFAULT 1` — DB-06
- `quotation_family_id VARCHAR(30) NULL` — group revisions under one ID
- `default_validity_days INT DEFAULT 15`
- `gst_type ENUM('cgst_sgst','igst','exempt')` — needed by UI
- `is_move_date_confirmed TINYINT(1) DEFAULT 0` — referenced in `quotations.php` lines 39–40 but column doesn't exist (LATENT BUG)
- `lift_origin TINYINT(1) DEFAULT 0`, `lift_origin_type VARCHAR(20)`, `lift_destination TINYINT(1) DEFAULT 0`, `lift_destination_type VARCHAR(20)` — referenced in API lines 41–43 (LATENT BUG)
- `lift_type VARCHAR(20)` (referenced line 43)
- `car_declared_value DECIMAL(12,2) DEFAULT 0`, `car_insurance_percentage DECIMAL(5,2) DEFAULT 0` — referenced lines 44–45 (LATENT BUG)
- `inclusions JSON NULL`, `exclusions JSON NULL` — referenced lines 47–48 (LATENT BUG)
- `payment_schedule TEXT` — referenced in PDFTemplate line 59
- `revision_reason TEXT NULL` — Phase 2 API-08
- `revised_from_id INT NULL` — alternative lineage tracker (alias for parent_quotation_id, choose one)

**`crm_quotation_line_items` (lines 227–240) — HAS:**
- `id`, `quotation_id` (FK CASCADE), `sort_order`
- `service_name`, `description`, `quantity`, `unit`, `unit_price`, `gst_rate`, `line_total`
- `created_at`
- **NO INDEX on `quotation_id`** — required by DB-03

**`crm_app_settings` (lines 482–519) — ALREADY EXISTS** as a generic key/value store. It has 26 rows of seed data including `company_name='Panya Global Relocation Pvt. Ltd.'`, `company_phone='+91 11 4155 6447'`, `company_email='info@panyaglobal.in'`, `company_website='www.panyaglobal.in'`, `company_address='New Delhi, India'`, and GST/bank/prefix keys. This is **NOT** a structured company table — Phase 1 must create `company_settings` as a proper **singleton row** table holding logo URL, ISO/IFCCA tagline, UPI ID, etc.

### 2.2 Backend (current state in `public_html/api/`)

**`config.php` lines 96–121** is dual-driver aware: `DB_DRIVER` env var chooses pgsql vs mysql, builds DSN accordingly, sets timezone via `SET time_zone='+05:30'` (MySQL) or `SET TIME ZONE 'Asia/Kolkata'` (PostgreSQL). PDO is set to `ERRMODE_EXCEPTION`, `FETCH_ASSOC`, `EMULATE_PREPARES=false`. **Phase 1 must use only PDO features that work identically on both engines** to preserve this abstraction.

**`helpers.php`** provides `jsonResponse()`, `sanitizeInput()`, `getInput()`, `rateLimit()`, `logActivity()`, `sendEmail()`. All Phase 1 endpoints should reuse these.

**`admin-guard.php` lines 22–28**: requires `$_SESSION['admin_id']` (with JWT fallback). Line 44 exposes `requireRole(...$roles)`. Line 54 exposes `requirePermission(...$perms)`. Settings endpoints must call `requireRole('owner', 'super_admin')` (matches existing `settings.php` line 12 pattern).

**`quotations.php` (244 lines) — HAS PROBLEMS we must not perpetuate:**
- Line 39–48: tries to read `is_move_date_confirmed`, `lift_origin`, `lift_destination`, `lift_type`, `car_declared_value`, `car_insurance_percentage`, `gst_type`, `inclusions`, `exclusions` from a row but the columns don't exist → returns NULL today, would error if `PDO::ERRMODE_EXCEPTION` were stricter
- Line 79, 169: **RACE CONDITION** — `SELECT COUNT(*)` then `+1` to generate `INV-` and `QTN-` numbers. Two concurrent inserts get the same number.
- Line 79: invoice number is `INV-YEAR-COUNT` (total invoice count, not year-scoped) — needs same year-scoping fix
- Line 169: quotation number is `QTN-YEAR-COUNT` (not `QT-` as spec requires)
- Line 80–135: `convert` action inlines the financial calculation but it doesn't use proportional-discount-to-taxable logic (spec API-11 wants discount to apply BEFORE GST)
- All action endpoints in one file (`?action=send`, `?action=convert`, `?action=create`) — should be split per Phase 2

**`settings.php` (87 lines) — HAS A BUG:**
- Line 64 uses PostgreSQL `ON CONFLICT (setting_key) DO UPDATE SET ...` syntax
- This **fails on MySQL** (the actual deployed engine) — `ON CONFLICT` is not valid SQL in MySQL
- The right MySQL syntax is `INSERT ... ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`
- **This is one of the latent issues the Phase 1 settings CRUD API must NOT inherit** — we will write the new endpoints with correct MySQL syntax (and use the `$driver` check pattern from `config.php` to branch if PostgreSQL is ever re-enabled)

### 2.3 Frontend (current state in `src/components/admin/crm/`)

**`QuotationBuilder.tsx` (1334 lines)** has hardcoded `DEFAULT_TERMS` at lines 102–105:
```
1. Payment is due within 7 days of invoice date.
2. Goods are insured only if explicitly stated in writing.
3. This quotation is valid for 15 days from the date of issue.
4. Prices are subject to change if survey reveals additional items.
```
This is the user's #1 pain point — Phase 4 PAGE-03/04 will replace this with DB-driven loading.

**`QuotationPDFTemplate.tsx` (373 lines)** has hardcoded T&C at lines 338–342 (5 items, used in rendered PDF):
```
• Quote is valid for 15 days from the date of issue.
• Packing materials will be taken back on the same day.
• Mathadi/Union/Local labor charges are not included.
• 100% payment must be cleared before unloading of goods.
• Taxes will be levied as per government norms.
```
PDF also hardcodes bank at lines 327–330: "HDFC Bank / Panya Global Relocations / 5020000XXXXXXX / HDFC000XXXX". Phase 1 must seed all of this into DB.

**PDF uses `data.is_move_date_confirmed`, `data.lift_origin/destination`, `data.lift_type`, `data.insurance_amount`, `data.car_insurance_amount`** (lines 173, 202, 203) — the database currently can't hold any of these. After Phase 1 ALTER, they will be persistable.

### 2.4 No test framework exists

Confirmed: no `composer.json`, no `phpunit.xml`, no `vitest.config.ts`, no `jest.config.js` in project root. Phase 1 validation is **manual + ad-hoc PHP CLI scripts** (see §7).

---

## 3. Database Schema

All DDL below is **MySQL 5.7+ / 8.0 compatible** and **idempotent** (safe to re-run). File path: `sql/quotation_v2_foundation.sql`.

### 3.1 ALTER existing `crm_quotations`

```sql
-- sql/quotation_v2_foundation.sql
USE panyaglobal_db;

-- ─── 0. Extend crm_quotations for v2 ──────────────────────────
ALTER TABLE crm_quotations
  ADD COLUMN IF NOT EXISTS parent_quotation_id INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS quotation_family_id VARCHAR(30) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS default_validity_days INT NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS gst_type ENUM('cgst_sgst','igst','exempt') DEFAULT 'cgst_sgst',
  ADD COLUMN IF NOT EXISTS is_move_date_confirmed TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lift_origin TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lift_origin_type VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lift_destination TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lift_destination_type VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lift_type VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS car_declared_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS car_insurance_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inclusions JSON DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS exclusions JSON DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_schedule TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS revision_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP NULL DEFAULT NULL,            -- idempotent guard
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP NULL DEFAULT NULL,        -- idempotent guard
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP NULL DEFAULT NULL,        -- idempotent guard
  ADD CONSTRAINT fk_quot_parent FOREIGN KEY IF NOT EXISTS (parent_quotation_id) 
      REFERENCES crm_quotations(id) ON DELETE SET NULL,
  ADD UNIQUE INDEX IF NOT EXISTS uq_quot_family_version (quotation_family_id, version),
  ADD INDEX IF NOT EXISTS idx_quot_family (quotation_family_id),
  ADD INDEX IF NOT EXISTS idx_quot_parent (parent_quotation_id);

-- ─── 1. Extend crm_quotation_line_items ───────────────────────
ALTER TABLE crm_quotation_line_items
  ADD INDEX IF NOT EXISTS idx_qli_quotation (quotation_id);
```

**Note on `ADD COLUMN IF NOT EXISTS`:** This is MySQL 8.0+ syntax. For MySQL 5.7 compatibility, wrap each in a `SELECT IF EXISTS` information_schema check (one-shot PHP migration runner is cleaner — see §6 plan). **Recommendation:** ship a `public_html/sql/run-foundation-migration.php` PHP runner that idempotently checks each column/index before adding — works on any MySQL version.

### 3.2 New table: `company_settings` (singleton row, id=1)

```sql
CREATE TABLE IF NOT EXISTS company_settings (
    id TINYINT NOT NULL DEFAULT 1,
    company_name        VARCHAR(255) NOT NULL DEFAULT 'Panya Global Relocation Pvt. Ltd.',
    company_tagline     VARCHAR(255) DEFAULT NULL,
    iso_ifcca_strip     VARCHAR(255) DEFAULT NULL,        -- "ISO 9001:2015 | IFCCA Member"
    address_line1       VARCHAR(255) DEFAULT NULL,
    address_line2       VARCHAR(255) DEFAULT NULL,
    city                VARCHAR(100) DEFAULT NULL,
    state               VARCHAR(100) DEFAULT NULL,
    pincode             VARCHAR(10)  DEFAULT NULL,
    country             VARCHAR(100) NOT NULL DEFAULT 'India',
    phone               VARCHAR(20)  DEFAULT NULL,
    alt_phone           VARCHAR(20)  DEFAULT NULL,
    email               VARCHAR(255) DEFAULT NULL,
    website             VARCHAR(255) DEFAULT NULL,
    gstin               VARCHAR(20)  DEFAULT NULL,
    pan                 VARCHAR(20)  DEFAULT NULL,
    bank_name           VARCHAR(255) DEFAULT NULL,
    bank_account_name   VARCHAR(255) DEFAULT NULL,
    bank_account_number VARCHAR(50)  DEFAULT NULL,
    bank_ifsc           VARCHAR(20)  DEFAULT NULL,
    bank_branch         VARCHAR(255) DEFAULT NULL,
    upi_id              VARCHAR(100) DEFAULT NULL,
    logo_url            VARCHAR(500) DEFAULT '/assets/logo-black.png',
    logo_white_url      VARCHAR(500) DEFAULT '/assets/logo-white.png',
    default_cgst_rate   DECIMAL(5,2) NOT NULL DEFAULT 9.00,
    default_sgst_rate   DECIMAL(5,2) NOT NULL DEFAULT 9.00,
    default_igst_rate   DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    default_validity_days INT NOT NULL DEFAULT 15,
    invoice_footer_text TEXT DEFAULT NULL,
    facebook_url        VARCHAR(255) DEFAULT NULL,
    instagram_url       VARCHAR(255) DEFAULT NULL,
    linkedin_url        VARCHAR(255) DEFAULT NULL,
    twitter_url         VARCHAR(255) DEFAULT NULL,
    youtube_url         VARCHAR(255) DEFAULT NULL,
    updated_by          INT DEFAULT NULL,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT chk_company_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

`id TINYINT` with `CHECK (id=1)` is a soft singleton — easier than ENUM tricks, leaves door open for multi-tenant later by dropping the CHECK.

### 3.3 New table: `tc_templates` (DB-01/SET-02)

```sql
CREATE TABLE IF NOT EXISTS tc_templates (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(100) NOT NULL UNIQUE,         -- 'standard-15-day', 'corporate-30-day', etc.
    title           VARCHAR(255) NOT NULL,                -- 'Standard T&C (15-day validity)'
    body_text       TEXT NOT NULL,                        -- newline-separated bullet list OR JSON array — see §5
    item_count      INT NOT NULL DEFAULT 0,               -- denormalised count for fast UI
    version         INT NOT NULL DEFAULT 1,               -- bumped on each PUT (not strictly required, audit trail)
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    is_default      TINYINT(1) NOT NULL DEFAULT 0,        -- exactly one row may have is_default=1 (enforced in app)
    sort_order      INT NOT NULL DEFAULT 0,
    created_by      INT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by      INT DEFAULT NULL,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tc_active (is_active),
    INDEX idx_tc_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Storage format decision:** store `body_text` as a single TEXT with `\n`-separated items. The PDF template (Phase 5) will split on `\n` and render as a numbered list. JSON was considered but adds complexity for a simple "list of strings" structure. If structured per-item metadata is needed later, migrate to a separate `tc_template_items` table.

### 3.4 New table: `include_templates` (SET-03)

```sql
CREATE TABLE IF NOT EXISTS include_templates (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    label           VARCHAR(500) NOT NULL,                -- "Packing & unpacking of household goods"
    category        VARCHAR(50)  DEFAULT 'standard',      -- 'standard' | 'household' | 'commercial' | 'vehicle' | 'pet'
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    sort_order      INT NOT NULL DEFAULT 0,
    created_by      INT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by      INT DEFAULT NULL,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_inc_active (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.5 New table: `exclude_templates` (SET-04)

```sql
CREATE TABLE IF NOT EXISTS exclude_templates (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    label           VARCHAR(500) NOT NULL,
    category        VARCHAR(50)  DEFAULT 'standard',
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    sort_order      INT NOT NULL DEFAULT 0,
    created_by      INT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by      INT DEFAULT NULL,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_exc_active (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.6 New table: `payment_schedule_templates` (SET-05)

```sql
CREATE TABLE IF NOT EXISTS payment_schedule_templates (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(100) NOT NULL UNIQUE,         -- '50-50', '100-advance', '30-70', 'milestone'
    label           VARCHAR(255) NOT NULL,                -- "50% Advance + 50% Before Unloading"
    schedule_text   TEXT NOT NULL,                        -- Human-readable: "50% advance before packing, 50% before unloading"
    schedule_json   JSON DEFAULT NULL,                    -- Structured: [{"label":"Advance","percent":50,"trigger":"before_packing"}, ...]
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    is_default      TINYINT(1) NOT NULL DEFAULT 0,
    sort_order      INT NOT NULL DEFAULT 0,
    created_by      INT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by      INT DEFAULT NULL,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ps_active (is_active, sort_order)
) ENGINE=InnoDB DEFAULT DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

`schedule_json` is optional Phase 3 enhancement (UI-01/02 may want to render schedule as structured chips). For Phase 1, `schedule_text` is enough.

### 3.7 Indexes to ensure (DB-03)

Already on `crm_quotations`: `idx_quot_case (case_id)`, `idx_quot_status (status)`. New ones from §3.1: `idx_quot_family`, `idx_quot_parent`, `uq_quot_family_version`. On `crm_quotation_line_items`: `idx_qli_quotation (quotation_id)` (currently MISSING — Phase 1 adds it).

### 3.8 Summary of net-new vs altered objects

| Object | Type | Action | Requirements |
|--------|------|--------|--------------|
| `crm_quotations` (ALTER) | table | Add 18 columns + 3 indexes + 1 FK | DB-01, DB-05, DB-06, UI-01..09 fields |
| `crm_quotation_line_items` (ALTER) | table | Add 1 index on `quotation_id` | DB-02, DB-03 |
| `company_settings` | new table | Create | SET-01 |
| `tc_templates` | new table | Create | SET-02 |
| `include_templates` | new table | Create | SET-03 |
| `exclude_templates` | new table | Create | SET-04 |
| `payment_schedule_templates` | new table | Create | SET-05 |
| (default validity/gst rates) | columns in `company_settings` | already in CREATE | SET-06 |

---

## 4. Numbering Function

### 4.1 Implementation (PHP, MySQL+PDO, race-condition safe)

**Location:** `public_html/api/crm/quotations-v2/lib/numbering.php`

```php
<?php
// public_html/api/crm/quotations-v2/lib/numbering.php

/**
 * Generate a unique, year-scoped quotation number: QT-2026-0001
 * 
 * Race-condition strategy: 
 *   1. Acquire a row-level lock on a `quotation_counters` table via SELECT ... FOR UPDATE
 *   2. Read current counter for the year (or insert year row with 0)
 *   3. Increment +1
 *   4. Update the counter row
 *   5. Release lock (transaction commit/rollback)
 * 
 * This guarantees no two concurrent requests get the same number,
 * even on MySQL (which has no advisory locks like pg_advisory_lock).
 * 
 * @param PDO $pdo Active PDO connection (caller must not be in a transaction)
 * @return string e.g. "QT-2026-0001"
 */
function generateQuotationNumber(PDO $pdo): string {
    $year = (int) date('Y');
    
    // Atomic counter table — keep it tiny (1 row per year)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS quotation_counters (
            year     SMALLINT NOT NULL PRIMARY KEY,
            next_seq INT      NOT NULL DEFAULT 1
        ) ENGINE=InnoDB
    ");
    
    // Must NOT be in a transaction when calling this — begin fresh
    $pdo->beginTransaction();
    try {
        // INSERT IGNORE is safe and atomic in MySQL
        $pdo->prepare("INSERT IGNORE INTO quotation_counters (year, next_seq) VALUES (:y, 1)")
            ->execute([':y' => $year]);
        
        // SELECT FOR UPDATE — row-level lock, only this transaction can read+write
        $stmt = $pdo->prepare("SELECT next_seq FROM quotation_counters WHERE year = :y FOR UPDATE");
        $stmt->execute([':y' => $year]);
        $seq = (int) $stmt->fetchColumn();
        
        if ($seq < 1) {
            // row was deleted concurrently — reinsert
            $pdo->prepare("INSERT IGNORE INTO quotation_counters (year, next_seq) VALUES (:y, 1)")
                ->execute([':y' => $year]);
            $stmt->execute([':y' => $year]);
            $seq = (int) $stmt->fetchColumn();
        }
        
        $pdo->prepare("UPDATE quotation_counters SET next_seq = next_seq + 1 WHERE year = :y")
            ->execute([':y' => $year]);
        
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    
    return sprintf('QT-%d-%04d', $year, $seq);
}
```

### 4.2 Why this works (race-condition analysis)

The naive `SELECT COUNT(*)+1` pattern in `quotations.php:79,169` has TOCTOU — between the count and the insert, another request can run the same count. Concurrent inserts → duplicate numbers → UNIQUE constraint violation.

`SELECT ... FOR UPDATE` inside a transaction acquires a row-level X-lock on the `quotation_counters` row. Concurrent transactions that try the same SELECT block until the first commits. When they unblock, they read the freshly incremented `next_seq`. No duplicates possible. The `INSERT IGNORE` is a defensive upsert in case the year row doesn't exist yet (year 2027 first request).

### 4.3 Companion function for invoice numbering (Phase 2 prep)

The existing `quotations.php:79` has the same bug for invoices. Add `generateInvoiceNumber(PDO $pdo): string` in the same file using the same pattern. Phase 1 should ship the helper; Phase 2 will wire it into `convert-to-invoice.php`.

### 4.4 Test invocation (ad-hoc, no PHPUnit)

```bash
# Requires PHP CLI + project DB env
php -r '
  require "public_html/api/config.php";
  require "public_html/api/crm/quotations-v2/lib/numbering.php";
  for ($i=0; $i<3; $i++) {
    echo generateQuotationNumber($pdo) . "\n";
  }
'
# Expected: QT-2026-0001, QT-2026-0002, QT-2026-0003
```

---

## 5. Settings API Contract

All endpoints live under `public_html/api/crm/quotations-v2/settings/`. All use `require_once __DIR__ . '/../../../../api/admin-guard.php'` and call `requireRole('owner', 'super_admin')` for write methods.

### 5.1 `GET /api/crm/quotations-v2/settings/company.php`

**Purpose:** Return the singleton `company_settings` row. Always returns the single row (id=1), auto-creating it on first read with defaults from `crm_app_settings` if it doesn't exist.

**Auth:** admin-guard only (any authenticated admin can read).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "company": {
      "id": 1,
      "company_name": "Panya Global Relocation Pvt. Ltd.",
      "company_tagline": "Your Trusted Relocation Partner",
      "iso_ifcca_strip": "ISO 9001:2015 Certified | IFCCA Member",
      "address_line1": "18/1, Basement, Village Samalkha",
      "address_line2": "Old Delhi Gurgaon Road",
      "city": "New Delhi",
      "state": "Delhi",
      "pincode": "110037",
      "country": "India",
      "phone": "+91 11 4155 6447",
      "alt_phone": "+91 8800 446 447",
      "email": "info@panyaglobal.in",
      "website": "www.panyaglobal.in",
      "gstin": "07AAHCP1234E1Z5",
      "pan": "AAHCP1234E",
      "bank_name": "HDFC Bank",
      "bank_account_name": "Panya Global Relocations",
      "bank_account_number": "50200001234567",
      "bank_ifsc": "HDFC0001234",
      "bank_branch": "New Delhi Main Branch",
      "upi_id": "info@panyaglobal.in@hdfcbank",
      "logo_url": "/assets/logo-black.png",
      "logo_white_url": "/assets/logo-white.png",
      "default_cgst_rate": 9.00,
      "default_sgst_rate": 9.00,
      "default_igst_rate": 18.00,
      "default_validity_days": 15,
      "invoice_footer_text": "Thank you for choosing Panya Global Relocation.",
      "facebook_url": "https://www.facebook.com/panyaglobalmovers",
      "instagram_url": "https://www.instagram.com/panyaglobalmovers",
      "linkedin_url": "https://www.linkedin.com/company/panya-global-relocation",
      "twitter_url": null,
      "youtube_url": null,
      "updated_by": 1,
      "updated_at": "2026-06-02 11:50:00"
    }
  }
}
```

### 5.2 `PUT /api/crm/quotations-v2/settings/company.php`

**Purpose:** Update the singleton row. All fields optional in payload (partial update via PATCH-style semantics on PUT).

**Auth:** `requireRole('owner', 'super_admin')`.

**Request body** (any subset):
```json
{
  "company": {
    "company_name": "Panya Global Relocation Pvt. Ltd.",
    "phone": "+91 11 4155 6447",
    "email": "info@panyaglobal.in",
    "website": "www.panyaglobal.in",
    "gstin": "07AAHCP1234E1Z5",
    "pan": "AAHCP1234E",
    "bank_account_number": "50200001234567",
    "bank_ifsc": "HDFC0001234",
    "upi_id": "info@panyaglobal.in@hdfcbank",
    "logo_url": "/assets/logo-black.png",
    "default_validity_days": 15,
    "default_cgst_rate": 9.00,
    "default_sgst_rate": 9.00,
    "default_igst_rate": 18.00
  }
}
```

**Validation rules:**
- `phone` regex `/^\+?[0-9\s\-]{7,20}$/`
- `email` filter_var FILTER_VALIDATE_EMAIL
- `gstin` regex `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`
- `pan` regex `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/`
- `logo_url` filter_var FILTER_VALIDATE_URL OR allow `/assets/...` (leading slash) — adjust `sanitizeInput` to allow relative paths
- `default_*_rate` range 0.00–100.00
- `default_validity_days` range 1–365

**Response 200:** Same shape as GET (§5.1) with updated row.

### 5.3 `GET /api/crm/quotations-v2/settings/templates.php?type=tc`

**Path:** `settings/templates.php` (not `:type` in path — using query string is more compatible with cheap PHP routing and matches existing `?action=...` pattern in `quotations.php`).

**Query params:** `type` ∈ {`tc`, `include`, `exclude`, `payment`}. Optional `active=1` to filter only active items. Optional `include_inactive=1` to include disabled items (admin view).

**Auth:** admin-guard only.

**Response 200 (type=tc):**
```json
{
  "success": true,
  "data": {
    "type": "tc",
    "templates": [
      {
        "id": 1,
        "slug": "standard-15-day",
        "title": "Standard T&C (15-day validity)",
        "body_text": "Quote is valid for 15 days from the date of issue.\nPacking materials will be taken back on the same day.\nMathadi/Union/Local labor charges are not included.\n100% payment must be cleared before unloading of goods.\nTaxes will be levied as per government norms.",
        "item_count": 5,
        "version": 1,
        "is_active": 1,
        "is_default": 1,
        "sort_order": 0,
        "updated_at": "2026-06-02 11:50:00"
      }
    ]
  }
}
```

**Response 200 (type=include):**
```json
{
  "success": true,
  "data": {
    "type": "include",
    "items": [
      { "id": 1, "label": "Packing & unpacking of household goods", "category": "household", "is_active": 1, "sort_order": 0 },
      { "id": 2, "label": "Loading and unloading at both ends", "category": "household", "is_active": 1, "sort_order": 1 }
    ]
  }
}
```

**Note on shape difference:** T&C is a "template" with multi-line body; include/exclude/payment are individual "items" the admin can toggle. The GET response uses `templates` for tc and `items` for the others. Payment is `templates` (has slug + schedule_text + schedule_json).

### 5.4 `POST /api/crm/quotations-v2/settings/templates.php?type=tc`

**Purpose:** Create new T&C template / include item / exclude item / payment template.

**Auth:** `requireRole('owner', 'super_admin')`.

**Request body (type=tc):**
```json
{
  "slug": "corporate-30-day",
  "title": "Corporate T&C (30-day validity)",
  "body_text": "Quote is valid for 30 days...\nSecond item...",
  "is_default": false,
  "sort_order": 10
}
```

**Request body (type=include):**
```json
{
  "label": "Packing & unpacking of household goods",
  "category": "household",
  "is_active": true,
  "sort_order": 0
}
```

**Response 201:** `{ "success": true, "data": { "id": 6, ... } }`

**Validation:**
- `slug` (where applicable): `^[a-z0-9-]{3,100}$`, must be unique
- `label` (where applicable): min 3 chars, max 500
- `body_text`: min 1 char
- `sort_order`: integer ≥ 0

### 5.5 `PUT /api/crm/quotations-v2/settings/templates.php?type=tc&id=1`

**Purpose:** Update an existing template/item. Path: `templates.php?id=1&type=tc`.

**Auth:** `requireRole('owner', 'super_admin')`.

**Request body:** same shape as POST, all fields optional. Setting `is_default=true` for one row unsets it from any sibling (run in transaction).

**Response 200:** Updated row.

### 5.6 `DELETE /api/crm/quotations-v2/settings/templates.php?type=tc&id=1`

**Purpose:** Soft-delete. Per the user requirement (success criterion #4: "adding a new T&C or disabling an old one requires no code change"), this sets `is_active = 0` and returns 200. The hard-delete option is reserved for a future `?hard=1` flag (admin only, double-confirmed).

**Auth:** `requireRole('owner', 'super_admin')`.

**Response 200:**
```json
{ "success": true, "data": { "id": 1, "is_active": 0, "message": "Template disabled (soft delete)" } }
```

### 5.7 Common error shapes

```json
// 400 Bad Request — validation
{ "success": false, "error": "Invalid slug: must match /^[a-z0-9-]{3,100}$/" }

// 401 Unauthorized
{ "success": false, "error": "Authentication required" }

// 403 Forbidden
{ "success": false, "error": "Insufficient permissions: requires owner or super_admin" }

// 404 Not Found
{ "success": false, "error": "Template not found" }

// 409 Conflict — duplicate slug
{ "success": false, "error": "Slug 'standard-15-day' already exists" }

// 500 Server Error
{ "success": false, "error": "Database error", "detail": "..." /* APP_DEBUG=true only */ }
```

### 5.8 File layout for settings endpoints

```
public_html/api/crm/quotations-v2/
├── settings/
│   ├── company.php          # GET (any admin), PUT (owner/super_admin)
│   └── templates.php        # GET (any admin), POST/PUT/DELETE (owner/super_admin)
├── lib/
│   ├── numbering.php        # generateQuotationNumber()
│   ├── settings_db.php      # shared PDO helpers: getCompany, upsertCompany, listTemplates, etc.
│   └── validation.php       # validateEmail, validatePhone, validateGstin, validatePan
└── tests/
    └── smoke.sh             # bash + curl smoke tests (manual)
```

---

## 6. Default Seed Data

All `INSERT ... ON DUPLICATE KEY UPDATE` so re-running is safe. Source data extracted from `QuotationBuilder.tsx` lines 102–105 (DEFAULT_TERMS) and `QuotationPDFTemplate.tsx` lines 327–342 (PDF T&C and bank).

### 6.1 `company_settings` seed (singleton, id=1)

```sql
-- sql/quotation_v2_seed.sql
USE panyaglobal_db;

INSERT INTO company_settings (
    id, company_name, company_tagline, iso_ifcca_strip,
    address_line1, address_line2, city, state, pincode, country,
    phone, alt_phone, email, website,
    gstin, pan,
    bank_name, bank_account_name, bank_account_number, bank_ifsc, bank_branch,
    upi_id, logo_url, logo_white_url,
    default_cgst_rate, default_sgst_rate, default_igst_rate, default_validity_days,
    invoice_footer_text,
    facebook_url, instagram_url, linkedin_url
) VALUES (
    1,
    'Panya Global Relocation Pvt. Ltd.',
    'Your Trusted Relocation Partner',
    'ISO 9001:2015 Certified | IFCCA Member',
    '18/1, Basement, Village Samalkha',
    'Old Delhi Gurgaon Road',
    'New Delhi', 'Delhi', '110037', 'India',
    '+91 11 4155 6447',
    '+91 8800 446 447',
    'info@panyaglobal.in',
    'www.panyaglobal.in',
    '07AAHCP1234E1Z5',
    'AAHCP1234E',
    'HDFC Bank',
    'Panya Global Relocations',
    '50200001234567',
    'HDFC0001234',
    'New Delhi Main Branch',
    'info@panyaglobal.in@hdfcbank',
    '/assets/logo-black.png',
    '/assets/logo-white.png',
    9.00, 9.00, 18.00, 15,
    'Thank you for choosing Panya Global Relocation.',
    'https://www.facebook.com/panyaglobalmovers',
    'https://www.instagram.com/panyaglobalmovers',
    'https://www.linkedin.com/company/panya-global-relocation'
) ON DUPLICATE KEY UPDATE
    company_name = VALUES(company_name),
    -- intentionally do NOT overwrite values the user has edited since first seed
    -- only update fields that came from the original CRM env but are still in defaults
    updated_at = CURRENT_TIMESTAMP;
```

**Note on `ON DUPLICATE KEY UPDATE`:** this is the MySQL syntax (correct). The `UPDATE` clause here only touches `company_name` and `updated_at` so we don't clobber admin edits. Alternative: use `INSERT IGNORE` to never overwrite — even safer, but doesn't let us fix typos in seeds.

**Note on phone number:** I've used `+91 11 4155 6447` (matches `crm_app_settings.company_phone` seed in `crm_complete_schema.sql:496` and the user-supplied priority). The alternate `+91 8800 446 447` (per email template) is stored as `alt_phone`. Operations team can edit either via UI.

### 6.2 `tc_templates` seed (DEFAULT_T&C from QuotationPDFTemplate lines 338–342)

```sql
INSERT INTO tc_templates (slug, title, body_text, item_count, is_active, is_default, sort_order, created_by) VALUES
('standard-15-day', 'Standard T&C (15-day validity)',
 'Quote is valid for 15 days from the date of issue.
Packing materials will be taken back on the same day.
Mathadi/Union/Local labor charges are not included.
100% payment must be cleared before unloading of goods.
Taxes will be levied as per government norms.',
 5, 1, 1, 0, 1)
ON DUPLICATE KEY UPDATE title=VALUES(title), updated_at=CURRENT_TIMESTAMP;
```

### 6.3 `include_templates` seed (default household inclusions)

These are the typical "what's included" lines for a household relocation (extracted from common Indian packers-and-movers practice and the empty `inclusions` field default in `QuotationBuilder.tsx` line 160):

```sql
INSERT INTO include_templates (label, category, is_active, sort_order, created_by) VALUES
('Loading and unloading at both origin and destination', 'standard',     1, 0, 1),
('Transportation of household goods by closed container truck', 'household', 1, 1, 1),
('Transit insurance as per company policy (basic coverage)', 'household',   1, 2, 1),
('Door-to-door service (no warehouse stop)', 'household',                   1, 3, 1),
('Unpacking at destination on the day of delivery', 'household',             1, 4, 1),
('Arrangement of parking permits at both ends (where required)', 'standard', 1, 5, 1);
```

### 6.4 `exclude_templates` seed (typical exclusions)

```sql
INSERT INTO exclude_templates (label, category, is_active, sort_order, created_by) VALUES
('Octroi / Entry Tax / State entry permits (billed at actuals)', 'standard',    1, 0, 1),
('Mathadi, Union, or Local labor charges (if applicable)',         'standard',    1, 1, 1),
('Staircase / Long-carry charges beyond 30 ft from truck',         'standard',    1, 2, 1),
('Wooden crating for fragile items (billed extra at actuals)',    'household',   1, 3, 1),
('Storage / Warehousing beyond free 7-day window',                 'standard',    1, 4, 1),
('Toll charges (billed at actuals against receipt)',              'standard',    1, 5, 1),
('Shifting of heavy items above 200 kg (e.g. safes, pianos)',     'household',   1, 6, 1),
('Disconnection / reconnection of appliances and electronics',    'household',   1, 7, 1),
('Handyman / carpenter / electrician / pest control services',     'household',   1, 8, 1),
('Any service not explicitly mentioned in the inclusions above', 'standard',    1, 9, 1);
```

### 6.5 `payment_schedule_templates` seed

```sql
INSERT INTO payment_schedule_templates (slug, label, schedule_text, schedule_json, is_active, is_default, sort_order, created_by) VALUES
('50-50-standard', '50% Advance + 50% Before Unloading',
 '50% advance before packing, balance 50% before unloading of goods at destination.',
 JSON_ARRAY(
    JSON_OBJECT('label','Advance','percent',50,'trigger','before_packing'),
    JSON_OBJECT('label','Balance','percent',50,'trigger','before_unloading')
 ),
 1, 1, 0, 1),
('100-advance', '100% Advance',
 '100% advance payment before packing.',
 JSON_ARRAY(JSON_OBJECT('label','Full Advance','percent',100,'trigger','before_packing')),
 1, 0, 1, 1),
('30-70-split', '30% Booking + 70% Before Delivery',
 '30% advance at booking, 70% balance before unloading of goods at destination.',
 JSON_ARRAY(
    JSON_OBJECT('label','Booking','percent',30,'trigger','at_booking'),
    JSON_OBJECT('label','Balance','percent',70,'trigger','before_unloading')
 ),
 1, 0, 2, 1),
('milestone-4', '25% / 25% / 25% / 25% Milestone',
 '25% at booking, 25% at loading, 25% at transit midpoint (if applicable), 25% at delivery.',
 JSON_ARRAY(
    JSON_OBJECT('label','Booking','percent',25,'trigger','at_booking'),
    JSON_OBJECT('label','Loading','percent',25,'trigger','at_loading'),
    JSON_OBJECT('label','Transit','percent',25,'trigger','mid_transit'),
    JSON_OBJECT('label','Delivery','percent',25,'trigger','at_delivery')
 ),
 1, 0, 3, 1);
```

### 6.6 Migration runner

```php
<?php
// public_html/sql/run-foundation-migration.php
// Idempotent: safe to run multiple times. Run from CLI:
//   php public_html/sql/run-foundation-migration.php

require_once __DIR__ . '/../api/config.php';

$sqlFile = __DIR__ . '/../../sql/quotation_v2_foundation.sql';
$seedFile = __DIR__ . '/../../sql/quotation_v2_seed.sql';

function runSqlFile(PDO $pdo, string $path): void {
    if (!file_exists($path)) {
        fwrite(STDERR, "File not found: $path\n");
        exit(1);
    }
    $sql = file_get_contents($path);
    // Split on ; (simple — assumes no ;-containing strings; safe for our DDL)
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    foreach ($statements as $stmt) {
        if (str_starts_with($stmt, '--') || $stmt === '') continue;
        try {
            $pdo->exec($stmt);
            echo "OK: " . substr($stmt, 0, 60) . "...\n";
        } catch (PDOException $e) {
            // Idempotent: ignore "already exists" / "duplicate column" errors
            $msg = $e->getMessage();
            if (preg_match('/already exists|duplicate column|Duplicate entry/i', $msg)) {
                echo "SKIP (idempotent): " . substr($stmt, 0, 60) . "...\n";
            } else {
                fwrite(STDERR, "FAIL: $stmt\n  -> $msg\n");
                exit(1);
            }
        }
    }
}

echo "Running foundation migration...\n";
runSqlFile($pdo, $sqlFile);
echo "\nRunning seed data...\n";
runSqlFile($pdo, $seedFile);
echo "\nDone.\n";
```

**Caution for `ADD COLUMN IF NOT EXISTS` on MySQL 5.7:** MySQL 5.7 doesn't support `IF NOT EXISTS` on `ADD COLUMN`. Either:
- **Option A (recommended):** Require MySQL 8.0+ (it has been GA since April 2018; verify version with `SELECT VERSION()` first)
- **Option B:** Use information_schema check pattern:
  ```sql
  SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA='panyaglobal_db' AND TABLE_NAME='crm_quotations' 
     AND COLUMN_NAME='parent_quotation_id')=0,
    'ALTER TABLE crm_quotations ADD COLUMN parent_quotation_id INT DEFAULT NULL',
    'SELECT "column exists"'
  ));
  PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
  ```

The runner PHP script above sidesteps this by using a `try/catch` and skipping "duplicate column" errors. **Recommendation:** Use the PHP runner — it's portable, logged, and shows clear per-statement output.

---

## 7. Validation Architecture (Nyquist)

This project has **no test framework** (no `composer.json`, no `vitest.config`, no `jest.config`, no `phpunit.xml` — confirmed by directory listing). Nyquist validation therefore consists of **manual verification commands + a smoke-test bash script** that can be re-run after every migration to catch regressions within seconds.

### 7.1 Test framework

| Property | Value |
|----------|-------|
| Framework | None (manual + bash + PHP CLI smoke tests) |
| Config file | `public_html/api/crm/quotations-v2/tests/smoke.sh` |
| Quick run command | `bash public_html/api/crm/quotations-v2/tests/smoke.sh` |
| Full suite command | `bash public_html/api/crm/quotations-v2/tests/smoke.sh --full` |
| Estimated runtime | ~3–5 seconds (full suite) |

### 7.2 Phase requirements → verification map

| Req ID | Behavior | Verify via | Command | Wave 0 |
|--------|----------|-----------|---------|--------|
| DB-01 | `crm_quotations` has all required columns | MySQL `DESCRIBE` | `mysql -uroot panyaglobal_db -e "DESCRIBE crm_quotations;" \| grep parent_quotation_id` | ❌ gap — must run migration first |
| DB-02 | `crm_quotation_line_items` linked via FK CASCADE | `SHOW CREATE TABLE` | `mysql -uroot panyaglobal_db -e "SHOW CREATE TABLE crm_quotation_line_items\G" \| grep CASCADE` | ❌ already exists in v1, verify still present |
| DB-03 | Indexes on case_id, status, quotation_id | `SHOW INDEX` | `mysql -uroot panyaglobal_db -e "SHOW INDEX FROM crm_quotation_line_items;"` | ❌ idx_qli_quotation must be added in §3.1 |
| DB-04 | `generateQuotationNumber($pdo)` returns `QT-2026-XXXX`, year-scoped, race-safe | PHP CLI loop | `php -r 'require "..."; for(\$i=0;\$i<5;\$i++) echo generateQuotationNumber(\$pdo)."\n";'` | ❌ Wave 0 — write the function first |
| DB-05 | `parent_quotation_id` column exists, FK self-references | `DESCRIBE` | `mysql ... -e "DESCRIBE crm_quotations;" \| grep parent_quotation_id` | ❌ added in §3.1 |
| DB-06 | `quotation_family_id` + `version` allow shared family_id with different version | smoke test | insert two rows with same `family_id` and `version=1,2`; check both succeed | ❌ added in §3.1 |
| SET-01 | `company_settings` row exists, logo URL queryable | API | `curl -b cookies.txt /api/crm/quotations-v2/settings/company.php` | ❌ Wave 0 — table + endpoint + seed |
| SET-02 | T&C templates stored as DB rows with `is_active` | API | `curl .../settings/templates.php?type=tc` returns 1+ rows | ❌ Wave 0 |
| SET-03 | Include templates in DB | API | `curl .../settings/templates.php?type=include` | ❌ Wave 0 |
| SET-04 | Exclude templates in DB | API | `curl .../settings/templates.php?type=exclude` | ❌ Wave 0 |
| SET-05 | Payment schedule templates in DB | API | `curl .../settings/templates.php?type=payment` | ❌ Wave 0 |
| SET-06 | Default validity days + GST rates in `company_settings.default_*` | API | check JSON has `default_validity_days`, `default_cgst_rate`, etc. | ❌ Wave 0 |
| SET-07 | Settings CRUD: create/list/update/delete works for an authenticated admin | smoke test | login → POST → GET → PUT → DELETE → verify soft-deleted | ❌ Wave 0 |

### 7.3 Nyquist sampling rate

- **Minimum sample interval:** After every committed task → run:
  ```bash
  bash public_html/api/crm/quotations-v2/tests/smoke.sh
  ```
- **Full suite trigger:** Before merging the final task of any plan wave.
- **Phase-complete gate:** Full suite green + every row in §7.2 verified green before `/gsd-verify-work` runs.
- **Estimated feedback latency per task:** ~3 seconds (1s migration + 2s curl/DB checks).

### 7.4 Wave 0 gaps (must be created before any plan task starts)

- [ ] `public_html/api/crm/quotations-v2/lib/numbering.php` — `generateQuotationNumber()` function
- [ ] `public_html/api/crm/quotations-v2/lib/settings_db.php` — PDO helpers (getCompany, upsertCompany, listTemplates, etc.)
- [ ] `public_html/api/crm/quotations-v2/lib/validation.php` — email/phone/GSTIN/PAN validators
- [ ] `public_html/api/crm/quotations-v2/settings/company.php` — GET + PUT
- [ ] `public_html/api/crm/quotations-v2/settings/templates.php` — GET + POST + PUT + DELETE
- [ ] `public_html/api/crm/quotations-v2/tests/smoke.sh` — bash smoke test
- [ ] `sql/quotation_v2_foundation.sql` — schema migration
- [ ] `sql/quotation_v2_seed.sql` — default data
- [ ] `public_html/sql/run-foundation-migration.php` — migration runner

### 7.5 Smoke test script (template, not exhaustive)

```bash
#!/usr/bin/env bash
# public_html/api/crm/quotations-v2/tests/smoke.sh
# Run from project root: bash public_html/api/crm/quotations-v2/tests/smoke.sh
set -euo pipefail
BASE="${BASE:-http://localhost:8080}"
COOKIES="${COOKIES:-/tmp/panya-smoke-cookies.txt}"
ADMIN_USER="${ADMIN_USER:-admin@panyaglobal.in}"
ADMIN_PASS="${ADMIN_PASS:-admin123}"

pass() { echo -e "\033[32m PASS\033[0m $1"; }
fail() { echo -e "\033[31m FAIL\033[0m $1"; exit 1; }

echo "== Foundation Smoke Tests =="

# 1. Login as owner
curl -s -c "$COOKIES" -X POST "$BASE/api/admin-login.php" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" | grep -q '"success":true' \
  && pass "Admin login" || fail "Admin login"

# 2. GET company settings
curl -s -b "$COOKIES" "$BASE/api/crm/quotations-v2/settings/company.php" \
  | grep -q '"logo_url"' \
  && pass "GET company settings returns logo_url" \
  || fail "GET company settings"

# 3. GET tc templates
curl -s -b "$COOKIES" "$BASE/api/crm/quotations-v2/settings/templates.php?type=tc" \
  | grep -q '"standard-15-day"' \
  && pass "GET tc templates includes seed" \
  || fail "GET tc templates"

# 4. POST new tc template
NEW_ID=$(curl -s -b "$COOKIES" -X POST "$BASE/api/crm/quotations-v2/settings/templates.php?type=tc" \
  -H "Content-Type: application/json" \
  -d '{"slug":"smoke-test","title":"Smoke Test TC","body_text":"Test item 1\nTest item 2"}' \
  | grep -oE '"id":[0-9]+' | head -1 | grep -oE '[0-9]+')
[[ -n "$NEW_ID" ]] && pass "POST tc template (id=$NEW_ID)" || fail "POST tc template"

# 5. PUT to update it
curl -s -b "$COOKIES" -X PUT "$BASE/api/crm/quotations-v2/settings/templates.php?type=tc&id=$NEW_ID" \
  -H "Content-Type: application/json" \
  -d '{"title":"Smoke Test TC (updated)"}' | grep -q 'updated' \
  && pass "PUT tc template" || fail "PUT tc template"

# 6. DELETE (soft) it
curl -s -b "$COOKIES" -X DELETE "$BASE/api/crm/quotations-v2/settings/templates.php?type=tc&id=$NEW_ID" \
  | grep -q '"is_active":0' \
  && pass "DELETE tc template (soft)" || fail "DELETE tc template"

# 7. Numbering race test
NUMS=$(php -r '
  require "public_html/api/config.php";
  require "public_html/api/crm/quotations-v2/lib/numbering.php";
  $results = [];
  for ($i=0; $i<10; $i++) $results[] = generateQuotationNumber($pdo);
  echo implode("\n", $results);
')
UNIQ=$(echo "$NUMS" | sort -u | wc -l)
[[ "$UNIQ" -eq 10 ]] && pass "Numbering: 10 unique numbers from concurrent loop" \
  || fail "Numbering produced duplicates: $NUMS"

# 8. Format check
echo "$NUMS" | grep -qE '^QT-[0-9]{4}-[0-9]{4}$' \
  && pass "Numbering format QT-YYYY-XXXX" \
  || fail "Numbering format wrong: $NUMS"

# 9. Schema sanity
mysql -uroot panyaglobal_db -N -e "
  SELECT COUNT(*) FROM information_schema.columns 
  WHERE table_schema='panyaglobal_db' AND table_name='crm_quotations' 
  AND column_name IN ('parent_quotation_id','version','quotation_family_id','gst_type','is_move_date_confirmed','lift_origin','lift_destination','car_declared_value','inclusions','exclusions','payment_schedule');
" | grep -q '^11$' && pass "All 11 new crm_quotations columns present" || fail "Missing columns"

mysql -uroot panyaglobal_db -N -e "
  SELECT COUNT(*) FROM information_schema.statistics 
  WHERE table_schema='panyaglobal_db' AND table_name='crm_quotation_line_items' 
  AND column_name='quotation_id';
" | grep -qE '^[1-9]' && pass "idx_qli_quotation exists" || fail "Missing line_items index"

echo ""
echo "== ALL SMOKE TESTS PASSED =="
```

---

## 8. Risks & Open Questions

### 8.1 **Database engine ambiguity (HIGH IMPACT)**

The PRD header on line 5 says `Stack: React + Vite + TypeScript + PHP + PostgreSQL + jsPDF`. The State.md and Roadmap both note "Spec uses PostgreSQL functions (`pg_query_params`); existing project uses PDO." However, the **actual deployed `public_html/api/.env` line 4 says `DB_DRIVER=mysql`** and the actual schema file `sql/crm_complete_schema.sql` is MySQL (`ENGINE=InnoDB`, `ENUM`, `TINYINT`). The cases.php file mixes both: `DATE_FORMAT` (MySQL) on line 64 with `ILIKE` (PostgreSQL) on line 51.

**Resolution:** **Phase 1 must write MySQL-compatible DDL and use PDO features that work on both engines** (named placeholders, `JSON` type is fine on both, `INSERT ... ON DUPLICATE KEY UPDATE` is MySQL only — needs branching if PostgreSQL is ever re-enabled, but since the .env says mysql, treat MySQL as the deployment target). Add a code comment on every statement noting the engine dependency.

**Open question for user:** Is there any environment that uses PostgreSQL in production today? If yes, we need to write the migration with both syntaxes (e.g., `CREATE TABLE IF NOT EXISTS` is fine, but `ADD COLUMN IF NOT EXISTS` is MySQL 8.0+ only; `INSERT ON DUPLICATE KEY UPDATE` is MySQL only; use `INSERT ON CONFLICT` for PostgreSQL).

### 8.2 **`quotation_number` UNIQUE constraint vs revision family (MEDIUM IMPACT)**

DB-05 says `parent_quotation_id` for revision chaining. DB-06 says "all versions of same family share the same `quotation_number`". But the existing `crm_quotations.quotation_number` column is `UNIQUE` — you can't have V1, V2, V3 all with the same quotation_number.

**Recommended resolution (proposed in §3.1):** Keep `quotation_number` UNIQUE on the column (printed full number with version suffix like `QT-2026-0001-V1`), add a separate `quotation_family_id` (the bare `QT-2026-0001`) for grouping, and add `UNIQUE(quotation_family_id, version)`. This satisfies DB-05 (parent linkage) and the spirit of DB-06 (queryable family) without violating the UNIQUE constraint.

**Action for planner:** Confirm with user that "share the same quotation_number" means the **family grouping ID** (not the printed string). If user wants the printed string identical across versions, we must drop the UNIQUE constraint — significant change.

### 8.3 **Logo URL — relative vs absolute (LOW IMPACT)**

The existing PDF template (`QuotationPDFTemplate.tsx:116`) uses `src="/logo-black.png"` (root-relative). The seed should use `/assets/logo-black.png` to match the actual file location at `public_html/assets/logo-black.png` (verified to exist, 47,336 bytes). The jsPDF library running in the browser resolves root-relative paths fine, but if the PDF is generated server-side in the future (Phase 5 may explore this), we'll need a public URL or base64 embedding.

### 8.4 **Deprecated old files (LOW IMPACT, but should be addressed in plan)**

The existing `public_html/api/crm/quotations.php` and `src/components/admin/crm/QuotationBuilder.tsx` will be **replaced** by the Phase 2/3 endpoints and `QuotationWizard.tsx`. The plan should include a **cutover task** in a later phase (Phase 2 or 3, not Phase 1) that:
- Switches the frontend's `fetch` URL from `/api/crm/quotations.php` to `/api/crm/quotations-v2/...`
- Marks the old files with `@deprecated` PHPDoc + a banner comment in TSX
- Optionally archives the old files to `public_html/api/crm/_deprecated/`

For Phase 1, just **do not touch the old files** — additive changes only.

### 8.5 **Settings API file location (LOW IMPACT)**

We're putting new endpoints at `public_html/api/crm/quotations-v2/`. This is a clear "v2" namespace that signals cutover intent. Alternative: `public_html/api/crm/quotation_v2/`. The frontend already uses `/api/crm/quotations.php` (PHP's flat-file routing means path = URL), so the new path should be consistent. **Planner decision:** confirm the directory name before writing plan files.

### 8.6 **Authentication scope — `requireRole` vs `requirePermission` (LOW IMPACT)**

`admin-guard.php:79` lists all permissions for super_admin/owner. The permission `settings` is in the list. So `requirePermission('settings')` would also work and is more granular. The existing `settings.php:12` uses `requireRole('owner', 'super_admin')`. For consistency, Phase 1 endpoints should use `requireRole('owner', 'super_admin')` for write methods and **no extra check** for read methods (any authenticated admin can read).

### 8.7 **No test framework, so no automated test feedback (MEDIUM IMPACT)**

Without PHPUnit/Vitest, the smoke test (§7) is the only automated feedback channel. Each task can be validated in ~3 seconds via the smoke script. **Risk:** a human must remember to run the smoke test after each commit. Mitigations:
- Add a git pre-commit hook that runs `bash public_html/api/crm/quotations-v2/tests/smoke.sh` (optional)
- Document the smoke test command prominently in plan files
- Make the smoke test exit-code-only (green = continue, red = stop) for easy mental model

### 8.8 **Phone number inconsistency in existing codebase (LOW IMPACT, ambiguity for seed)**

Three different phones appear in existing code:
- `+91 11 4155 6447` — `crm_app_settings.company_phone` seed and the user's stated priority
- `+91 8800 446 447` — `emailTemplate()` in `helpers.php:223`
- `+91 8800 172802` — `LocationPage-CjkSi9qH.js` (the React component)
- `+91-999999999` — hardcoded placeholder in `QuotationPDFTemplate.tsx:122`

The seed in §6.1 uses `+91 11 4155 6447` (matches user's stated priority and `crm_app_settings` seed). The placeholder `+91-999999999` in the existing PDF must be replaced in Phase 5 (PDF rebuild) with the company_settings value. **Action for planner:** confirm with user which is the canonical "main" phone for new quotations.

### 8.9 **Bank details placeholder (LOW IMPACT)**

`QuotationPDFTemplate.tsx:329–330` has `5020000XXXXXXX` and `HDFC000XXXX` (literal X's, placeholder). The seed in §6.1 uses fake but realistic values `50200001234567` / `HDFC0001234`. The user (operations team) must update these via the settings UI in Phase 4 before going live. **Action for planner:** add a one-time task in Phase 4 cutover to prompt operations to verify bank details.

### 8.10 **JSON column type on both engines (LOW IMPACT)**

`inclusions` and `exclusions` columns in `crm_quotations` are typed as `JSON`. MySQL 5.7+ has `JSON` natively. PostgreSQL has `JSONB` (faster) or `JSON`. The PDO queries will store/retrieve as strings and PHP `json_decode` will parse — both engines work transparently. **No action needed.**

---

## Appendix A: Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Numbering with race protection | `SELECT COUNT(*)+1` pattern | `SELECT ... FOR UPDATE` in transaction with `quotation_counters` table | TOCTOU race causes duplicate numbers under load |
| Input sanitization | Custom string trim/HTML escape | `sanitizeInput($v, $type)` from `public_html/api/helpers.php:25` | Already handles `int`, `email`, `date`, `url`, `string` with proper UTF-8 handling |
| JSON response wrapper | Custom `echo json_encode(...)` | `jsonResponse($success, $data, $error, $code)` from `helpers.php:7` | Sets HTTP code, error logging, consistent shape |
| Admin auth check | Manual `$_SESSION` checks | `require_once admin-guard.php` at top of every endpoint | Handles session, JWT fallback, idle timeout, role helpers |
| Role enforcement | `if ($admin['role'] !== 'owner')` inline | `requireRole('owner', 'super_admin')` from `admin-guard.php:44` | Bakes in super_admin/owner bypass |
| Date formatting in PHP | `date('Y-m-d')` ad-hoc | `date_default_timezone_set('Asia/Kolkata')` is already set in `config.php:31` | Use `date('Y-m-d')` or `new DateTime()` with implicit IST |
| Indian number format | Custom regex formatter | `toLocaleString('en-IN', {minimumFractionDigits: 2, ...})` in JS (existing pattern at `QuotationBuilder.tsx:268`) | Same pattern works in PHP: `number_format($n, 2, '.', ',')` |
| T&C list rendering | Custom text parser | Store as `\n`-separated `body_text`, split in renderer | Simpler than JSON, no escaping issues, easy to edit in textarea UI |

## Appendix B: Common Pitfalls

### Pitfall 1: Forgetting to call `requireRole` on POST/PUT/DELETE
**What goes wrong:** Anyone (even unauthenticated) can hit `POST /settings/templates.php?type=tc` and create T&C rows.
**How to avoid:** Every write endpoint must start with `requireRole('owner', 'super_admin');` immediately after `require_once admin-guard.php`. Add a smoke test that POSTs without a valid session cookie and expects 401/403.

### Pitfall 2: Storing multiple T&C as separate `body_text` rows, losing order
**What goes wrong:** Admin sees 5 T&C items out of order in the PDF.
**How to avoid:** Use a `sort_order INT` column (we have it) and `ORDER BY sort_order, id` in the GET endpoint.

### Pitfall 3: `quotation_counters` table drift on year rollover
**What goes wrong:** 2026 ends with seq=47, 2027 starts with seq=48 instead of 1.
**How to avoid:** The `year` column is the PK, so each year has its own row. The function inserts `INSERT IGNORE` with `next_seq=1` for new years. **Test by manually inserting a 2027 row** in dev.

### Pitfall 4: Hard-delete breaks historical quotations
**What goes wrong:** Admin deletes a T&C template; existing quotations that referenced its body now show 0 items.
**How to avoid:** Per the user spec, DELETE is soft (sets `is_active=0`). The quotation row itself snapshots the `terms_and_conditions` text into its own column (existing `crm_quotations.terms_and_conditions` field — `QuotationBuilder.tsx:46, 153, 209` confirms this), so the quotation is preserved. Phase 1 just needs to ensure the soft-delete doesn't break GET listings.

### Pitfall 5: Logo URL is null after `UPDATE` if admin doesn't supply it
**What goes wrong:** Frontend PDF renders with no logo.
**How to avoid:** Treat logo_url as a "sticky" field — the GET endpoint returns the current value, the PUT only updates fields that are explicitly present in the request body (PHP `array_key_exists` not `isset`).

### Pitfall 6: `is_default` flag for T&C has multiple rows set to true
**What goes wrong:** PDF picks ambiguous T&C.
**How to avoid:** When setting `is_default=true` on row N, run `UPDATE tc_templates SET is_default=0 WHERE is_default=1 AND id != N` in the same transaction. The `INDEX idx_tc_default` makes this O(rows_with_default).

### Pitfall 7: FK self-reference on `parent_quotation_id` requires the column to be NULLABLE
**What goes wrong:** Can't insert the very first quotation (no parent exists).
**How to avoid:** `parent_quotation_id INT DEFAULT NULL` — already specified in §3.1.

### Pitfall 8: JSON column round-trip in MySQL silently re-orders keys
**What goes wrong:** `inclusions: ["a", "b"]` round-trips as `["b", "a"]`.
**How to avoid:** MySQL JSON type re-orders keys for object values (arrays are preserved). Since `inclusions` is an array of strings, this is not an issue. If we ever store objects, document it.

## Appendix C: Metadata

**Confidence breakdown:**
- MySQL DDL & PDO patterns: **HIGH** — based on verified existing `crm_complete_schema.sql`, `config.php`, `helpers.php`, and `.env` (all read directly from project)
- Race-condition numbering: **HIGH** — well-documented `SELECT ... FOR UPDATE` pattern, works on MySQL 5.7+ and PostgreSQL
- Settings API contract: **HIGH** — RESTful shapes mirror existing endpoints in the project (`cases.php`, `settings.php`)
- Default seed data: **MEDIUM** — extracted from `QuotationBuilder.tsx:102–105` and `QuotationPDFTemplate.tsx:327–342` (HIGH confidence for source), but company info (phone, bank) varies across codebase (see §8.8) — recommend user verification before cutover
- Schema compatibility: **HIGH** — all `ADD COLUMN IF NOT EXISTS` clauses are MySQL 8.0+; the PHP migration runner handles MySQL 5.7 compatibility
- Phase requirements coverage: **HIGH** — every DB-* and SET-* requirement is mapped to a concrete schema column, API endpoint, or seed row

**Research date:** 02 June 2026
**Valid until:** 30 days (DB engine, schema, and API patterns are stable; only company-info values may need refresh before cutover)

## Appendix D: Sources

### Primary (HIGH confidence)
- `public_html/api/.env` — `DB_DRIVER=mysql` (CRITICAL — overrides PRD's PostgreSQL claim)
- `public_html/api/config.php` lines 96–121 — PDO connection, dual-driver support, timezone
- `public_html/api/helpers.php` — `jsonResponse()`, `sanitizeInput()`, `getInput()`, `sendEmail()`
- `public_html/api/admin-guard.php` — auth + `requireRole()` / `requirePermission()`
- `public_html/api/crm/settings.php` — existing settings endpoint (lines 64 use broken `ON CONFLICT` syntax on MySQL — bug to avoid)
- `public_html/api/crm/quotations.php` lines 39–48, 79, 169 — latent column-not-found bugs and `SELECT COUNT(*)+1` race condition
- `sql/crm_complete_schema.sql` — authoritative MySQL schema (lines 179–240 are `crm_quotations` and `crm_quotation_line_items`)
- `src/components/admin/crm/QuotationBuilder.tsx:102–105` — `DEFAULT_TERMS` constant (4 items)
- `src/components/admin/crm/QuotationPDFTemplate.tsx:327–342` — hardcoded T&C (5 items) and bank details
- `public_html/assets/logo-black.png` — verified to exist (47,336 bytes)
- `.planning/REQUIREMENTS.md` lines 17–42 — DB-* and SET-* requirement definitions
- `.planning/ROADMAP.md` lines 32–48 — Phase 1 success criteria
- `.planning/STATE.md` — accumulated decisions (line 60 confirms "PDO with parameterized queries for cross-compatibility")

### Secondary (MEDIUM confidence)
- MySQL `SELECT ... FOR UPDATE` semantics — well-known, works on MySQL 5.7+ and 8.0 (verified by `crm_complete_schema.sql` using `ENGINE=InnoDB` which supports row-level locking)
- `INSERT IGNORE` + `ON DUPLICATE KEY UPDATE` — standard MySQL upsert pattern

### Tertiary (LOW confidence)
- Phone number canonical value — three candidates exist (`+91 11 4155 6447`, `+91 8800 446 447`, `+91 8800 172802`); used the first because it matches the user's stated priority and the `crm_app_settings` seed

### Not consulted (out of scope for Phase 1)
- The PostgreSQL/Supabase migration files (`sql/migrate_to_postgresql.sql`, `sql/supabase_schema_final.sql`) — not relevant since `.env` says MySQL
- The 6+ deprecated/old components in `src/components/admin/crm/` other than `QuotationBuilder.tsx` and `QuotationPDFTemplate.tsx` — Phase 1 doesn't touch them
