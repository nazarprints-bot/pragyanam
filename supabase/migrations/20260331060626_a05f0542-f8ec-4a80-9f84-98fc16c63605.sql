
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS parent_phone text,
ADD COLUMN IF NOT EXISTS school text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS district text;
