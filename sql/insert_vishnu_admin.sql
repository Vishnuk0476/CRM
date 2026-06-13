-- Admin user for vishnu.kumar@panyaglobal.in
-- Password hash is placeholder since we use Supabase Auth
INSERT INTO admins (name, email, password_hash, role, permissions, is_active, created_at, updated_at)
VALUES (
    'Vishnu Nishad',
    'vishnu.kumar@panyaglobal.in',
    '$2b$12$placeholder_hash_for_supabase_auth',
    'super_admin',
    '{"dashboard":"execute","consignments":"execute","quotes":"execute","inquiries":"execute","blog":"execute","testimonials":"execute","newsletter":"execute","brochures":"execute","logs":"execute","users":"execute","analytics":"execute","pipeline":"execute","leads":"execute","orders":"execute","invoices":"execute","payments":"execute","expenses":"execute","follow-ups":"execute","fleet":"execute","team-tasks":"execute"}',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = 'Vishnu Nishad',
    role = 'super_admin',
    permissions = '{"dashboard":"execute","consignments":"execute","quotes":"execute","inquiries":"execute","blog":"execute","testimonials":"execute","newsletter":"execute","brochures":"execute","logs":"execute","users":"execute","analytics":"execute","pipeline":"execute","leads":"execute","orders":"execute","invoices":"execute","payments":"execute","expenses":"execute","follow-ups":"execute","fleet":"execute","team-tasks":"execute"}',
    is_active = true,
    updated_at = NOW();