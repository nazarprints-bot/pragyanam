-- Performance indexes for 5000 concurrent users

-- Chat messages: fast lookup by class + chronological order
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_class_created 
ON public.live_chat_messages (class_id, created_at);

-- Live classes: fast status filtering
CREATE INDEX IF NOT EXISTS idx_live_classes_status_scheduled 
ON public.live_classes (status, scheduled_at);

-- Profiles: fast user lookup
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON public.profiles (user_id);

-- User roles: fast role lookup
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
ON public.user_roles (user_id);

-- Enrollments: fast user + course lookup
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id 
ON public.enrollments (user_id, course_id);

-- Lessons: fast chapter lookup
CREATE INDEX IF NOT EXISTS idx_lessons_chapter_id 
ON public.lessons (chapter_id, sort_order);

-- Test attempts: fast user lookup
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_test 
ON public.test_attempts (user_id, test_id);