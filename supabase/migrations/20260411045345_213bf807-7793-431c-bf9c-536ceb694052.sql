
-- Recreate triggers that were lost
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

CREATE OR REPLACE TRIGGER on_profile_approval
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_approval();

CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_signup();

-- Insert missing profiles for existing users
INSERT INTO public.profiles (user_id, full_name, is_verified, onboarding_completed)
VALUES 
  ('a97a70af-437a-415a-8046-f506887676b0', 'Abhishek', true, true),
  ('cdb634d3-db46-42f9-b8ce-f08a82e940a7', 'Demo User', false, false),
  ('3f3d720b-4572-4af7-9a26-88d3f8067484', 'User', false, false)
ON CONFLICT DO NOTHING;
