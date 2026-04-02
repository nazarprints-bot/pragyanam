
-- Fix the view to use security invoker
DROP VIEW IF EXISTS public.teacher_profiles;

CREATE VIEW public.teacher_profiles
WITH (security_invoker = on) AS
SELECT p.user_id, p.full_name, p.avatar_url, p.bio, p.school, p.district, p.state
FROM public.profiles p
INNER JOIN public.user_roles ur ON ur.user_id = p.user_id AND ur.role = 'teacher';

-- Students need to see teacher profiles for browsing
-- Add a policy so students can see teacher profiles via the view
CREATE POLICY "Students can see teacher profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = profiles.user_id AND ur.role = 'teacher'
  )
);
