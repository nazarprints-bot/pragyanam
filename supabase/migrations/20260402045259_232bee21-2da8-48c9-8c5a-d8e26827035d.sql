
-- 1. Fix profiles: restrict SELECT to own profile + admin/teacher
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users see own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins and teachers see all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

-- 2. Create a public view for teacher browsing (students can use this)
CREATE OR REPLACE VIEW public.teacher_profiles AS
SELECT p.user_id, p.full_name, p.avatar_url, p.bio, p.school, p.district, p.state
FROM public.profiles p
INNER JOIN public.user_roles ur ON ur.user_id = p.user_id AND ur.role = 'teacher';

-- 3. Fix test_questions: hide correct answers from students
DROP POLICY IF EXISTS "Questions viewable with test" ON public.test_questions;

CREATE POLICY "Teachers/admins can view all questions"
ON public.test_questions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students see questions without answers via RPC"
ON public.test_questions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.test_attempts ta
    WHERE ta.test_id = test_questions.test_id
      AND ta.user_id = auth.uid()
      AND ta.submitted_at IS NOT NULL
  )
  OR has_role(auth.uid(), 'teacher'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 4. Fix test_attempts: remove UPDATE policy to prevent score tampering
DROP POLICY IF EXISTS "Users can update own attempts" ON public.test_attempts;

-- 5. Create server-side grading function
CREATE OR REPLACE FUNCTION public.grade_and_submit_test(
  _test_id uuid,
  _answers jsonb,
  _time_taken_seconds integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _score numeric := 0;
  _total_marks numeric := 0;
  _percentage numeric;
  _q record;
  _result jsonb;
BEGIN
  -- Check user is authenticated
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check no existing submission
  IF EXISTS (SELECT 1 FROM test_attempts WHERE test_id = _test_id AND user_id = _user_id) THEN
    RAISE EXCEPTION 'Test already submitted';
  END IF;

  -- Check test is published
  IF NOT EXISTS (SELECT 1 FROM tests WHERE id = _test_id AND is_published = true) THEN
    RAISE EXCEPTION 'Test not available';
  END IF;

  -- Grade MCQ questions
  FOR _q IN SELECT id, correct_option, marks, question_type FROM test_questions WHERE test_id = _test_id
  LOOP
    _total_marks := _total_marks + COALESCE(_q.marks, 1);
    IF (_q.question_type = 'mcq' OR _q.question_type IS NULL) THEN
      IF (_answers->>(_q.id::text)) = _q.correct_option THEN
        _score := _score + COALESCE(_q.marks, 1);
      END IF;
    END IF;
  END LOOP;

  _percentage := CASE WHEN _total_marks > 0 THEN (_score / _total_marks) * 100 ELSE 0 END;

  -- Insert attempt
  INSERT INTO test_attempts (user_id, test_id, answers, score, total_marks, percentage, time_taken_seconds, submitted_at)
  VALUES (_user_id, _test_id, _answers, _score, _total_marks, _percentage, _time_taken_seconds, now());

  _result := jsonb_build_object('score', _score, 'total', _total_marks, 'percentage', _percentage);
  RETURN _result;
END;
$$;

-- 6. Create function to get test questions safely (without correct answers)
CREATE OR REPLACE FUNCTION public.get_test_questions_safe(_test_id uuid)
RETURNS TABLE(
  id uuid,
  question text,
  question_type text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  marks integer,
  sort_order integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tq.id, tq.question, tq.question_type, tq.option_a, tq.option_b, tq.option_c, tq.option_d, tq.marks, tq.sort_order
  FROM test_questions tq
  INNER JOIN tests t ON t.id = tq.test_id
  WHERE tq.test_id = _test_id
    AND (t.is_published = true OR t.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ORDER BY tq.sort_order;
$$;

-- 7. Make lesson-files bucket private
UPDATE storage.buckets SET public = false WHERE id = 'lesson-files';
