
-- Fix 1: Restrict teacher access to profiles
-- Drop the overly permissive teacher policy
DROP POLICY IF EXISTS "Teachers see all profiles" ON public.profiles;

-- Create a restricted policy: teachers can only see profiles of students enrolled in their courses
CREATE POLICY "Teachers see enrolled student profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND (
    -- Teachers can always see their own profile
    profiles.user_id = auth.uid()
    -- Teachers can see profiles of students enrolled in courses they created
    OR EXISTS (
      SELECT 1
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.user_id = profiles.user_id
        AND c.created_by = auth.uid()
    )
    -- Teachers can see other teacher profiles
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = profiles.user_id AND ur.role = 'teacher'::app_role
    )
  )
);

-- Fix 2: Restrict live classes visibility
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated can view live classes" ON public.live_classes;

-- Teachers and admins can see all live classes
CREATE POLICY "Teachers and admins view all live classes"
ON public.live_classes
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Students can see live classes for courses they're enrolled in, or general classes
CREATE POLICY "Students view enrolled course live classes"
ON public.live_classes
FOR SELECT
TO authenticated
USING (
  course_id IS NULL
  OR EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.user_id = auth.uid()
      AND e.course_id = live_classes.course_id
      AND e.status = 'active'
  )
);
