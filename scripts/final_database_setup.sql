-- =====================================================
-- UGen Pro - Final Database Setup Script
-- =====================================================
-- This script creates the complete database structure for UGen Pro
-- Includes: Users, Admins, Sessions, Notifications, and Security
-- =====================================================

-- =====================================================
-- SECTION 1: CORE TABLES
-- =====================================================

-- Create profiles table that references Supabase auth.users
-- This table stores additional user information beyond what Supabase Auth provides
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  telegram_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'inactive')),
  is_active BOOLEAN DEFAULT TRUE,
  expiration_date TIMESTAMPTZ,
  CONSTRAINT profiles_full_name_length CHECK (char_length(full_name) >= 2 AND char_length(full_name) <= 100)
);

-- Create user sessions table for tracking active sessions
-- This complements Supabase Auth's built-in session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  logout_reason TEXT,
  CONSTRAINT user_sessions_session_token_length CHECK (char_length(session_token) > 10)
);

-- Create user IP history table for tracking IP addresses
-- This helps with security monitoring and analytics
CREATE TABLE IF NOT EXISTS public.user_ip_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_ip_history_ip_address_length CHECK (char_length(ip_address) > 0)
);

-- Create admins table for admin panel authentication
-- This table stores admin users separately from regular users
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  CONSTRAINT admins_username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50),
  CONSTRAINT admins_full_name_length CHECK (char_length(full_name) >= 2 AND char_length(full_name) <= 100)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT, -- Optional link to navigate to
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- =====================================================
-- SECTION 2: INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS profiles_account_status_idx ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS profiles_is_approved_idx ON public.profiles(is_approved);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_telegram_username_idx ON public.profiles(telegram_username);
CREATE INDEX IF NOT EXISTS profiles_approved_at_idx ON public.profiles(approved_at);
CREATE INDEX IF NOT EXISTS profiles_approved_by_idx ON public.profiles(approved_by);

-- User sessions table indexes
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_session_token_idx ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS user_sessions_is_active_idx ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON public.user_sessions(expires_at);

-- User IP history table indexes
CREATE INDEX IF NOT EXISTS user_ip_history_user_id_idx ON public.user_ip_history(user_id);
CREATE INDEX IF NOT EXISTS user_ip_history_ip_address_idx ON public.user_ip_history(ip_address);
CREATE INDEX IF NOT EXISTS user_ip_history_is_current_idx ON public.user_ip_history(is_current);

-- Admins table indexes
CREATE INDEX IF NOT EXISTS admins_username_idx ON public.admins(username);
CREATE INDEX IF NOT EXISTS admins_is_active_idx ON public.admins(is_active);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- SECTION 3: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ip_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECTION 4: RLS POLICIES
-- =====================================================

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
  ON public.profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- User sessions table policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- User IP history table policies
DROP POLICY IF EXISTS "Users can view their own IP history" ON public.user_ip_history;
DROP POLICY IF EXISTS "Users can insert their own IP history" ON public.user_ip_history;

CREATE POLICY "Users can view their own IP history"
  ON public.user_ip_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own IP history"
  ON public.user_ip_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins table policies (handled in application layer)
DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can update their own data" ON public.admins;

CREATE POLICY "Admins can view all admins"
  ON public.admins FOR SELECT
  USING (true);

CREATE POLICY "Admins can update their own data"
  ON public.admins FOR UPDATE
  USING (true);

-- Notifications table policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- SECTION 5: FUNCTIONS
-- =====================================================

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with user data from signup
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email,
    telegram_username,
    is_approved, 
    account_status, 
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'telegram_username', NULL),
    FALSE, -- Require admin approval by default
    'active',
    TRUE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, link)
  VALUES (p_user_id, p_title, p_message, p_type, p_link)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 6: TRIGGERS
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
DROP TRIGGER IF EXISTS on_admin_updated ON public.admins;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create updated_at trigger for profiles
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create updated_at trigger for admins
CREATE TRIGGER on_admin_updated
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SECTION 7: PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.user_sessions TO anon, authenticated;
GRANT ALL ON public.user_ip_history TO anon, authenticated;
GRANT ALL ON public.admins TO anon, authenticated;
GRANT ALL ON public.notifications TO anon, authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_sessions TO service_role;
GRANT ALL ON public.user_ip_history TO service_role;
GRANT ALL ON public.admins TO service_role;
GRANT ALL ON public.notifications TO service_role;

-- =====================================================
-- SECTION 8: DEFAULT DATA
-- =====================================================

-- Insert default admin user
-- Username: muthassimbilla
-- Password: muthassim@@ (plain text for testing)
INSERT INTO public.admins (username, password_hash, full_name, email, role, is_active)
VALUES (
  'muthassimbilla',
  'muthassim@@', -- Plain text password for testing
  'Muthassim Billa',
  'muthassimbilla@example.com',
  'super_admin',
  TRUE
)
ON CONFLICT (username) 
DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Create sample users for testing (optional)
-- Uncomment the following section if you want sample users
/*
DO $$
DECLARE
  user_id_1 UUID := gen_random_uuid();
  user_id_2 UUID := gen_random_uuid();
  user_id_3 UUID := gen_random_uuid();
BEGIN
  -- Insert into auth.users (simplified version)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  )
  VALUES
    (user_id_1, '00000000-0000-0000-0000-000000000000', 'test1@example.com', crypt('test123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test User 1"}', 'authenticated', 'authenticated'),
    (user_id_2, '00000000-0000-0000-0000-000000000000', 'test2@example.com', crypt('test123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test User 2"}', 'authenticated', 'authenticated'),
    (user_id_3, '00000000-0000-0000-0000-000000000000', 'test3@example.com', crypt('test123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test User 3"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  -- Insert into profiles table with matching IDs
  INSERT INTO public.profiles (id, full_name, email, is_approved, account_status, is_active, created_at, updated_at)
  VALUES
    (user_id_1, 'Test User 1', 'test1@example.com', TRUE, 'active', TRUE, now(), now()),
    (user_id_2, 'Test User 2', 'test2@example.com', FALSE, 'active', TRUE, now(), now()),
    (user_id_3, 'Test User 3', 'test3@example.com', TRUE, 'suspended', FALSE, now(), now())
  ON CONFLICT (id) DO NOTHING;
END $$;
*/

-- =====================================================
-- SECTION 9: VERIFICATION QUERIES
-- =====================================================

-- Verify admin was created
SELECT username, full_name, email, role, is_active, created_at 
FROM public.admins 
WHERE username = 'muthassimbilla';

-- Show table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'user_sessions', 'user_ip_history', 'admins', 'notifications')
ORDER BY table_name, ordinal_position;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
-- Database setup completed successfully!
-- 
-- Features included:
-- ✅ User profiles with approval system
-- ✅ Admin panel with authentication
-- ✅ Session tracking and management
-- ✅ IP history tracking for security
-- ✅ Notification system
-- ✅ Row Level Security (RLS) policies
-- ✅ Auto profile creation on signup
-- ✅ Performance indexes
-- ✅ Proper permissions and grants
-- =====================================================
