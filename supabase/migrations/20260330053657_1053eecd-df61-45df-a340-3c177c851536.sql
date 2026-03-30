
-- Fix permissive notification INSERT policy
DROP POLICY "System can create notifications" ON public.notifications;
CREATE POLICY "Admins and teachers can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher') OR auth.uid() = user_id
);
