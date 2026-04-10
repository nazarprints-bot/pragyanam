
-- Fix 1: Restrict lesson-files storage read to enrolled students + teachers/admins
DROP POLICY IF EXISTS "Authenticated read lesson files" ON storage.objects;

CREATE POLICY "Enrolled users read lesson files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-files'
  AND (
    has_role(auth.uid(), 'teacher'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM lessons l
      JOIN chapters ch ON ch.id = l.chapter_id
      JOIN subjects sub ON sub.id = ch.subject_id
      JOIN enrollments e ON e.course_id = sub.course_id
      WHERE e.user_id = auth.uid()
        AND e.status = 'active'
        AND (l.pdf_url LIKE '%' || objects.name || '%' OR l.video_url LIKE '%' || objects.name || '%')
    )
    OR EXISTS (
      SELECT 1
      FROM lessons l
      JOIN chapters ch ON ch.id = l.chapter_id
      JOIN subjects sub ON sub.id = ch.subject_id
      WHERE l.is_free_preview = true
        AND (l.pdf_url LIKE '%' || objects.name || '%' OR l.video_url LIKE '%' || objects.name || '%')
    )
  )
);

-- Fix 2: Split notification INSERT policy
DROP POLICY IF EXISTS "Admins and teachers can create notifications" ON public.notifications;

-- Users can only insert notifications for themselves
CREATE POLICY "Users insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins and teachers can insert notifications for any user
CREATE POLICY "Admins teachers insert any notification"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'teacher'::app_role)
);

-- Fix 3: Remove direct student access to test_questions (they use the RPC instead)
DROP POLICY IF EXISTS "Students see submitted test questions" ON public.test_questions;
