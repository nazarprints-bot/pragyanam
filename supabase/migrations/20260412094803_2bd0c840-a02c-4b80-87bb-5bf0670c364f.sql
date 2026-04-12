-- Update lesson-files bucket to allow larger uploads (500MB)
UPDATE storage.buckets 
SET file_size_limit = 524288000 
WHERE id = 'lesson-files';

-- Update default max_students for live classes
ALTER TABLE public.live_classes ALTER COLUMN max_students SET DEFAULT 100;