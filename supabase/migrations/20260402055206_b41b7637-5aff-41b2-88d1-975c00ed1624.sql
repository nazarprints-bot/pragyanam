
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS board text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS qualification text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_years integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subjects_taught text;
