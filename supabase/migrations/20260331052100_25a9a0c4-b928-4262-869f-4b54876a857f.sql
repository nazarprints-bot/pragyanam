
-- Certificates table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  certificate_number text NOT NULL DEFAULT ('PRAG-' || substr(gen_random_uuid()::text, 1, 8)),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can see own certificates
CREATE POLICY "Users see own certificates" ON public.certificates
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- System can insert certificates (via function)
CREATE POLICY "Authenticated can earn certificates" ON public.certificates
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins/teachers can see all
CREATE POLICY "Admins see all certificates" ON public.certificates
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

-- Allow enrollments to be updated (for progress)
CREATE POLICY "Users can update own enrollments" ON public.enrollments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
