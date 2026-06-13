#!/usr/bin/env node
/**
 * Data Migration Script: MySQL → PostgreSQL (via Supabase)
 * 
 * This script connects to your local MySQL database, extracts all data,
 * and generates PostgreSQL-compatible INSERT statements.
 * 
 * Usage:
 *   1. Ensure MySQL is running locally (XAMPP)
 *   2. Run: node scripts/migrate-data.js
 *   3. Copy output from sql/data-inserts.sql
 *   4. Paste into Supabase SQL Editor
 * 
 * Prerequisites:
 *   npm install mysql2
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASS || '',
  database: process.env.MYSQL_DB || 'panyaglobal_db',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
};

const OUTPUT_FILE = path.join(__dirname, '..', 'sql', 'data-inserts.sql');

// Tables and their column mappings (MySQL → PostgreSQL)
const TABLE_MAPPINGS = {
  admins: {
    columns: ['id', 'name', 'email', 'password_hash', 'role', 'permissions', 'is_active', 'last_login', 'created_at', 'updated_at'],
    transform: {
      is_active: (val) => val === 1 || val === true ? true : false,
      permissions: (val) => typeof val === 'string' ? val : JSON.stringify(val),
    },
  },
  blog_posts: {
    columns: ['id', 'title', 'slug', 'excerpt', 'content', 'featured_image', 'author', 'category', 'tags', 'meta_title', 'meta_description', 'status', 'published_at', 'created_at', 'updated_at'],
    transform: {
      tags: (val) => typeof val === 'string' ? val : JSON.stringify(val),
    },
  },
  consignments: {
    columns: ['id', 'reference_number', 'customer_name', 'customer_email', 'customer_phone', 'pickup_address', 'pickup_city', 'drop_address', 'drop_city', 'shipping_date', 'delivery_date', 'property_type', 'load_type', 'estimated_weight', 'distance_km', 'base_price', 'gst_amount', 'total_amount', 'payment_status', 'lr_number', 'vehicle_number', 'status', 'notes', 'tracking_url', 'created_at', 'updated_at'],
    transform: {
      payment_status: (val) => val || 'pending',
      status: (val) => val || 'pending',
    },
  },
  quote_submissions: {
    columns: ['id', 'reference_number', 'name', 'email', 'phone', 'service_type', 'pickup_city', 'drop_city', 'moving_date', 'property_type', 'message', 'source', 'status', 'status_message', 'admin_notes', 'created_at', 'updated_at'],
    transform: {
      status: (val) => val || 'pending',
    },
  },
  service_inquiries: {
    columns: ['id', 'reference_number', 'name', 'email', 'phone', 'service_type', 'city', 'message', 'source', 'status', 'status_message', 'admin_notes', 'created_at', 'updated_at'],
    transform: {
      status: (val) => val || 'pending',
    },
  },
  contact_messages: {
    columns: ['id', 'name', 'email', 'phone', 'subject', 'message', 'is_read', 'read_at', 'created_at'],
    transform: {
      is_read: (val) => val === 1 || val === true ? true : false,
    },
  },
  testimonials: {
    columns: ['id', 'name', 'email', 'rating', 'message', 'photo_url', 'designation', 'company', 'source', 'status', 'is_featured', 'created_at', 'updated_at'],
    transform: {
      is_featured: (val) => val === 1 || val === true ? true : false,
    },
  },
  newsletter_subscribers: {
    columns: ['id', 'email', 'is_active', 'subscribed_at', 'unsubscribed_at'],
    transform: {
      is_active: (val) => val === 1 || val === true ? true : false,
    },
  },
  brochure_downloads: {
    columns: ['id', 'name', 'email', 'phone', 'company', 'ip_address', 'user_agent', 'created_at'],
  },
  chat_conversations: {
    columns: ['id', 'session_id', 'user_name', 'user_email', 'is_active', 'created_at', 'ended_at'],
    transform: {
      is_active: (val) => val === 1 || val === true ? true : false,
    },
  },
  chat_messages: {
    columns: ['id', 'conversation_id', 'message', 'sender', 'metadata', 'created_at'],
    transform: {
      metadata: (val) => typeof val === 'string' ? val : JSON.stringify(val),
    },
  },
  visitor_logs: {
    columns: ['id', 'ip_address', 'country', 'city', 'region', 'latitude', 'longitude', 'timezone', 'postal_code', 'browser', 'browser_version', 'os', 'os_version', 'device', 'is_mobile', 'is_bot', 'referrer', 'current_url', 'session_id', 'created_at'],
    transform: {
      is_mobile: (val) => val === 1 || val === true ? true : false,
      is_bot: (val) => val === 1 || val === true ? true : false,
    },
  },
  crm_leads: {
    columns: ['id', 'quotation_id', 'customer_name', 'phone', 'email', 'pickup_city', 'drop_city', 'shipping_date', 'property_type', 'load_type', 'salesperson_id', 'status', 'lead_source', 'estimated_amount', 'notes', 'sheets_row_id', 'created_at', 'updated_at'],
    transform: {
      status: (val) => val || 'enquiry',
    },
  },
  crm_orders: {
    columns: ['id', 'lead_id', 'order_number', 'pickup_address', 'pickup_floor', 'pickup_lift', 'drop_address', 'drop_floor', 'drop_lift', 'eta', 'team_assigned', 'special_instructions', 'status', 'sheets_row_id', 'created_at', 'updated_at'],
    transform: {
      status: (val) => val || 'scheduled',
      pickup_lift: (val) => val || 'na',
      drop_lift: (val) => val || 'na',
    },
  },
  crm_invoices: {
    columns: ['id', 'order_id', 'invoice_number', 'amount', 'gst_rate', 'gst_amount', 'total_amount', 'payment_status', 'due_date', 'notes', 'sheets_row_id', 'created_at', 'updated_at'],
    transform: {
      payment_status: (val) => val || 'pending',
    },
  },
  crm_payments: {
    columns: ['id', 'invoice_id', 'amount', 'payment_method', 'transaction_id', 'payment_date', 'notes', 'created_at'],
    transform: {
      payment_method: (val) => val || 'upi',
    },
  },
  crm_expenses: {
    columns: ['id', 'category', 'description', 'amount', 'expense_date', 'order_id', 'vendor_name', 'invoice_ref', 'created_by', 'created_at'],
  },
  crm_follow_ups: {
    columns: ['id', 'lead_id', 'customer_name', 'customer_phone', 'scheduled_date', 'follow_up_type', 'notes', 'status', 'completed_at', 'assigned_to', 'created_at', 'updated_at'],
    transform: {
      status: (val) => val || 'pending',
    },
  },
  crm_team_tasks: {
    columns: ['id', 'title', 'description', 'priority', 'status', 'assigned_to', 'due_date', 'completed_at', 'order_id', 'created_by', 'created_at', 'updated_at'],
    transform: {
      priority: (val) => val || 'medium',
      status: (val) => val || 'pending',
    },
  },
  crm_fleet: {
    columns: ['id', 'vehicle_type', 'vehicle_number', 'driver_name', 'driver_phone', 'capacity_tons', 'current_location', 'status', 'created_at', 'updated_at'],
    transform: {
      vehicle_type: (val) => val || 'truck',
      status: (val) => val || 'available',
    },
  },
  crm_packing_lists: {
    columns: ['id', 'order_id', 'item_name', 'quantity', 'packed', 'loaded', 'delivered', 'notes', 'created_at'],
    transform: {
      packed: (val) => val === 1 || val === true ? true : false,
      loaded: (val) => val === 1 || val === true ? true : false,
      delivered: (val) => val === 1 || val === true ? true : false,
    },
  },
  crm_call_logs: {
    columns: ['id', 'lead_id', 'customer_name', 'customer_phone', 'call_duration', 'call_type', 'call_status', 'notes', 'recording_url', 'called_by', 'created_at'],
    transform: {
      call_type: (val) => val || 'outbound',
      call_status: (val) => val || 'completed',
    },
  },
  user_roles: {
    columns: ['id', 'admin_id', 'module', 'permission', 'created_at'],
    transform: {
      permission: (val) => val || 'read',
    },
  },
  activity_logs: {
    columns: ['id', 'admin_id', 'admin_email', 'admin_name', 'action', 'entity_type', 'entity_id', 'entity_reference', 'details', 'ip_address', 'created_at'],
    transform: {
      details: (val) => typeof val === 'string' ? val : JSON.stringify(val),
    },
  },
};

// Tables to skip (not needed in PostgreSQL)
const SKIP_TABLES = ['login_attempts'];

// Order of table insertion (parent tables first for foreign keys)
const INSERT_ORDER = [
  'admins',
  'user_roles',
  'blog_posts',
  'newsletter_subscribers',
  'brochure_downloads',
  'chat_conversations',
  'chat_messages',
  'visitor_logs',
  'quote_submissions',
  'service_inquiries',
  'contact_messages',
  'testimonials',
  'consignments',
  'crm_leads',
  'crm_orders',
  'crm_invoices',
  'crm_payments',
  'crm_expenses',
  'crm_follow_ups',
  'crm_team_tasks',
  'crm_fleet',
  'crm_packing_lists',
  'crm_call_logs',
  'activity_logs',
];

// ─── Helper Functions ───────────────────────────────────────

function formatValue(val) {
  if (val === null || val === undefined) {
    return 'NULL';
  }
  if (typeof val === 'boolean') {
    return val ? 'true' : 'false';
  }
  if (typeof val === 'number') {
    return String(val);
  }
  if (typeof val === 'string') {
    // Escape single quotes and special characters
    const escaped = val.replace(/'/g, "''").replace(/\\/g, '\\\\');
    return `'${escaped}'`;
  }
  // For objects/arrays, stringify and escape
  const jsonStr = JSON.stringify(val).replace(/'/g, "''");
  return `'${jsonStr}'`;
}

function convertDate(val) {
  if (!val) return 'NULL';
  // MySQL DATETIME format: '2024-01-15 10:30:00'
  // PostgreSQL TIMESTAMPTZ format: '2024-01-15 10:30:00+05:30'
  // Just use the value as-is since Supabase will interpret it
  if (typeof val === 'string') {
    // If it has timezone, use as-is
    if (val.includes('+') || val.includes('Z')) {
      return `'${val}'`;
    }
    // Add timezone for MySQL datetime
    return `'${val}+05:30'`;
  }
  return 'NULL';
}

function buildInsertStatement(table, rows, mapping) {
  if (!rows || rows.length === 0) {
    return `-- No data for ${table}\n`;
  }

  const columns = mapping?.columns || Object.keys(rows[0]);
  const lines = [`\n-- ${table} (${rows.length} rows)`];
  
  for (const row of rows) {
    const values = columns.map((col) => {
      let val = row[col];
      
      // Apply transformations if defined
      if (mapping?.transform && mapping.transform[col]) {
        val = mapping.transform[col](val);
      }
      
      // Handle date conversion
      if (col === 'created_at' || col === 'updated_at' || col === 'last_login' || 
          col === 'published_at' || col === 'read_at' || col === 'ended_at' ||
          col === 'scheduled_date' || col === 'completed_at' || col === 'due_date' ||
          col === 'payment_date' || col === 'expense_date' || col === 'eta' ||
          col === 'shipping_date' || col === 'delivery_date' || col === 'moving_date') {
        return convertDate(val);
      }
      
      return formatValue(val);
    });
    
    lines.push(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});`);
  }
  
  return lines.join('\n');
}

// ─── Main Migration Function ───────────────────────────────

async function migrate() {
  console.log('🚀 Starting MySQL → PostgreSQL data migration...\n');
  
  let connection;
  const output = [];
  
  try {
    // Connect to MySQL
    console.log(`📡 Connecting to MySQL at ${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}...`);
    connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Connected to MySQL\n');
    
    // Header
    output.push('-- ============================================================');
    output.push('-- Data Migration: MySQL → PostgreSQL');
    output.push(`-- Generated: ${new Date().toISOString()}`);
    output.push('-- ============================================================\n');
    output.push('-- IMPORTANT: Run sql/migrate_to_postgresql.sql schema first!');
    output.push('-- This file contains data INSERT statements only.\n');
    output.push('-- Review and run in Supabase SQL Editor.\n');
    output.push('');
    
    // Migrate each table in order
    for (const table of INSERT_ORDER) {
      if (SKIP_TABLES.includes(table)) {
        console.log(`⏭️  Skipping ${table}...`);
        continue;
      }
      
      const mapping = TABLE_MAPPINGS[table];
      
      try {
        console.log(`📦 Migrating ${table}...`);
        
        // Get all rows from MySQL
        const [rows] = await connection.execute(`SELECT * FROM ${table}`);
        
        if (rows.length === 0) {
          console.log(`   ⏭️  No data found in ${table}`);
          output.push(`\n-- ${table}: No data`);
          continue;
        }
        
        console.log(`   Found ${rows.length} rows`);
        
        // Generate INSERT statements
        const insertSQL = buildInsertStatement(table, rows, mapping);
        output.push(insertSQL);
        
        console.log(`   ✅ ${rows.length} INSERT statements generated`);
      } catch (err) {
        console.log(`   ⚠️  Error migrating ${table}: ${err.message}`);
        output.push(`\n-- ERROR in ${table}: ${err.message}`);
      }
    }
    
    // Footer
    output.push('\n-- ============================================================');
    output.push('-- End of data migration');
    output.push('-- ============================================================');
    
    // Write output file
    fs.writeFileSync(OUTPUT_FILE, output.join('\n'), 'utf8');
    
    console.log('\n✅ Migration complete!');
    console.log(`📄 Output written to: ${OUTPUT_FILE}`);
    console.log('\n📋 Next steps:');
    console.log('   1. Review the generated SQL file');
    console.log('   2. Run in Supabase SQL Editor');
    console.log('   3. Verify data in Supabase Dashboard');
    console.log('   4. Reset admin passwords in Supabase Authentication');
    console.log('   5. Deploy the frontend to CPanel');
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error('\nMake sure MySQL is running and credentials are correct.');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 MySQL connection closed.');
    }
  }
}

// ─── Run Migration ──────────────────────────────────────────

migrate().catch(console.error);