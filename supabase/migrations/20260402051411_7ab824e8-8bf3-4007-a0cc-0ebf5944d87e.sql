
-- Add onboarding_completed flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Add subject_tag to doubts for filtering
ALTER TABLE public.doubts ADD COLUMN IF NOT EXISTS subject_tag text DEFAULT NULL;
