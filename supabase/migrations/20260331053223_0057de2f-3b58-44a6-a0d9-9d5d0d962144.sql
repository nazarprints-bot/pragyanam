
-- Add scheduled_at to tests for scheduling
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone DEFAULT NULL;
