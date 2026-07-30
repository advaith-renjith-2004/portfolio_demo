-- ============================================================================
-- Migration 00005: Storage Bucket for Resumes
-- Description: Creates a public storage bucket for resume PDFs
-- ============================================================================

-- Create the resumes bucket (public, PDF only, 10MB limit)
-- Use ON CONFLICT to handle case where bucket already exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    true,
    10485760,
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policy: Allow public read access
DROP POLICY IF EXISTS "Public read access for resumes" ON storage.objects;
CREATE POLICY "Public read access for resumes"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resumes');

-- RLS Policy: Only service role can upload
DROP POLICY IF EXISTS "Service role write access for resumes" ON storage.objects;
CREATE POLICY "Service role write access for resumes"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'resumes'
    AND auth.role() = 'service_role'
);

-- RLS Policy: Only service role can delete
DROP POLICY IF EXISTS "Service role delete access for resumes" ON storage.objects;
CREATE POLICY "Service role delete access for resumes"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'resumes'
    AND auth.role() = 'service_role'
);
