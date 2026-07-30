import { createClient } from './client'

/**
 * Get public URL for a file in Supabase Storage
 */
export function getStorageUrl(bucket: string, path: string): string {
  const supabase = createClient()
  if (!supabase) return ''
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Get resume URL from Supabase Storage
 */
export function getResumeUrl(filename: string = 'resume.pdf'): string {
  return getStorageUrl('resumes', filename)
}
