-- ============================================================================
-- Migration 00000: Create Personal Info Table
-- Description: Creates the table for storing core developer profile details.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.personal_info (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    location TEXT,
    professional_summary TEXT,
    profile_image_url TEXT,
    github_url TEXT,
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.personal_info IS 'Stores personal profile information displayed in the AboutPanel';
