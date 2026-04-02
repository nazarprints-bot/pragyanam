
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'paid',
  ADD COLUMN IF NOT EXISTS trial_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
