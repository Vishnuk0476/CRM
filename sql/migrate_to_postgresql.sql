-- ============================================================
-- Panya Global CRM — PostgreSQL Schema Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Enable UUID extension ──────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUM Types ────────────────────────────────────────────
CREATE TYPE admin_role AS ENUM ('super_admin', 'owner', 'manager', 'salesperson', 'operations', 'accountant', 'digital_marketing');

CREATE TYPE consignment_status AS ENUM ('pending', 'booked', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'on_hold');

CREATE TYPE quote_status AS ENUM ('pending', 'reviewed', 'quoted', 'confirmed', 'in_progress', 'completed', 'cancelled');

CREATE TYPE inquiry_status AS ENUM ('pending', 'reviewed', 'quoted', 'confirmed', 'in_progress', 'completed', 'cancelled');

CREATE TYPE testimonial_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'overdue', 'cancelled');

CREATE TYPE order_status AS ENUM ('scheduled', 'packing', 'in_transit', 'delivered', 'completed', 'cancelled');

CREATE TYPE invoice_status AS ENUM ('pending', 'partial', 'paid', 'overdue', 'cancelled');

CREATE TYPE crm_lead_status AS ENUM ('enquiry', 'quoted', 'confirmed', 'in_transit', 'completed', 'cancelled');

CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

CREATE TYPE fleet_vehicle_type AS ENUM ('truck', 'Tempo', 'LCV', 'Mini_Truck', 'Heavy_Truck', 'Container');

-- ─── ADMINS TABLE ───────────────────────────────────────────
CREATE TABLE admins (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            admin_role NOT NULL DEFAULT 'salesperson',
    permissions     JSONB DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login      TIMESTAMPTZ DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_active ON admins(is_active);

-- ─── USER ROLES TABLE ──────────────────────────────────────
CREATE TABLE user_roles (
    id          SERIAL PRIMARY KEY,
    admin_id    INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    module      VARCHAR(50) NOT NULL,
    permission  VARCHAR(20) NOT NULL CHECK (permission IN ('none', 'read', 'write', 'execute')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(admin_id, module)
);

CREATE INDEX idx_user_roles_admin ON user_roles(admin_id);

-- ─── ACTIVITY LOGS TABLE ───────────────────────────────────
CREATE TABLE activity_logs (
    id              SERIAL PRIMARY KEY,
    admin_id        INTEGER DEFAULT NULL,
    admin_email     VARCHAR(150) DEFAULT NULL,
    admin_name      VARCHAR(150) DEFAULT NULL,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50) DEFAULT NULL,
    entity_id       VARCHAR(50) DEFAULT NULL,
    entity_reference VARCHAR(100) DEFAULT NULL,
    details         JSONB DEFAULT NULL,
    ip_address      VARCHAR(45) DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_admin ON activity_logs(admin_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- ─── BLOG POSTS TABLE ──────────────────────────────────────
CREATE TABLE blog_posts (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    excerpt         TEXT DEFAULT NULL,
    content         TEXT NOT NULL,
    featured_image  VARCHAR(500) DEFAULT NULL,
    author          VARCHAR(150) DEFAULT 'Panya Global',
    category        VARCHAR(100) DEFAULT 'Relocation Tips',
    tags            TEXT[] DEFAULT '{}',
    meta_title      VARCHAR(255) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at    TIMESTAMPTZ DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC NULLS LAST);

-- ─── CONSIGNMENTS TABLE ────────────────────────────────────
CREATE TABLE consignments (
    id                      SERIAL PRIMARY KEY,
    reference_number        VARCHAR(50) NOT NULL UNIQUE,
    customer_name           VARCHAR(150) NOT NULL,
    customer_email          VARCHAR(150) DEFAULT NULL,
    customer_phone          VARCHAR(20) DEFAULT NULL,
    pickup_address          TEXT DEFAULT NULL,
    pickup_city             VARCHAR(100) DEFAULT NULL,
    drop_address            TEXT DEFAULT NULL,
    drop_city               VARCHAR(100) DEFAULT NULL,
    shipping_date           DATE DEFAULT NULL,
    delivery_date           DATE DEFAULT NULL,
    property_type           VARCHAR(80) DEFAULT NULL,
    load_type               VARCHAR(80) DEFAULT NULL,
    estimated_weight        DECIMAL(10,2) DEFAULT NULL,
    distance_km             INTEGER DEFAULT NULL,
    base_price              DECIMAL(10,2) DEFAULT NULL,
    gst_amount              DECIMAL(10,2) DEFAULT 0,
    total_amount            DECIMAL(10,2) DEFAULT 0,
    payment_status          payment_status NOT NULL DEFAULT 'pending',
    lr_number               VARCHAR(50) DEFAULT NULL,
    vehicle_number          VARCHAR(50) DEFAULT NULL,
    status                  consignment_status NOT NULL DEFAULT 'pending',
    notes                   TEXT DEFAULT NULL,
    tracking_url            VARCHAR(500) DEFAULT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consignments_ref ON consignments(reference_number);
CREATE INDEX idx_consignments_status ON consignments(status);
CREATE INDEX idx_consignments_customer ON consignments(customer_name);
CREATE INDEX idx_consignments_created ON consignments(created_at DESC);
CREATE INDEX idx_consignments_shipping ON consignments(shipping_date);
CREATE INDEX idx_consignments_payment ON consignments(payment_status);

-- ─── QUOTE SUBMISSIONS TABLE ────────────────────────────────
CREATE TABLE quote_submissions (
    id                  SERIAL PRIMARY KEY,
    reference_number    VARCHAR(50) NOT NULL UNIQUE,
    name                VARCHAR(150) NOT NULL,
    email                VARCHAR(150) NOT NULL,
    phone               VARCHAR(20) DEFAULT NULL,
    service_type        VARCHAR(100) DEFAULT NULL,
    pickup_city          VARCHAR(100) DEFAULT NULL,
    drop_city            VARCHAR(100) DEFAULT NULL,
    moving_date         DATE DEFAULT NULL,
    property_type        VARCHAR(80) DEFAULT NULL,
    message              TEXT DEFAULT NULL,
    source               VARCHAR(50) DEFAULT 'website',
    status               quote_status NOT NULL DEFAULT 'pending',
    status_message       TEXT DEFAULT NULL,
    admin_notes          TEXT DEFAULT NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotes_ref ON quote_submissions(reference_number);
CREATE INDEX idx_quotes_status ON quote_submissions(status);
CREATE INDEX idx_quotes_email ON quote_submissions(email);
CREATE INDEX idx_quotes_created ON quote_submissions(created_at DESC);

-- ─── SERVICE INQUIRIES TABLE ────────────────────────────────
CREATE TABLE service_inquiries (
    id                  SERIAL PRIMARY KEY,
    reference_number    VARCHAR(50) NOT NULL UNIQUE,
    name                VARCHAR(150) NOT NULL,
    email                VARCHAR(150) NOT NULL,
    phone               VARCHAR(20) DEFAULT NULL,
    service_type        VARCHAR(100) NOT NULL,
    city                VARCHAR(100) DEFAULT NULL,
    message             TEXT DEFAULT NULL,
    source               VARCHAR(50) DEFAULT 'website',
    status               inquiry_status NOT NULL DEFAULT 'pending',
    status_message       TEXT DEFAULT NULL,
    admin_notes          TEXT DEFAULT NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inquiries_ref ON service_inquiries(reference_number);
CREATE INDEX idx_inquiries_status ON service_inquiries(status);
CREATE INDEX idx_inquiries_service ON service_inquiries(service_type);
CREATE INDEX idx_inquiries_created ON service_inquiries(created_at DESC);

-- ─── CONTACT MESSAGES TABLE ────────────────────────────────
CREATE TABLE contact_messages (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    phone       VARCHAR(20) DEFAULT NULL,
    subject     VARCHAR(255) DEFAULT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    read_at     TIMESTAMPTZ DEFAULT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_read ON contact_messages(is_read);
CREATE INDEX idx_contact_created ON contact_messages(created_at DESC);

-- ─── TESTIMONIALS TABLE ────────────────────────────────────
CREATE TABLE testimonials (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(150) DEFAULT NULL,
    rating      INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    message     TEXT NOT NULL,
    photo_url   VARCHAR(500) DEFAULT NULL,
    designation VARCHAR(100) DEFAULT NULL,
    company     VARCHAR(150) DEFAULT NULL,
    source      VARCHAR(50) DEFAULT 'website',
    status      testimonial_status NOT NULL DEFAULT 'pending',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX idx_testimonials_created ON testimonials(created_at DESC);

-- ─── NEWSLETTER SUBSCRIBERS TABLE ─────────────────────────
CREATE TABLE newsletter_subscribers (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(150) NOT NULL UNIQUE,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_active ON newsletter_subscribers(is_active);

-- ─── BROCHURE DOWNLOADS TABLE ──────────────────────────────
CREATE TABLE brochure_downloads (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) DEFAULT NULL,
    email       VARCHAR(150) DEFAULT NULL,
    phone       VARCHAR(20) DEFAULT NULL,
    company     VARCHAR(200) DEFAULT NULL,
    ip_address  VARCHAR(45) DEFAULT NULL,
    user_agent  TEXT DEFAULT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brochure_created ON brochure_downloads(created_at DESC);

-- ─── CHAT CONVERSATIONS TABLE ──────────────────────────────
CREATE TABLE chat_conversations (
    id          SERIAL PRIMARY KEY,
    session_id  VARCHAR(100) NOT NULL,
    user_name   VARCHAR(150) DEFAULT NULL,
    user_email  VARCHAR(150) DEFAULT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at    TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_chat_session ON chat_conversations(session_id);
CREATE INDEX idx_chat_active ON chat_conversations(is_active);

-- ─── CHAT MESSAGES TABLE ───────────────────────────────────
CREATE TABLE chat_messages (
    id              SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    message         TEXT NOT NULL,
    sender          VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'bot', 'admin')),
    metadata        JSONB DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_conv ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

-- ─── VISITOR LOGS TABLE ───────────────────────────────────
CREATE TABLE visitor_logs (
    id              SERIAL PRIMARY KEY,
    ip_address      VARCHAR(45) DEFAULT NULL,
    country         VARCHAR(100) DEFAULT NULL,
    city            VARCHAR(100) DEFAULT NULL,
    region          VARCHAR(100) DEFAULT NULL,
    latitude        DECIMAL(9,6) DEFAULT NULL,
    longitude       DECIMAL(9,6) DEFAULT NULL,
    timezone        VARCHAR(100) DEFAULT NULL,
    postal_code     VARCHAR(20) DEFAULT NULL,
    browser         VARCHAR(100) DEFAULT NULL,
    browser_version VARCHAR(50) DEFAULT NULL,
    os              VARCHAR(100) DEFAULT NULL,
    os_version      VARCHAR(50) DEFAULT NULL,
    device          VARCHAR(50) DEFAULT NULL,
    is_mobile       BOOLEAN DEFAULT FALSE,
    is_bot          BOOLEAN DEFAULT FALSE,
    referrer        TEXT DEFAULT NULL,
    current_url     TEXT DEFAULT NULL,
    session_id      VARCHAR(100) DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visitor_created ON visitor_logs(created_at DESC);
CREATE INDEX idx_visitor_country ON visitor_logs(country);
CREATE INDEX idx_visitor_city ON visitor_logs(city);

-- ─── CRM LEADS TABLE ───────────────────────────────────────
CREATE TABLE crm_leads (
    id              SERIAL PRIMARY KEY,
    quotation_id    VARCHAR(30) NOT NULL UNIQUE,
    customer_name   VARCHAR(150) NOT NULL,
    phone           VARCHAR(20) DEFAULT NULL,
    email           VARCHAR(150) DEFAULT NULL,
    pickup_city     VARCHAR(100) DEFAULT NULL,
    drop_city       VARCHAR(100) DEFAULT NULL,
    shipping_date   DATE DEFAULT NULL,
    property_type   VARCHAR(80) DEFAULT NULL,
    load_type       VARCHAR(80) DEFAULT NULL,
    salesperson_id  INTEGER DEFAULT NULL REFERENCES admins(id) ON DELETE SET NULL,
    status          crm_lead_status NOT NULL DEFAULT 'enquiry',
    lead_source     VARCHAR(80) DEFAULT NULL,
    estimated_amount DECIMAL(12,2) DEFAULT NULL,
    notes           TEXT DEFAULT NULL,
    sheets_row_id   INTEGER DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_leads_quotation ON crm_leads(quotation_id);
CREATE INDEX idx_crm_leads_status ON crm_leads(status);
CREATE INDEX idx_crm_leads_salesperson ON crm_leads(salesperson_id);
CREATE INDEX idx_crm_leads_created ON crm_leads(created_at DESC);

-- ─── CRM ORDERS TABLE ─────────────────────────────────────
CREATE TABLE crm_orders (
    id                  SERIAL PRIMARY KEY,
    lead_id             INTEGER NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
    order_number        VARCHAR(30) NOT NULL UNIQUE,
    pickup_address      TEXT DEFAULT NULL,
    pickup_floor        VARCHAR(10) DEFAULT NULL,
    pickup_lift         VARCHAR(10) DEFAULT 'na',
    drop_address        TEXT DEFAULT NULL,
    drop_floor          VARCHAR(10) DEFAULT NULL,
    drop_lift           VARCHAR(10) DEFAULT 'na',
    eta                 DATE DEFAULT NULL,
    team_assigned       VARCHAR(200) DEFAULT NULL,
    special_instructions TEXT DEFAULT NULL,
    status              order_status NOT NULL DEFAULT 'scheduled',
    sheets_row_id       INTEGER DEFAULT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_orders_order ON crm_orders(order_number);
CREATE INDEX idx_crm_orders_lead ON crm_orders(lead_id);
CREATE INDEX idx_crm_orders_status ON crm_orders(status);
CREATE INDEX idx_crm_orders_eta ON crm_orders(eta);

-- ─── CRM INVOICES TABLE ────────────────────────────────────
CREATE TABLE crm_invoices (
    id              SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES crm_orders(id) ON DELETE CASCADE,
    invoice_number  VARCHAR(30) NOT NULL UNIQUE,
    amount          DECIMAL(12,2) NOT NULL DEFAULT 0,
    gst_rate        DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    gst_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_status  invoice_status NOT NULL DEFAULT 'pending',
    due_date        DATE DEFAULT NULL,
    notes           TEXT DEFAULT NULL,
    sheets_row_id   INTEGER DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_invoices_number ON crm_invoices(invoice_number);
CREATE INDEX idx_crm_invoices_order ON crm_invoices(order_id);
CREATE INDEX idx_crm_invoices_payment ON crm_invoices(payment_status);
CREATE INDEX idx_crm_invoices_due ON crm_invoices(due_date);

-- ─── CRM PAYMENTS TABLE ───────────────────────────────────
CREATE TABLE crm_payments (
    id              SERIAL PRIMARY KEY,
    invoice_id      INTEGER NOT NULL REFERENCES crm_invoices(id) ON DELETE CASCADE,
    amount          DECIMAL(12,2) NOT NULL,
    payment_method  VARCHAR(50) NOT NULL DEFAULT 'upi',
    transaction_id  VARCHAR(100) DEFAULT NULL,
    payment_date    DATE NOT NULL,
    notes           TEXT DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_payments_invoice ON crm_payments(invoice_id);
CREATE INDEX idx_crm_payments_date ON crm_payments(payment_date);

-- ─── CRM EXPENSES TABLE ───────────────────────────────────
CREATE TABLE crm_expenses (
    id              SERIAL PRIMARY KEY,
    category        VARCHAR(100) NOT NULL,
    description     TEXT DEFAULT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    expense_date    DATE NOT NULL,
    order_id        INTEGER DEFAULT NULL REFERENCES crm_orders(id) ON DELETE SET NULL,
    vendor_name     VARCHAR(150) DEFAULT NULL,
    invoice_ref     VARCHAR(100) DEFAULT NULL,
    created_by      INTEGER DEFAULT NULL REFERENCES admins(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_expenses_category ON crm_expenses(category);
CREATE INDEX idx_crm_expenses_date ON crm_expenses(expense_date);
CREATE INDEX idx_crm_expenses_order ON crm_expenses(order_id);

-- ─── CRM FOLLOW UPS TABLE ─────────────────────────────────
CREATE TABLE crm_follow_ups (
    id              SERIAL PRIMARY KEY,
    lead_id         INTEGER DEFAULT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
    customer_name   VARCHAR(150) DEFAULT NULL,
    customer_phone  VARCHAR(20) DEFAULT NULL,
    scheduled_date  TIMESTAMPTZ NOT NULL,
    follow_up_type  VARCHAR(50) DEFAULT 'call',
    notes           TEXT DEFAULT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    completed_at    TIMESTAMPTZ DEFAULT NULL,
    assigned_to     INTEGER DEFAULT NULL REFERENCES admins(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_followups_date ON crm_follow_ups(scheduled_date);
CREATE INDEX idx_crm_followups_status ON crm_follow_ups(status);
CREATE INDEX idx_crm_followups_lead ON crm_follow_ups(lead_id);
CREATE INDEX idx_crm_followups_assigned ON crm_follow_ups(assigned_to);

-- ─── CRM TEAM TASKS TABLE ─────────────────────────────────
CREATE TABLE crm_team_tasks (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT DEFAULT NULL,
    priority        task_priority NOT NULL DEFAULT 'medium',
    status          task_status NOT NULL DEFAULT 'pending',
    assigned_to     INTEGER DEFAULT NULL REFERENCES admins(id) ON DELETE SET NULL,
    due_date        TIMESTAMPTZ DEFAULT NULL,
    completed_at    TIMESTAMPTZ DEFAULT NULL,
    order_id        INTEGER DEFAULT NULL REFERENCES crm_orders(id) ON DELETE SET NULL,
    created_by      INTEGER DEFAULT NULL REFERENCES admins(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_tasks_status ON crm_team_tasks(status);
CREATE INDEX idx_crm_tasks_assigned ON crm_team_tasks(assigned_to);
CREATE INDEX idx_crm_tasks_priority ON crm_team_tasks(priority);
CREATE INDEX idx_crm_tasks_due ON crm_team_tasks(due_date);

-- ─── CRM FLEET TABLE ──────────────────────────────────────
CREATE TABLE crm_fleet (
    id              SERIAL PRIMARY KEY,
    vehicle_type    fleet_vehicle_type NOT NULL DEFAULT 'truck',
    vehicle_number  VARCHAR(50) NOT NULL UNIQUE,
    driver_name     VARCHAR(150) DEFAULT NULL,
    driver_phone    VARCHAR(20) DEFAULT NULL,
    capacity_tons   DECIMAL(10,2) DEFAULT NULL,
    current_location VARCHAR(200) DEFAULT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'available',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_fleet_number ON crm_fleet(vehicle_number);
CREATE INDEX idx_crm_fleet_status ON crm_fleet(status);

-- ─── CRM PACKING LISTS TABLE ──────────────────────────────
CREATE TABLE crm_packing_lists (
    id              SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES crm_orders(id) ON DELETE CASCADE,
    item_name       VARCHAR(255) NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1,
    packed          BOOLEAN NOT NULL DEFAULT FALSE,
    loaded          BOOLEAN NOT NULL DEFAULT FALSE,
    delivered       BOOLEAN NOT NULL DEFAULT FALSE,
    notes           TEXT DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_packing_order ON crm_packing_lists(order_id);

-- ─── CRM CALL LOGS TABLE ──────────────────────────────────
CREATE TABLE crm_call_logs (
    id              SERIAL PRIMARY KEY,
    lead_id         INTEGER DEFAULT NULL REFERENCES crm_leads(id) ON DELETE SET NULL,
    customer_name   VARCHAR(150) DEFAULT NULL,
    customer_phone  VARCHAR(20) DEFAULT NULL,
    call_duration   INTEGER DEFAULT 0,
    call_type       VARCHAR(50) DEFAULT 'outbound',
    call_status     VARCHAR(20) NOT NULL DEFAULT 'completed',
    notes           TEXT DEFAULT NULL,
    recording_url   VARCHAR(500) DEFAULT NULL,
    called_by       INTEGER DEFAULT NULL REFERENCES admins(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_callogs_lead ON crm_call_logs(lead_id);
CREATE INDEX idx_crm_callogs_called ON crm_call_logs(called_by);
CREATE INDEX idx_crm_callogs_created ON crm_call_logs(created_at DESC);

-- ─────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE brochure_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_packing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_call_logs ENABLE ROW LEVEL SECURITY;

-- ─── ADMINS Policies ──────────────────────────────────────
CREATE POLICY "Admins: Only super_admin can view all"
    ON admins FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Admins: Users can view own profile"
    ON admins FOR SELECT
    TO authenticated
    USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Admins: Only super_admin can insert"
    ON admins FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Admins: Only super_admin can update"
    ON admins FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Admins: Only super_admin can delete"
    ON admins FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'super_admin');

-- ─── PUBLIC Tables (Read/Insert for everyone) ─────────────

-- Consignments: Public can track, admin can manage
CREATE POLICY "Consignments: Anyone can view by ref_number"
    ON consignments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Consignments: Anyone can insert"
    ON consignments FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Consignments: Admin only can update/delete"
    ON consignments FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

CREATE POLICY "Consignments: Admin only can delete"
    ON consignments FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner'));

-- Quote Submissions: Public insert, Admin view/update
CREATE POLICY "Quote Submissions: Anyone can insert"
    ON quote_submissions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Quote Submissions: Admin can view all"
    ON quote_submissions FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'salesperson'));

CREATE POLICY "Quote Submissions: Admin can update"
    ON quote_submissions FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

-- Service Inquiries: Public insert, Admin view/update
CREATE POLICY "Service Inquiries: Anyone can insert"
    ON service_inquiries FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Service Inquiries: Admin can view all"
    ON service_inquiries FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'salesperson'));

CREATE POLICY "Service Inquiries: Admin can update"
    ON service_inquiries FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

-- Contact Messages: Public insert, Admin view/update
CREATE POLICY "Contact Messages: Anyone can insert"
    ON contact_messages FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Contact Messages: Admin can view all"
    ON contact_messages FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'salesperson'));

CREATE POLICY "Contact Messages: Admin can update"
    ON contact_messages FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

-- Testimonials: Public insert pending, Admin can manage
CREATE POLICY "Testimonials: Anyone can insert"
    ON testimonials FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Testimonials: Anyone can view approved"
    ON testimonials FOR SELECT
    TO authenticated
    USING (status = 'approved');

CREATE POLICY "Testimonials: Admin can view all"
    ON testimonials FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

CREATE POLICY "Testimonials: Admin can update"
    ON testimonials FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

-- Blog Posts: Public view published, Admin can manage
CREATE POLICY "Blog Posts: Anyone can view published"
    ON blog_posts FOR SELECT
    TO authenticated
    USING (status = 'published');

CREATE POLICY "Blog Posts: Admin can view all"
    ON blog_posts FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

CREATE POLICY "Blog Posts: Admin can insert"
    ON blog_posts FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

CREATE POLICY "Blog Posts: Admin can update"
    ON blog_posts FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

CREATE POLICY "Blog Posts: Admin can delete"
    ON blog_posts FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner'));

-- Newsletter: Public subscribe, Admin can view
CREATE POLICY "Newsletter: Anyone can insert"
    ON newsletter_subscribers FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Newsletter: Admin can view all"
    ON newsletter_subscribers FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'digital_marketing'));

CREATE POLICY "Newsletter: Admin can update"
    ON newsletter_subscribers FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

-- Brochure Downloads: Public insert, Admin view
CREATE POLICY "Brochure: Anyone can insert"
    ON brochure_downloads FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Brochure: Admin can view all"
    ON brochure_downloads FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'digital_marketing'));

-- Chat: Public can participate
CREATE POLICY "Chat Conversations: Anyone can insert"
    ON chat_conversations FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Chat: Admin can view all, users own session"
    ON chat_conversations FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'super_admin' OR session_id = auth.uid()::text);

CREATE POLICY "Chat Messages: Anyone can insert"
    ON chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Chat Messages: Admin can view all"
    ON chat_messages FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'super_admin');

-- Visitor Logs: Admin only
CREATE POLICY "Visitor Logs: Admin can view all"
    ON visitor_logs FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

CREATE POLICY "Visitor Logs: Auto insert (service role only)"
    ON visitor_logs FOR INSERT
    TO service_role
    WITH CHECK (true);

-- ─── CRM Tables (Admin only based on role) ─────────────────

-- CRM Leads
CREATE POLICY "CRM Leads: Admin can view"
    ON crm_leads FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'salesperson', 'operations'));

CREATE POLICY "CRM Leads: Admin can insert"
    ON crm_leads FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'salesperson'));

CREATE POLICY "CRM Leads: Admin can update"
    ON crm_leads FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'salesperson', 'operations'));

CREATE POLICY "CRM Leads: Admin can delete"
    ON crm_leads FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner'));

-- CRM Orders
CREATE POLICY "CRM Orders: Admin can view"
    ON crm_orders FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'operations'));

CREATE POLICY "CRM Orders: Admin can insert"
    ON crm_orders FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

CREATE POLICY "CRM Orders: Admin can update"
    ON crm_orders FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'operations'));

CREATE POLICY "CRM Orders: Admin can delete"
    ON crm_orders FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner'));

-- CRM Invoices
CREATE POLICY "CRM Invoices: Admin can view"
    ON crm_invoices FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'accountant'));

CREATE POLICY "CRM Invoices: Admin can insert/update"
    ON crm_invoices FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'accountant'));

CREATE POLICY "CRM Invoices: Admin can update"
    ON crm_invoices FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'accountant'));

CREATE POLICY "CRM Invoices: Admin can delete"
    ON crm_invoices FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner'));

-- CRM Payments
CREATE POLICY "CRM Payments: Admin can view"
    ON crm_payments FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'accountant'));

CREATE POLICY "CRM Payments: Admin can insert/update"
    ON crm_payments FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'accountant'));

CREATE POLICY "CRM Payments: Admin can update"
    ON crm_payments FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'accountant'));

-- CRM Expenses
CREATE POLICY "CRM Expenses: Admin can view"
    ON crm_expenses FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'accountant', 'operations'));

CREATE POLICY "CRM Expenses: Admin can insert/update"
    ON crm_expenses FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'accountant', 'operations'));

CREATE POLICY "CRM Expenses: Admin can update"
    ON crm_expenses FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'accountant'));

-- CRM Follow Ups
CREATE POLICY "CRM Follow Ups: Admin can view"
    ON crm_follow_ups FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'salesperson'));

CREATE POLICY "CRM Follow Ups: Admin can insert/update"
    ON crm_follow_ups FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'salesperson'));

CREATE POLICY "CRM Follow Ups: Admin can update"
    ON crm_follow_ups FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'salesperson'));

-- CRM Team Tasks
CREATE POLICY "CRM Tasks: Admin can view"
    ON crm_team_tasks FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'operations'));

CREATE POLICY "CRM Tasks: Admin can insert"
    ON crm_team_tasks FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

CREATE POLICY "CRM Tasks: Admin can update"
    ON crm_team_tasks FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

CREATE POLICY "CRM Tasks: Admin can delete"
    ON crm_team_tasks FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner'));

-- CRM Fleet
CREATE POLICY "CRM Fleet: Admin can view"
    ON crm_fleet FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'operations'));

CREATE POLICY "CRM Fleet: Admin can insert/update"
    ON crm_fleet FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

CREATE POLICY "CRM Fleet: Admin can update"
    ON crm_fleet FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'operations'));

CREATE POLICY "CRM Fleet: Admin can delete"
    ON crm_fleet FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner'));

-- CRM Packing Lists
CREATE POLICY "CRM Packing: Admin can view"
    ON crm_packing_lists FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'operations'));

CREATE POLICY "CRM Packing: Admin can insert/update"
    ON crm_packing_lists FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'operations'));

CREATE POLICY "CRM Packing: Admin can update"
    ON crm_packing_lists FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'operations'));

-- CRM Call Logs
CREATE POLICY "CRM Call Logs: Admin can view"
    ON crm_call_logs FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'salesperson'));

CREATE POLICY "CRM Call Logs: Admin can insert/update"
    ON crm_call_logs FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager', 'salesperson'));

CREATE POLICY "CRM Call Logs: Admin can update"
    ON crm_call_logs FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

-- ─── USER ROLES & ACTIVITY LOGS ─────────────────────────────

CREATE POLICY "User Roles: Admin can manage"
    ON user_roles FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner'));

CREATE POLICY "Activity Logs: Admin can view all"
    ON activity_logs FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'owner', 'manager'));

CREATE POLICY "Activity Logs: Auto insert (service role)"
    ON activity_logs FOR INSERT
    TO service_role
    WITH CHECK (true);

-- ─────────────────────────────────────────────────────────
-- REALTIME CONFIGURATION
-- Enable realtime for specific tables
-- ─────────────────────────────────────────────────────────

-- Run in Supabase Dashboard → Database → Replication
-- Or use SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE quote_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE consignments;
ALTER PUBLICATION supabase_realtime ADD TABLE crm_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE crm_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ─────────────────────────────────────────────────────────
-- STORAGE BUCKETS (Run separately in Supabase Dashboard)
-- Create these buckets in Storage → New bucket
-- ─────────────────────────────────────────────────────────

-- Bucket: testimonials (Public)
-- Bucket: blog (Public)
-- Bucket: brochures (Public)
-- Bucket: lr-receipts (Private, admin only)

-- ─────────────────────────────────────────────────────────
-- FINISH
-- ─────────────────────────────────────────────────────────
SELECT 'Migration complete! Please now run the data migration script.';