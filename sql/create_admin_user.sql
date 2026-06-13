-- ============================================================
-- Create Admin User in Supabase
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Create the admin user via Supabase Auth
-- Replace 'admin@panyaglobal.in' and 'Panya@2026' with your desired credentials

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    banned_until,
    is_super_admin
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@panyaglobal.in',
    -- This will be set by Supabase when you set password via dashboard
    'placeholder',
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin User","role":"super_admin"}',
    NOW(),
    NOW(),
    NULL,
    NULL
);

-- OR use this simpler approach - just insert with email and set password via dashboard:

-- Actually, the easiest way is:
-- 1. Go to Supabase Dashboard → Authentication → Users → Add User
-- 2. Enter email: admin@panyaglobal.in
-- 3. Enter password: Panya@2026
-- 4. Click Create
-- 5. Then run the UPDATE below to add role metadata:

-- After creating user via dashboard, run this UPDATE (replace USER_ID with actual UUID from Users table):

/*
UPDATE auth.users 
SET raw_user_meta_data = '{"name": "Admin", "role": "super_admin", "permissions": {}}'
WHERE email = 'admin@panyaglobal.in';

-- Also insert into admins table for your app:
INSERT INTO admins (name, email, password_hash, role, permissions, is_active, created_at, updated_at)
VALUES (
    'Admin',
    'admin@panyaglobal.in',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYo5P9m9a', -- This is a placeholder, use real hash
    'super_admin',
    '{"dashboard":"execute","consignments":"execute","quotes":"execute","inquiries":"execute","blog":"execute","testimonials":"execute","newsletter":"execute","brochures":"execute","logs":"execute","users":"execute","analytics":"execute","pipeline":"execute","leads":"execute","orders":"execute","invoices":"execute","payments":"execute","expenses":"execute","follow-ups":"execute","fleet":"execute","team-tasks":"execute"}',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;
*/

-- ─────────────────────────────────────────────────────────
-- SIMPLEST METHOD:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → enter email and password
-- 3. After creating, click on the user → Edit
-- 4. Add to User Metadata:
--    {"name": "Admin", "role": "super_admin", "permissions": {}}
-- 5. Save

-- ─────────────────────────────────────────────────────────
-- OR: Create via SQL with proper password hash

-- First, generate a bcrypt hash (you can use any bcrypt generator)
-- Then insert:

/*
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@panyaglobal.in',
    -- Generate with: node -e "console.log(require('crypto').createHash('sha256').update('Panya@2026').digest('hex'))"
    -- Or use: https://bcrypt-generator.com/
    '$2b$12$YOUR_HASH_HERE',
    NOW(),
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin","role":"super_admin","permissions":{}}',
    NOW(),
    NOW()
);
*/

-- After creating user in Supabase Dashboard, update the admins table:
UPDATE admins 
SET 
    name = 'Admin',
    role = 'super_admin',
    permissions = '{"dashboard":"execute","consignments":"execute","quotes":"execute","inquiries":"execute","blog":"execute","testimonials":"execute","newsletter":"execute","brochures":"execute","logs":"execute","users":"execute","analytics":"execute","pipeline":"execute","leads":"execute","orders":"execute","invoices":"execute","payments":"execute","expenses":"execute","follow-ups":"execute","fleet":"execute","team-tasks":"execute"}',
    is_active = true,
    updated_at = NOW()
WHERE email = 'admin@panyaglobal.in'
RETURNING id, email, role;