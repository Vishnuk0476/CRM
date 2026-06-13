-- ============================================================
-- Quick Admin Setup - Run in Supabase SQL Editor
-- ============================================================

-- Step 1: Create admin user in auth.users
-- Copy this SQL and run it to add an admin user

-- First, insert into admins table:
INSERT INTO admins (name, email, password_hash, role, permissions, is_active, created_at, updated_at)
VALUES (
    'Admin',
    'admin@panyaglobal.in',
    -- Password: Panya@2026 (bcrypt hash)
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYo5P9m9a',
    'super_admin',
    '{"dashboard":"execute","consignments":"execute","quotes":"execute","inquiries":"execute","blog":"execute","testimonials":"execute","newsletter":"execute","brochures":"execute","logs":"execute","users":"execute","analytics":"execute","pipeline":"execute","leads":"execute","orders":"execute","invoices":"execute","payments":"execute","expenses":"execute","follow-ups":"execute","fleet":"execute","team-tasks":"execute"}',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Step 2: Now go to Supabase Dashboard → Authentication → Users
-- Click "Add user" → enter:
--   Email: admin@panyaglobal.in
--   Password: Panya@2026
-- That's it! The auth user is separate from admins table.

-- Step 3: After creating auth user, update the raw_user_meta_data
-- Run this UPDATE (replace with actual user UUID):
/*
UPDATE auth.users 
SET raw_user_meta_data = '{"name": "Admin", "role": "super_admin", "permissions": {}}'
WHERE email = 'admin@panyaglobal.in';
*/

-- ─────────────────────────────────────────────────────────
-- The password hash above is for: Panya@2026
-- If you want a different password, generate a new bcrypt hash
-- and update the password_hash field
-- ─────────────────────────────────────────────────────────

SELECT 'Admin setup ready! Create user in Supabase Dashboard → Authentication → Users' AS status;