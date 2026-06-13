-- ============================================================
-- Migration: Add is_active column to admins table
-- Run this against panyaglobal_db
-- ============================================================

USE panyaglobal_db;

-- Add is_active column if it doesn't exist
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1 
  COMMENT '1 = active, 0 = deactivated' 
  AFTER role;

-- Set all existing admins to active by default
UPDATE admins SET is_active = 1 WHERE is_active IS NULL;
