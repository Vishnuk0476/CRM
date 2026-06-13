-- ============================================================
-- Panya Global — Supabase Schema Extension
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── 1. visitor_events — IPstack geo + event tracking ────────
CREATE TABLE IF NOT EXISTS visitor_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page            TEXT,
  referrer        TEXT,
  event_type      TEXT NOT NULL DEFAULT 'pageview',  -- pageview | quote_click | track_search | whatsapp_click | call_click | form_submit | brochure_download | pay_click
  city            TEXT,
  region          TEXT,
  country         TEXT,
  country_code    TEXT,
  latitude        NUMERIC(10, 6),
  longitude       NUMERIC(10, 6),
  ip_address      TEXT,
  device_type     TEXT,  -- mobile | tablet | desktop
  user_agent      TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast analytics queries
CREATE INDEX IF NOT EXISTS idx_visitor_events_created_at ON visitor_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_events_event_type ON visitor_events (event_type);
CREATE INDEX IF NOT EXISTS idx_visitor_events_city       ON visitor_events (city);
CREATE INDEX IF NOT EXISTS idx_visitor_events_country    ON visitor_events (country_code);

-- RLS: allow anonymous inserts (tracking is public), admin can read all
ALTER TABLE visitor_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_public_insert_visitor_events"
  ON visitor_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_admin_select_visitor_events"
  ON visitor_events FOR SELECT USING (auth.role() = 'authenticated');

-- ─── 2. Supabase Storage Buckets ─────────────────────────────
-- Run each bucket creation separately if needed.
-- These may fail if buckets already exist — that's OK.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('lr-receipts',  'lr-receipts',  true,  10485760, ARRAY['application/pdf']),
  ('customer-docs','customer-docs', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('blog-images',  'blog-images',  true,   5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('profile-pics', 'profile-pics', true,   2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "public_read_lr_receipts"
  ON storage.objects FOR SELECT USING (bucket_id = 'lr-receipts');
CREATE POLICY "auth_insert_lr_receipts"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lr-receipts');

CREATE POLICY "auth_read_customer_docs"
  ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'customer-docs');
CREATE POLICY "auth_insert_customer_docs"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'customer-docs');

CREATE POLICY "public_read_blog_images"
  ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "auth_insert_blog_images"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "public_read_profile_pics"
  ON storage.objects FOR SELECT USING (bucket_id = 'profile-pics');
CREATE POLICY "auth_insert_profile_pics"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-pics');

-- ─── 3. consignments — Supabase Realtime ─────────────────────
-- Enable Realtime on consignments table so CustomerTracking.tsx
-- can subscribe to live status updates.
-- Run this in Supabase Dashboard → Database → Replication:
-- Or enable via the SQL below:

ALTER PUBLICATION supabase_realtime ADD TABLE consignments;

-- ─── 4. Verify tables exist ───────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
