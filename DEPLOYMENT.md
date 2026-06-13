# ============================================================
# Panya Global - Deployment Guide
# Supabase Backend + CPanel Frontend
# ============================================================

## Prerequisites

1. Supabase account with project: `lzrfgqulndlrluwiolni`
2. CPanel hosting account with domain: `panyaglobal.in`
3. Node.js 18+ installed locally
4. XAMPP running (for data migration only)

---

## Phase 1: Supabase Setup (Do First)

### Step 1.1: Create Database Schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `lzrfgqulndlrluwiolni`
3. Navigate to **SQL Editor**
4. Copy the contents of `sql/migrate_to_postgresql.sql`
5. Paste and click **Run**

Expected output: "Migration complete!"

### Step 1.2: Configure Storage Buckets

1. Go to **Storage** in Supabase sidebar
2. Create these buckets:
   - `testimonials` (Public)
   - `blog` (Public)
   - `brochures` (Public)
   - `lr-receipts` (Private)
3. Set up proper policies for each bucket

### Step 1.3: Enable Realtime

1. Go to **Database** → **Replication**
2. Enable tables for realtime:
   - `contact_messages`
   - `quote_submissions`
   - `consignments`
   - `crm_leads`
   - `crm_orders`
   - `chat_messages`

---

## Phase 2: Data Migration (Optional - If you have existing data)

### Step 2.1: Run Data Migration Script

```bash
# Install MySQL client (if not already)
npm install mysql2

# Run the migration script
node scripts/migrate-data.js
```

This generates `sql/data-inserts.sql` with all your existing data.

### Step 2.2: Import Data to Supabase

1. Open `sql/data-inserts.sql` in a text editor
2. Copy the contents
3. Paste into Supabase SQL Editor
4. Click **Run**

### Step 2.3: Reset Admin Passwords

1. Go to **Authentication** → **Users** in Supabase
2. Find your admin user(s)
3. Click **Reset password** or edit the user
4. Set a new password (min 6 characters)
5. Note the email for login later

---

## Phase 3: Frontend Deployment

### Step 3.1: Update Environment Variables

Create `.env.production` in project root:

```env
VITE_SUPABASE_URL=https://lzrfgqulndlrluwiolni.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_i8N5qn8Bc5RGctXbJhgn1g_CAGAGT0Q
VITE_APP_NAME=Panya Global Relocation
VITE_APP_URL=https://panyaglobal.in
```

### Step 3.2: Build Production Bundle

```bash
# Make sure you're in the project directory
cd C:\xampp\htdocs\panyaglobal-local

# Clean previous build
rm -rf dist

# Build production bundle
npm run build
```

This creates a `dist/` folder with optimized static files.

### Step 3.3: Deploy to CPanel

#### Option A: CPanel File Manager

1. Log into CPanel
2. Go to **File Manager**
3. Navigate to `public_html/`
4. Select all files in `dist/` folder locally
5. Upload to `public_html/`

#### Option B: FTP/SFTP

1. Connect to your hosting via FTP client (FileZilla, etc.)
2. Navigate to `public_html/`
3. Upload all files from `dist/` folder
4. Make sure to include hidden files (`.htaccess`)

#### Option C: Git Deployment (if configured)

1. Push to your Git repository
2. Set up auto-deploy from CPanel Terminal or Git hook

### Step 3.4: Upload .htaccess

1. Upload `public_html/.htaccess` to your `public_html/` folder
2. This handles SPA routing and caching

---

## Phase 4: Post-Deployment Verification

### Step 4.1: Test Homepage

Visit: `https://panyaglobal.in`
- Should load without errors
- Check browser console for any issues

### Step 4.2: Test Admin Login

Visit: `https://panyaglobal.in/admin/login`
- Enter your Supabase admin credentials
- Should redirect to `/admin` dashboard

### Step 4.3: Test Key Features

- [ ] Homepage loads
- [ ] Quote form submission
- [ ] Contact form submission
- [ ] Consignment tracking
- [ ] Admin dashboard (if logged in)
- [ ] Blog listing
- [ ] Mobile responsiveness

---

## Troubleshooting

### Issue: "Supabase not configured"

**Solution**: Check that `.env.production` is in the project root and contains correct Supabase URL and key.

### Issue: "Admin login not working"

**Solution**: 
1. Check Supabase Authentication settings
2. Verify email/password in Supabase dashboard
3. Check browser console for CORS errors
4. Verify RLS policies allow auth operations

### Issue: "404 on page refresh"

**Solution**: Ensure `.htaccess` was uploaded to `public_html/`. The SPA fallback rule must be present.

### Issue: "Styles/JS not loading"

**Solution**: 
1. Check browser network tab
2. Verify `dist/assets/` folder was uploaded
3. Check `.htaccess` caching rules

### Issue: "Database connection errors"

**Solution**: This is expected during migration. All data now comes from Supabase, not local MySQL.

---

## After Migration Checklist

- [ ] Schema migration complete
- [ ] Storage buckets created
- [ ] Realtime enabled
- [ ] Admin password reset
- [ ] Production build created
- [ ] Files uploaded to CPanel
- [ ] `.htaccess` uploaded
- [ ] Homepage working
- [ ] Admin login working
- [ ] Forms submitting data

---

## Maintenance

### Supabase (Backend)

- Database: Auto-managed by Supabase
- Backups: Daily automatic (free tier)
- Storage: Monitor usage (1GB limit)
- Auth: Manage users in dashboard

### CPanel (Frontend)

- Monitor disk usage
- Update SSL certificate (Let's Encrypt auto-renews)
- Check error logs if issues arise

---

## Support

For Supabase issues: [Supabase Docs](https://supabase.com/docs)
For CPanel issues: Contact your hosting provider
For custom development: Open an issue or contact developer

---

**Last Updated**: May 2026
**Version**: 2.0 (Supabase Migration)