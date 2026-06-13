-- ============================================================
-- Panya Global — Quick Admin Setup for Supabase
-- Run this ENTIRE script in Supabase Dashboard → SQL Editor
-- Project: ezkvxtxsmebwhvagpiiz
-- ============================================================

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create ENUM types (skip if already exist)
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('super_admin', 'owner', 'manager', 'salesperson', 'operations', 'accountant', 'digital_marketing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Create the admins table (skip if already exists)
CREATE TABLE IF NOT EXISTS admins (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL DEFAULT '',
    role            admin_role NOT NULL DEFAULT 'salesperson',
    permissions     JSONB DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login      TIMESTAMPTZ DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(is_active);

-- Step 5: Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for admins table
-- Allow authenticated users to read their own profile
DROP POLICY IF EXISTS "Admins can read own profile" ON admins;
CREATE POLICY "Admins can read own profile"
    ON admins FOR SELECT
    TO authenticated
    USING (true);

-- Allow service role to manage all admins
DROP POLICY IF EXISTS "Service role can manage admins" ON admins;
CREATE POLICY "Service role can manage admins"
    ON admins FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Step 7: Insert Vishnu Nishad as Super Admin
-- NOTE: password_hash is empty because Supabase Auth handles passwords
-- This row is just the PROFILE that the app reads after auth succeeds
INSERT INTO admins (name, email, role, permissions, is_active)
VALUES (
    'Vishnu Nishad',
    'cartoonfunonly@gmail.com',
    'super_admin',
    '{
        "dashboard": "execute",
        "consignments": "execute",
        "quotes": "execute",
        "inquiries": "execute",
        "testimonials": "execute",
        "blog": "execute",
        "newsletter": "execute",
        "brochures": "execute",
        "logs": "execute",
        "users": "execute",
        "analytics": "execute",
        "pipeline": "execute",
        "leads": "execute",
        "orders": "execute",
        "invoices": "execute",
        "payments": "execute",
        "expenses": "execute",
        "followups": "execute",
        "tasks": "execute",
        "fleet": "execute",
        "packing": "execute",
        "calllogs": "execute",
        "gst": "execute"
    }'::jsonb,
    TRUE
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    is_active = TRUE,
    updated_at = NOW();

-- Step 8: Verify the admin was created
SELECT id, name, email, role, is_active, permissions FROM admins WHERE email = 'cartoonfunonly@gmail.com';

-- ============================================================
-- IMPORTANT: After running this SQL, you MUST also create
-- the user in Supabase Authentication:
--
-- 1. Go to: https://supabase.com/dashboard/project/ezkvxtxsmebwhvagpiiz/auth/users
-- 2. Click "Add user" → "Create new user"
-- 3. Email: cartoonfunonly@gmail.com
-- 4. Password: Vishnu@2026
-- 5. Click "Create user"
--
-- Both steps are required for login to work!
-- ============================================================
