-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create a trigger function to notify admins when a new teacher or free student signs up
CREATE OR REPLACE FUNCTION public.notify_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
  new_role app_role;
  new_name text;
  is_free boolean;
BEGIN
  -- Get the role of the new user
  SELECT role INTO new_role FROM public.user_roles WHERE user_id = NEW.user_id LIMIT 1;
  
  -- Get profile info
  new_name := COALESCE(NEW.full_name, 'New User');
  is_free := COALESCE(NEW.is_free_student, false);
  
  -- Only notify for teachers and free students
  IF new_role = 'teacher' OR (new_role = 'student' AND is_free = true) THEN
    -- Send notification to all admins
    FOR admin_record IN 
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (
        admin_record.user_id,
        CASE WHEN new_role = 'teacher' THEN 'New Teacher Registration' ELSE 'New Free Student Request' END,
        new_name || CASE WHEN new_role = 'teacher' THEN ' has registered as a teacher and needs approval.' ELSE ' has requested free student access and needs approval.' END,
        'alert'
      );
    END LOOP;
  END IF;
  
  -- Welcome notification for the new user
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.user_id,
    'Welcome to Pragyanam! 🎉',
    'प्रज्ञानम् में आपका स्वागत है! Your account has been created successfully.',
    'welcome'
  );
  
  RETURN NEW;
END;
$$;

-- Create the trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created_notify ON public.profiles;
CREATE TRIGGER on_profile_created_notify
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_signup();

-- Create a trigger function to notify user when approved
CREATE OR REPLACE FUNCTION public.notify_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If is_verified changed from false to true
  IF OLD.is_verified IS DISTINCT FROM NEW.is_verified AND NEW.is_verified = true THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'Account Approved! ✅',
      'Your account has been approved by admin. You can now access all features. आपका खाता स्वीकृत हो गया है!',
      'approval'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on profiles for approval
DROP TRIGGER IF EXISTS on_profile_approved_notify ON public.profiles;
CREATE TRIGGER on_profile_approved_notify
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_approval();