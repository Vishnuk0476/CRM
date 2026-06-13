const fs = require('fs');
const path = require('path');
const sqlDir = 'C:/xampp/htdocs/panyaglobal-local/sql';
if (!fs.existsSync(sqlDir)) fs.mkdirSync(sqlDir, { recursive: true });

const files = {
  '01_extend_leads_table.sql': `
ALTER TABLE leads ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS designation VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS relocation_type VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS origin_city VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS origin_country VARCHAR(100) DEFAULT 'India';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS destination_city VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS move_timeline VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_min DECIMAL(12,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_max DECIMAL(12,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS family_adults INTEGER DEFAULT 1;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS family_children INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS children_ages TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS special_requirements TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS temperature VARCHAR(20) DEFAULT 'cold';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS referral_source_name VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_followup_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_gulf_nri BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_to_case BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS case_id INTEGER;
  `,
  '02_create_cases_table.sql': `
CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(20) UNIQUE NOT NULL,
    lead_id INTEGER,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    client_alternate_phone VARCHAR(20),
    client_email VARCHAR(255),
    company_name VARCHAR(255),
    relocation_type VARCHAR(100),
    origin_address TEXT,
    origin_city VARCHAR(255),
    origin_state VARCHAR(100),
    origin_pincode VARCHAR(10),
    destination_address TEXT,
    destination_city VARCHAR(255),
    destination_state VARCHAR(100),
    destination_pincode VARCHAR(10),
    move_date_expected DATE,
    move_date_confirmed DATE,
    bhk_type VARCHAR(50), 
    approx_area_sqft INTEGER,
    approx_items_count INTEGER,
    rooms_to_pack INTEGER,
    origin_floor INTEGER,
    destination_floor INTEGER,
    origin_elevator VARCHAR(20),
    destination_elevator VARCHAR(20),
    origin_parking BOOLEAN,
    destination_parking BOOLEAN,
    access_road_condition VARCHAR(50),
    access_notes TEXT,
    services_included JSONB,
    assigned_consultant_id INTEGER,
    assigned_at TIMESTAMP,
    milestone VARCHAR(100) DEFAULT 'inquiry_received',
    case_status VARCHAR(50) DEFAULT 'active',
    is_gulf_nri BOOLEAN DEFAULT false,
    family_adults INTEGER,
    family_children INTEGER,
    special_requirements JSONB,
    notes TEXT,
    internal_tags JSONB,
    total_quoted DECIMAL(12,2) DEFAULT 0,
    total_invoiced DECIMAL(12,2) DEFAULT 0,
    total_collected DECIMAL(12,2) DEFAULT 0,
    total_pending DECIMAL(12,2) DEFAULT 0,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_milestones (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    milestone VARCHAR(100) NOT NULL,
    milestone_date TIMESTAMP,
    notes TEXT,
    done_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
  `,
  '03_create_surveys_tables.sql': `
CREATE TABLE IF NOT EXISTS surveys (
    id SERIAL PRIMARY KEY,
    survey_number VARCHAR(20) UNIQUE NOT NULL,
    case_id INTEGER,
    lead_id INTEGER,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    survey_address TEXT NOT NULL,
    destination_address TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    completed_at TIMESTAMP,
    survey_type VARCHAR(50) DEFAULT 'pre_move',
    survey_status VARCHAR(30) DEFAULT 'scheduled',
    team_lead_id INTEGER,
    vehicle_assigned VARCHAR(100),
    estimated_travel_minutes INTEGER,
    bhk_type VARCHAR(50),
    total_area_sqft INTEGER,
    origin_floor INTEGER,
    destination_floor INTEGER,
    building_type VARCHAR(100),
    origin_elevator VARCHAR(20),
    destination_elevator VARCHAR(20),
    origin_parking BOOLEAN,
    destination_parking BOOLEAN,
    access_road_condition VARCHAR(50),
    access_challenges TEXT,
    total_boxes_estimated INTEGER,
    total_items_count INTEGER,
    special_packing_needed BOOLEAN DEFAULT false,
    special_packing_notes TEXT,
    checkin_latitude DECIMAL(10,8),
    checkin_longitude DECIMAL(11,8),
    checkin_time TIMESTAMP,
    checkout_time TIMESTAMP,
    general_notes TEXT,
    client_special_instructions TEXT,
    risk_items TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_team_members (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
    admin_id INTEGER,
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_items (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
    room_name VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    size_notes VARCHAR(100),
    is_fragile BOOLEAN DEFAULT false,
    special_packing BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_photos (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    photo_type VARCHAR(50) DEFAULT 'general',
    caption TEXT,
    uploaded_by INTEGER,
    uploaded_at TIMESTAMP DEFAULT NOW()
);
  `,
  '04_create_accounts_tables.sql': `
CREATE TABLE IF NOT EXISTS quotations (
    id SERIAL PRIMARY KEY,
    quotation_number VARCHAR(20) UNIQUE NOT NULL,
    case_id INTEGER,
    lead_id INTEGER,
    survey_id INTEGER,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20),
    client_email VARCHAR(255),
    client_address TEXT,
    client_company VARCHAR(255),
    client_gst VARCHAR(20),
    origin_city VARCHAR(255),
    destination_city VARCHAR(255),
    bhk_type VARCHAR(50),
    move_date DATE,
    quotation_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_type VARCHAR(10) DEFAULT 'amount',
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
    payment_terms TEXT,
    notes TEXT,
    terms_and_conditions TEXT,
    status VARCHAR(30) DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    parent_quotation_id INTEGER,
    sent_at TIMESTAMP,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_line_items (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER REFERENCES quotations(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'job',
    unit_price DECIMAL(12,2) NOT NULL,
    gst_rate DECIMAL(5,2) DEFAULT 18.00,
    line_total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    quotation_id INTEGER,
    case_id INTEGER,
    lead_id INTEGER,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20),
    client_email VARCHAR(255),
    client_address TEXT,
    client_company VARCHAR(255),
    client_gst VARCHAR(20),
    invoice_type VARCHAR(30) DEFAULT 'tax_invoice',
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    origin_city VARCHAR(255),
    destination_city VARCHAR(255),
    bhk_type VARCHAR(50),
    move_date DATE,
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_type VARCHAR(10) DEFAULT 'amount',
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
    amount_paid DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2) DEFAULT 0,
    payment_terms TEXT,
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    bank_account_holder VARCHAR(255),
    upi_id VARCHAR(100),
    notes TEXT,
    internal_notes TEXT,
    terms_and_conditions TEXT,
    status VARCHAR(30) DEFAULT 'draft',
    sent_at TIMESTAMP,
    fully_paid_at TIMESTAMP,
    reminder_count INTEGER DEFAULT 0,
    last_reminder_at TIMESTAMP,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'job',
    unit_price DECIMAL(12,2) NOT NULL,
    gst_rate DECIMAL(5,2) DEFAULT 18.00,
    line_total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_number VARCHAR(20) UNIQUE NOT NULL,
    invoice_id INTEGER,
    case_id INTEGER,
    client_name VARCHAR(255),
    payment_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    reference_number VARCHAR(255),
    bank_account_credited VARCHAR(255),
    received_by INTEGER,
    notes TEXT,
    proof_file_path VARCHAR(500),
    status VARCHAR(30) DEFAULT 'confirmed',
    is_reconciled BOOLEAN DEFAULT false,
    reconciled_by INTEGER,
    reconciled_at TIMESTAMP,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_notes (
    id SERIAL PRIMARY KEY,
    credit_note_number VARCHAR(20) UNIQUE NOT NULL,
    invoice_id INTEGER,
    case_id INTEGER,
    client_name VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT NOT NULL,
    issued_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'issued',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    expense_number VARCHAR(20) UNIQUE NOT NULL,
    case_id INTEGER,
    expense_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_by INTEGER,
    payment_mode VARCHAR(50),
    receipt_file_path VARCHAR(500),
    reimbursement_status VARCHAR(30) DEFAULT 'not_applicable',
    approved_by INTEGER,
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
  `,
  '05_create_vendors_tables.sql': `
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    vendor_types JSONB,
    service_cities JSONB,
    contact_person VARCHAR(255),
    phone_primary VARCHAR(20),
    phone_alternate VARCHAR(20),
    email VARCHAR(255),
    gst_number VARCHAR(20),
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    bank_account_holder VARCHAR(255),
    upi_id VARCHAR(100),
    rate_card_notes TEXT,
    internal_rating DECIMAL(2,1) DEFAULT 0,
    tags JSONB,
    notes TEXT,
    agreement_file_path VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_vendors (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    vendor_id INTEGER REFERENCES vendors(id),
    service_type VARCHAR(100),
    scope_of_work TEXT,
    agreed_amount DECIMAL(12,2),
    amount_paid DECIMAL(12,2) DEFAULT 0,
    amount_pending DECIMAL(12,2) DEFAULT 0,
    payment_reference VARCHAR(255),
    payment_date DATE,
    payment_mode VARCHAR(50),
    status VARCHAR(30) DEFAULT 'assigned',
    performance_rating DECIMAL(2,1),
    performance_notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
  `,
  '06_create_documents_table.sql': `
CREATE TABLE IF NOT EXISTS case_documents (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    document_category VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    is_required BOOLEAN DEFAULT false,
    is_received BOOLEAN DEFAULT true,
    received_date DATE,
    is_auto_generated BOOLEAN DEFAULT false,
    linked_entity_type VARCHAR(50),
    linked_entity_id INTEGER,
    notes TEXT,
    uploaded_by INTEGER,
    uploaded_at TIMESTAMP DEFAULT NOW()
);
  `,
  '07_create_activities_followups.sql': `
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER,
    case_id INTEGER,
    admin_id INTEGER,
    activity_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS followups (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER,
    case_id INTEGER,
    assigned_to INTEGER,
    followup_type VARCHAR(50) DEFAULT 'call',
    template_used VARCHAR(100),
    custom_message TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    status VARCHAR(30) DEFAULT 'pending',
    snooze_until TIMESTAMP,
    outcome TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_logs (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER,
    case_id INTEGER,
    consultant_id INTEGER,
    call_direction VARCHAR(10) DEFAULT 'outbound',
    call_status VARCHAR(30),
    duration_seconds INTEGER,
    call_notes TEXT,
    outcome VARCHAR(100),
    twilio_call_sid VARCHAR(255),
    recording_url VARCHAR(500),
    called_at TIMESTAMP DEFAULT NOW()
);
  `,
  '08_create_attendance_tables.sql': `
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER,
    attendance_date DATE DEFAULT CURRENT_DATE,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    check_in_latitude DECIMAL(10,8),
    check_in_longitude DECIMAL(11,8),
    check_out_latitude DECIMAL(10,8),
    check_out_longitude DECIMAL(11,8),
    status VARCHAR(30) DEFAULT 'present',
    selfie_path VARCHAR(500),
    notes TEXT,
    approved_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS field_visits (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER,
    case_id INTEGER,
    survey_id INTEGER,
    visit_date DATE DEFAULT CURRENT_DATE,
    checkin_time TIMESTAMP,
    checkin_latitude DECIMAL(10,8),
    checkin_longitude DECIMAL(11,8),
    checkout_time TIMESTAMP,
    checkout_latitude DECIMAL(10,8),
    checkout_longitude DECIMAL(11,8),
    client_name VARCHAR(255),
    visit_purpose TEXT,
    visit_notes TEXT,
    kilometers_traveled DECIMAL(8,2),
    photos JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER,
    leave_type VARCHAR(50),
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    days_count DECIMAL(4,1),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by INTEGER,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
  `,
  '09_create_social_posts_table.sql': `
CREATE TABLE IF NOT EXISTS social_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    caption TEXT,
    post_type VARCHAR(50),
    category VARCHAR(100),
    media_paths JSONB,
    status VARCHAR(20) DEFAULT 'idea',
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    assigned_to INTEGER,
    notes TEXT,
    external_post_id VARCHAR(255),
    platform_response JSONB,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
  `,
  '10_create_properties_table.sql': `
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    locality VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    full_address TEXT,
    property_type VARCHAR(50),
    bhk_type VARCHAR(30),
    rent_price DECIMAL(12,2),
    sale_price DECIMAL(12,2),
    area_sqft INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    furnishing VARCHAR(30),
    pet_friendly BOOLEAN DEFAULT false,
    availability_status VARCHAR(20) DEFAULT 'available',
    near_metro BOOLEAN DEFAULT false,
    near_hospital BOOLEAN DEFAULT false,
    near_school BOOLEAN DEFAULT false,
    near_it_park BOOLEAN DEFAULT false,
    description TEXT,
    amenities JSONB,
    broker_name VARCHAR(255),
    broker_phone VARCHAR(20),
    owner_name VARCHAR(255),
    owner_phone VARCHAR(20),
    images JSONB,
    documents JSONB,
    internal_notes TEXT,
    tags JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_shares (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER,
    case_id INTEGER,
    property_id INTEGER REFERENCES properties(id),
    resource_type VARCHAR(30),
    resource_title VARCHAR(255),
    share_channel VARCHAR(30),
    share_link VARCHAR(500),
    message_sent TEXT,
    sent_by INTEGER,
    sent_at TIMESTAMP DEFAULT NOW()
);
  `,
  '11_create_notifications_table.sql': `
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    notification_type VARCHAR(50),
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    action_url VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
  `,
  '12_create_app_settings.sql': `
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_group VARCHAR(50),
    is_sensitive BOOLEAN DEFAULT false,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO app_settings (setting_key, setting_value, setting_group) VALUES
('company_name', 'Panya Global Relocation Pvt. Ltd.', 'company'),
('company_gst', '', 'company'),
('company_address', '', 'company'),
('company_phone', '+91 11 4155 6447', 'company'),
('company_email', 'info@panyaglobal.in', 'company'),
('company_website', 'www.panyaglobal.in', 'company'),
('invoice_prefix', 'INV-', 'invoice'),
('quotation_prefix', 'QT-', 'invoice'),
('case_prefix', 'PG-', 'invoice'),
('survey_prefix', 'SRV-', 'invoice'),
('payment_prefix', 'PAY-', 'invoice'),
('default_cgst_rate', '9', 'gst'),
('default_sgst_rate', '9', 'gst'),
('default_igst_rate', '18', 'gst'),
('bank_name', '', 'company'),
('bank_account_number', '', 'company'),
('bank_ifsc', '', 'company'),
('bank_account_holder', '', 'company'),
('upi_id', '', 'company'),
('invoice_terms', 'Payment due within 7 days of invoice date.', 'invoice'),
('invoice_footer', 'Thank you for choosing Panya Global Relocation.', 'invoice'),
('lead_assignment_mode', 'round_robin', 'automation'),
('gulf_nri_auto_tag', 'true', 'automation'),
('auto_call_on_lead', 'false', 'twilio'),
('twilio_account_sid', '', 'twilio'),
('twilio_auth_token', '', 'twilio'),
('twilio_phone_number', '', 'twilio'),
('whatsapp_number', '', 'whatsapp'),
('openai_api_key', '', 'ai')
ON CONFLICT (setting_key) DO NOTHING;
  `,
  '13_add_roles_to_admins.sql': `
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'admin';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
  `,
  '14_create_indexes.sql': `
-- Adding performance indexes for foreign keys and common search columns
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_case_id ON leads(case_id);

CREATE INDEX IF NOT EXISTS idx_cases_lead_id ON cases(lead_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_consultant_id ON cases(assigned_consultant_id);

CREATE INDEX IF NOT EXISTS idx_surveys_case_id ON surveys(case_id);
CREATE INDEX IF NOT EXISTS idx_surveys_lead_id ON surveys(lead_id);
CREATE INDEX IF NOT EXISTS idx_survey_team_members_survey_id ON survey_team_members(survey_id);

CREATE INDEX IF NOT EXISTS idx_quotations_case_id ON quotations(case_id);
CREATE INDEX IF NOT EXISTS idx_invoices_case_id ON invoices(case_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_expenses_case_id ON expenses(case_id);
  `,
  '15_seed_data.sql': `
-- Sample realistic seed data can be added here if needed for testing
  `
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(sqlDir, filename), content.trim() + '\n');
  console.log('Created:', filename);
}
