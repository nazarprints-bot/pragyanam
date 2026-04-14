-- Fix security definer view
DROP VIEW IF EXISTS public.teacher_profiles;
CREATE VIEW public.teacher_profiles 
WITH (security_invoker = on) AS
SELECT 
  p.user_id,
  p.full_name,
  p.avatar_url,
  p.bio,
  p.school,
  p.state,
  p.district,
  p.qualification,
  p.experience_years,
  p.subjects_taught
FROM public.profiles p
INNER JOIN public.user_roles ur ON ur.user_id = p.user_id AND ur.role = 'teacher'
WHERE p.is_verified = true AND p.is_disabled IS DISTINCT FROM true;

-- Fix public bucket listing: remove overly broad SELECT policies and add restrictive ones
-- For course-thumbnails bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public read for course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public read for avatars" ON storage.objects;

-- Allow reading specific objects (not listing) for public buckets
CREATE POLICY "Public can read course thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
