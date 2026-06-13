-- ============================================================
-- Panya Global — Complete Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- URL: https://supabase.com/dashboard/project/ezkvxtxsmebwhvagpiiz/editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy search

-- ──────────────────────────────────────────────────────────────
-- 1. ADMINS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        TEXT UNIQUE NOT NULL,
  name         TEXT,
  role         TEXT NOT NULL DEFAULT 'salesperson'
               CHECK (role IN ('super_admin','owner','manager','salesperson','viewer')),
  permissions  JSONB NOT NULL DEFAULT '{}',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  last_login   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read own data" ON admins FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Super admin full access" ON admins FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id::text = auth.uid()::text AND role IN ('super_admin','owner'))
);

-- ──────────────────────────────────────────────────────────────
-- 2. QUOTE SUBMISSIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quote_submissions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number  TEXT UNIQUE DEFAULT 'QT-' || to_char(NOW(),'YYYYMMDD') || '-' || lpad(floor(random()*9000+1000)::text,4,'0'),
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  mobile            TEXT NOT NULL,
  from_city         TEXT,
  to_city           TEXT,
  from_pincode      TEXT,
  to_pincode        TEXT,
  move_type         TEXT,
  move_date         DATE,
  items             JSONB DEFAULT '[]',
  message           TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','reviewed','quoted','confirmed','in_progress','completed','cancelled')),
  status_message    TEXT,
  source            TEXT DEFAULT 'website',
  assigned_to       UUID REFERENCES admins(id) ON DELETE SET NULL,
  whatsapp_sent     BOOLEAN DEFAULT false,
  email_sent        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE quote_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit quotes"      ON quote_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can track own quote"    ON quote_submissions FOR SELECT USING (true);
CREATE POLICY "Admins full access on quotes"  ON quote_submissions FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 3. SERVICE INQUIRIES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_inquiries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT UNIQUE DEFAULT 'SI-' || to_char(NOW(),'YYYYMMDD') || '-' || lpad(floor(random()*9000+1000)::text,4,'0'),
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  mobile           TEXT NOT NULL,
  service_type     TEXT,
  message          TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','reviewed','quoted','confirmed','in_progress','completed','cancelled')),
  status_message   TEXT,
  source           TEXT DEFAULT 'website',
  assigned_to      UUID REFERENCES admins(id) ON DELETE SET NULL,
  whatsapp_sent    BOOLEAN DEFAULT false,
  email_sent       BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE service_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public submit inquiries"    ON service_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public track inquiry"       ON service_inquiries FOR SELECT USING (true);
CREATE POLICY "Admins full on inquiries"   ON service_inquiries FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 4. CONSIGNMENTS (with real-time tracking)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consignments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lr_number         TEXT UNIQUE NOT NULL DEFAULT 'LR-' || to_char(NOW(),'YYYYMMDD') || '-' || lpad(floor(random()*9000+1000)::text,4,'0'),
  customer_name     TEXT NOT NULL,
  customer_phone    TEXT,
  customer_email    TEXT,
  from_city         TEXT NOT NULL,
  to_city           TEXT NOT NULL,
  from_address      TEXT,
  to_address        TEXT,
  status            TEXT NOT NULL DEFAULT 'booked'
                    CHECK (status IN ('booked','picked_up','in_transit','out_for_delivery','delivered','cancelled')),
  current_location  TEXT,
  current_lat       NUMERIC,
  current_lng       NUMERIC,
  estimated_delivery DATE,
  actual_delivery    DATE,
  items_description TEXT,
  weight_kg         NUMERIC,
  amount            NUMERIC DEFAULT 0,
  payment_status    TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','partial','paid')),
  notes             TEXT,
  assigned_team     TEXT,
  tracking_events   JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE consignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can track consignment"     ON consignments FOR SELECT USING (true);
CREATE POLICY "Admins full access consignments"  ON consignments FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 5. CONTACT MESSAGES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public submit contact"       ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read all contacts"    ON contact_messages FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 6. NEWSLETTER SUBSCRIBERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  source        TEXT DEFAULT 'website',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public subscribe newsletter"    ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage newsletter"       ON newsletter_subscribers FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 7. BLOG POSTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  content      TEXT,
  excerpt      TEXT,
  cover_image  TEXT,
  author       TEXT DEFAULT 'Panya Global',
  tags         TEXT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  views        INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published blogs"  ON blog_posts FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "Admins manage blogs"          ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 8. TESTIMONIALS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  rating      INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review      TEXT NOT NULL,
  city        TEXT,
  service     TEXT,
  photo_url   TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  source      TEXT DEFAULT 'website',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public submit testimonials"    ON testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read approved"          ON testimonials FOR SELECT USING (is_approved = true OR auth.role() = 'authenticated');
CREATE POLICY "Admins manage testimonials"    ON testimonials FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 9. CRM LEADS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT NOT NULL,
  source          TEXT,
  stage           TEXT NOT NULL DEFAULT 'new'
                  CHECK (stage IN ('new','contacted','qualified','quoted','won','lost')),
  priority        TEXT NOT NULL DEFAULT 'medium'
                  CHECK (priority IN ('low','medium','high','urgent')),
  assigned_to     UUID REFERENCES admins(id) ON DELETE SET NULL,
  notes           TEXT,
  move_from       TEXT,
  move_to         TEXT,
  move_date       DATE,
  estimated_value NUMERIC,
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage CRM leads" ON crm_leads FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 10. INVOICES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE DEFAULT 'INV-' || to_char(NOW(),'YYYY') || '-' || lpad(floor(random()*9000+1000)::text,4,'0'),
  lead_id        UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
  client_name    TEXT NOT NULL,
  client_email   TEXT,
  client_phone   TEXT,
  client_address TEXT,
  client_gst     TEXT,
  items          JSONB NOT NULL DEFAULT '[]',
  subtotal       NUMERIC NOT NULL DEFAULT 0,
  tax_percent    NUMERIC NOT NULL DEFAULT 18,
  tax_amount     NUMERIC NOT NULL DEFAULT 0,
  total          NUMERIC NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  due_date       DATE,
  notes          TEXT,
  payment_link   TEXT,
  paid_at        TIMESTAMPTZ,
  created_by     UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage invoices" ON invoices FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 11. PAYMENTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id          UUID REFERENCES invoices(id) ON DELETE SET NULL,
  consignment_id      UUID REFERENCES consignments(id) ON DELETE SET NULL,
  amount              NUMERIC NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'INR',
  method              TEXT,
  gateway             TEXT DEFAULT 'razorpay',
  gateway_order_id    TEXT,
  gateway_payment_id  TEXT UNIQUE,
  gateway_signature   TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','success','failed','refunded')),
  customer_name       TEXT,
  customer_email      TEXT,
  customer_phone      TEXT,
  notes               JSONB DEFAULT '{}',
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can create payment"   ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage payments"      ON payments FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 12. EXPENSES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  amount      NUMERIC NOT NULL,
  category    TEXT,
  job_id      UUID,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  receipt_url TEXT,
  created_by  UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage expenses" ON expenses FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 13. FOLLOW UPS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follow_ups (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id      UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  type         TEXT NOT NULL DEFAULT 'call'
               CHECK (type IN ('call','email','whatsapp','visit')),
  notes        TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','done','missed','rescheduled')),
  created_by   UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage followups" ON follow_ups FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 14. ACTIVITY LOGS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id         UUID REFERENCES admins(id) ON DELETE SET NULL,
  admin_email      TEXT,
  admin_name       TEXT,
  action           TEXT NOT NULL,
  entity_type      TEXT,
  entity_id        TEXT,
  entity_reference TEXT,
  details          JSONB,
  ip_address       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read activity logs" ON activity_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "System can insert logs"    ON activity_logs FOR INSERT WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────
-- 15. VISITOR ANALYTICS (replaces PHP visitor log)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitor_analytics (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id   TEXT,
  page         TEXT NOT NULL,
  referrer     TEXT,
  ip           TEXT,
  country      TEXT,
  country_code TEXT,
  city         TEXT,
  device       TEXT,
  browser      TEXT,
  os           TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE visitor_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log visits"    ON visitor_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read analytics"    ON visitor_analytics FOR SELECT USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 16. ANALYTICS EVENTS (event tracking system)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  TEXT,
  event_type  TEXT NOT NULL,  -- 'click','form_submit','page_view','download','whatsapp_click'
  event_name  TEXT NOT NULL,  -- 'quote_submit','contact_form','brochure_download'
  page        TEXT,
  properties  JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can track events"  ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read events"       ON analytics_events FOR SELECT USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 17. BROCHURE DOWNLOADS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brochure_downloads (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT,
  email      TEXT NOT NULL,
  phone      TEXT,
  company    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE brochure_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public submit brochure download" ON brochure_downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read brochure downloads"  ON brochure_downloads FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- INDEXES for performance
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_quotes_status      ON quote_submissions(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created     ON quote_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_ref         ON quote_submissions(reference_number);
CREATE INDEX IF NOT EXISTS idx_inquiries_status   ON service_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created  ON service_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consignments_lr    ON consignments(lr_number);
CREATE INDEX IF NOT EXISTS idx_consignments_status ON consignments(status);
CREATE INDEX IF NOT EXISTS idx_contacts_read      ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_blogs_slug         ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published    ON blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session  ON visitor_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page     ON visitor_analytics(page);
CREATE INDEX IF NOT EXISTS idx_events_type        ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_payments_gateway   ON payments(gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage        ON crm_leads(stage);

-- ──────────────────────────────────────────────────────────────
-- REALTIME (enable for live tracking)
-- ──────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE consignments;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE quote_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_events;

-- ──────────────────────────────────────────────────────────────
-- STORAGE BUCKETS (run in Supabase Storage settings OR via SQL)
-- ──────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES
  ('testimonial-photos', 'testimonial-photos', true),
  ('blog-images',        'blog-images',        true),
  ('brochures',          'brochures',          true),
  ('documents',          'documents',          false),
  ('uploads',            'uploads',            false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read testimonial photos" ON storage.objects FOR SELECT USING (bucket_id = 'testimonial-photos');
CREATE POLICY "Admins upload testimonial photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'testimonial-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Public read blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Admins upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public read brochures" ON storage.objects FOR SELECT USING (bucket_id = 'brochures');
CREATE POLICY "Admins upload brochures" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brochures' AND auth.role() = 'authenticated');

CREATE POLICY "Admins manage documents" ON storage.objects FOR ALL USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
CREATE POLICY "Admins manage uploads"   ON storage.objects FOR ALL USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- INSERT YOUR ADMIN USER
-- Replace with your actual Supabase Auth UUID
-- Get it from: Authentication → Users → Your user's ID
-- ──────────────────────────────────────────────────────────────
-- INSERT INTO admins (id, email, name, role, permissions) VALUES
--   ('YOUR-SUPABASE-AUTH-USER-UUID-HERE', 'vishnu.kumar@panyaglobal.in', 'Vishnu Kumar', 'super_admin', '{}')
-- ON CONFLICT (email) DO UPDATE SET role = 'super_admin', is_active = true;

-- ──────────────────────────────────────────────────────────────
-- SAMPLE DATA (for testing — remove before production)
-- ──────────────────────────────────────────────────────────────
INSERT INTO consignments (lr_number, customer_name, customer_phone, from_city, to_city, status, estimated_delivery, items_description, amount)
VALUES
  ('LR-20260521-1001', 'Rahul Sharma', '9876543210', 'Delhi', 'Mumbai', 'in_transit', CURRENT_DATE + 3, 'Household goods - 2BHK', 45000),
  ('LR-20260521-1002', 'Priya Singh', '9871234567', 'Bangalore', 'Hyderabad', 'picked_up', CURRENT_DATE + 2, 'Office equipment', 28000),
  ('LR-20260521-1003', 'Amit Kumar', '9988776655', 'Chennai', 'Pune', 'delivered', CURRENT_DATE - 1, 'Personal items', 15000)
ON CONFLICT (lr_number) DO NOTHING;

SELECT 'Schema created successfully! ✅' as result;
