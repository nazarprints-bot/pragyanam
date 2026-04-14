-- Remove duplicate policies
DROP POLICY IF EXISTS "Public read course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
