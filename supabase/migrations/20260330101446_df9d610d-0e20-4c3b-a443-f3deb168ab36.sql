
-- Storage bucket for course thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('course-thumbnails', 'course-thumbnails', true);

-- Storage bucket for lesson videos/files
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-files', 'lesson-files', true);

-- RLS for course-thumbnails: anyone can read, teachers/admins can upload
CREATE POLICY "Public read course thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'course-thumbnails');
CREATE POLICY "Teachers upload course thumbnails" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-thumbnails' AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Teachers update course thumbnails" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'course-thumbnails' AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Teachers delete course thumbnails" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'course-thumbnails' AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- RLS for lesson-files
CREATE POLICY "Public read lesson files" ON storage.objects FOR SELECT USING (bucket_id = 'lesson-files');
CREATE POLICY "Teachers upload lesson files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lesson-files' AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Teachers update lesson files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'lesson-files' AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Teachers delete lesson files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'lesson-files' AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- Allow teachers to also delete their own courses
CREATE POLICY "Teachers can delete own courses" ON public.courses FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Add teacher enrollment visibility so teachers can see enrollments for their courses
CREATE POLICY "Teachers see course enrollments" ON public.enrollments FOR SELECT TO authenticated USING (
  has_role(auth.uid(), 'teacher'::app_role) AND EXISTS (
    SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.created_by = auth.uid()
  )
);
