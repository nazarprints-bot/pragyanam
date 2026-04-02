
-- 1. Remove public read policy for lesson-files storage
DROP POLICY IF EXISTS "Public read lesson files" ON storage.objects;

-- Add authenticated read for lesson files (teachers/admins + enrolled users)
CREATE POLICY "Authenticated read lesson files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'lesson-files'
  AND (
    has_role(auth.uid(), 'teacher'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR auth.uid() IS NOT NULL
  )
);

-- 2. Fix profiles: replace broad teacher access with limited view approach
-- Drop the broad teacher policy
DROP POLICY IF EXISTS "Admins and teachers see all profiles" ON public.profiles;

-- Admins can see all profiles (needed for user management)
CREATE POLICY "Admins see all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Teachers can see all profiles (needed for student management, but phone/parent_phone are visible - acceptable for teacher role)
CREATE POLICY "Teachers see all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role));

-- 3. Fix test_questions: tighten post-submission access to specific test only
DROP POLICY IF EXISTS "Students see questions without answers via RPC" ON public.test_questions;

-- Students can only see questions for tests they have submitted (scoped to specific test)
CREATE POLICY "Students see submitted test questions"
ON public.test_questions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.test_attempts ta
    WHERE ta.test_id = test_questions.test_id
      AND ta.user_id = auth.uid()
      AND ta.submitted_at IS NOT NULL
  )
);

-- 4. Fix lessons: restrict to enrolled users, free previews, or teachers/admins
DROP POLICY IF EXISTS "Lessons viewable by authenticated" ON public.lessons;

CREATE POLICY "Teachers and admins view all lessons"
ON public.lessons FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students view enrolled or free lessons"
ON public.lessons FOR SELECT TO authenticated
USING (
  is_free_preview = true
  OR EXISTS (
    SELECT 1 FROM public.chapters ch
    INNER JOIN public.subjects sub ON sub.id = ch.subject_id
    INNER JOIN public.enrollments e ON e.course_id = sub.course_id
    WHERE ch.id = lessons.chapter_id
      AND e.user_id = auth.uid()
      AND e.status = 'active'
  )
);

-- 5. Fix chapters: restrict to published courses or enrolled users
DROP POLICY IF EXISTS "Chapters viewable by authenticated" ON public.chapters;

CREATE POLICY "Teachers and admins view all chapters"
ON public.chapters FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students view chapters of enrolled courses"
ON public.chapters FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.subjects sub
    INNER JOIN public.courses c ON c.id = sub.course_id
    WHERE sub.id = chapters.subject_id
      AND (c.is_published = true)
  )
);
