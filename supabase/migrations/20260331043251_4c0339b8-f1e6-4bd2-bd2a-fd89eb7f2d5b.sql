-- Add thumbnail and max_students to live_classes
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS thumbnail_url text DEFAULT NULL;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS max_students integer NOT NULL DEFAULT 75;
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS current_students integer NOT NULL DEFAULT 0;

-- Delete all demo/test live classes
DELETE FROM public.live_chat_messages;
DELETE FROM public.live_classes;