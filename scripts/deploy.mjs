#!/usr/bin/env node
/**
 * Panya Global — cPanel Deployment Script
 * ─────────────────────────────────────────
 * Usage:
 *   node scripts/deploy.mjs
 *
 * What it does:
 * 1. Builds the React app (npm run build)
 * 2. Copies dist/ contents to public_html/
 * 3. Copies PHP API files to public_html/api/
 * 4. Ensures .htaccess is in place for SPA routing
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC_HTML = path.join(ROOT, 'public_html');

// ─── Color helpers ────────────────────────────────────────────
const g = (s) => `\x1b[32m${s}\x1b[0m`;
const r = (s) => `\x1b[31m${s}\x1b[0m`;
const y = (s) => `\x1b[33m${s}\x1b[0m`;
const b = (s) => `\x1b[36m${s}\x1b[0m`;

console.log(b('\n🚀 Panya Global Deployment Script\n'));

// ─── Step 1: Build ────────────────────────────────────────────
console.log(y('📦 Building production bundle...'));
try {
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
  console.log(g('✓ Build complete\n'));
} catch (e) {
  console.error(r('✗ Build failed. Aborting deployment.'));
  process.exit(1);
}

// ─── Step 2: Verify dist exists ───────────────────────────────
if (!fs.existsSync(DIST)) {
  console.error(r('✗ dist/ directory not found. Aborting.'));
  process.exit(1);
}

// ─── Step 3: Clear old static files from public_html ──────────
console.log(y('🧹 Cleaning old dist files from public_html...'));
const keepInPublicHtml = ['api', 'uploads', '.htaccess', '.env', '.env.local', '.env.production', 'documents', 'index.php'];
const entries = fs.readdirSync(PUBLIC_HTML);
for (const entry of entries) {
  if (!keepInPublicHtml.includes(entry)) {
    const fullPath = path.join(PUBLIC_HTML, entry);
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`   removed: ${entry}`);
  }
}
console.log(g('✓ Cleanup done\n'));

// ─── Step 4: Copy dist → public_html ──────────────────────────
console.log(y('📂 Copying dist → public_html...'));
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDir(DIST, PUBLIC_HTML);
console.log(g('✓ Files copied\n'));

// ─── Step 5: Ensure SPA .htaccess is in place ─────────────────
const htaccessPath = path.join(PUBLIC_HTML, '.htaccess');
const spaHtaccess = `Options -MultiViews
RewriteEngine On
RewriteBase /

# Serve API directly (PHP files)
RewriteRule ^api/ - [L]

# Don't rewrite existing files or directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Route everything else to index.php (SEO pre-renderer)
RewriteRule . /index.php [L]

# Security headers
<IfModule mod_headers.c>
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/json "access plus 0 seconds"
</IfModule>
`;

// Only write .htaccess if it doesn't look like a SPA one already
const existing = fs.existsSync(htaccessPath) ? fs.readFileSync(htaccessPath, 'utf8') : '';
if (!existing.includes('index.php')) {
  fs.writeFileSync(htaccessPath, spaHtaccess);
  console.log(g('✓ SPA .htaccess written\n'));
} else {
  console.log(y('ℹ  .htaccess already contains SPA routing to index.php — skipped\n'));
}

// ─── Done ─────────────────────────────────────────────────────
console.log(g('🎉 Deployment complete! Upload the contents of public_html/ to your cPanel public_html.\n'));
console.log(b('Next steps:'));
console.log('  1. FTP/SFTP the public_html/ folder to your hosting');
console.log('  2. Make sure public_html/api/.env is configured on the server');
console.log('  3. Ensure the MySQL DB is created and tables are imported');
console.log('  4. Run the Supabase schema SQL in your Supabase project\n');
