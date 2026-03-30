
ALTER TABLE public.test_questions
ADD COLUMN question_type text NOT NULL DEFAULT 'mcq',
ADD COLUMN answer_text text;

COMMENT ON COLUMN public.test_questions.question_type IS 'mcq, short, or long';
COMMENT ON COLUMN public.test_questions.answer_text IS 'Expected answer for short/long questions';
