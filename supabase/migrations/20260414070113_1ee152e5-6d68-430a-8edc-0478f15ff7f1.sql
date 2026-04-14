-- 1. Drop and recreate teacher_profiles view to exclude sensitive fields
DROP VIEW IF EXISTS public.teacher_profiles;
CREATE VIEW public.teacher_profiles AS
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

-- 2. Fix user_roles: teachers should NOT see all roles, only their enrolled students' roles
DROP POLICY IF EXISTS "Teachers can view student roles" ON public.user_roles;
CREATE POLICY "Teachers can view enrolled student roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role) AND (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.user_id = user_roles.user_id AND c.created_by = auth.uid()
    )
  )
);

-- 3. Fix profiles: "Students can see teacher profiles" exposes too much data
-- Students should use the teacher_profiles view instead
DROP POLICY IF EXISTS "Students can see teacher profiles" ON public.profiles;
