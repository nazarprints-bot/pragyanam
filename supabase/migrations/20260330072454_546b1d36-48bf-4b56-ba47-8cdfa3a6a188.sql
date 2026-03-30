CREATE POLICY "Teachers can view student roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role));