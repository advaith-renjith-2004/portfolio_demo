-- Migration: Add missing columns to personal_info table for profile data
-- These columns support the AboutPanel component

ALTER TABLE public.personal_info
ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS github_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS resume_url VARCHAR(255);

COMMENT ON TABLE public.personal_info IS 'Stores personal profile information displayed in the AboutPanel';
