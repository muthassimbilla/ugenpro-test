-- =====================================================
-- Add Admin Policies for user_sessions and user_ip_history
-- =====================================================
-- This script adds policies to allow admins to view all user sessions and IP history
-- =====================================================

-- First, let's create a function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user exists in the admins table
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin policies for user_sessions table
DROP POLICY IF EXISTS "Admins can view all user sessions" ON public.user_sessions;
CREATE POLICY "Admins can view all user sessions"
  ON public.user_sessions FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all user sessions" ON public.user_sessions;
CREATE POLICY "Admins can update all user sessions"
  ON public.user_sessions FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete all user sessions" ON public.user_sessions;
CREATE POLICY "Admins can delete all user sessions"
  ON public.user_sessions FOR DELETE
  USING (is_admin());

-- Add admin policies for user_ip_history table
DROP POLICY IF EXISTS "Admins can view all user IP history" ON public.user_ip_history;
CREATE POLICY "Admins can view all user IP history"
  ON public.user_ip_history FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all user IP history" ON public.user_ip_history;
CREATE POLICY "Admins can update all user IP history"
  ON public.user_ip_history FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete all user IP history" ON public.user_ip_history;
CREATE POLICY "Admins can delete all user IP history"
  ON public.user_ip_history FOR DELETE
  USING (is_admin());

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =====================================================
-- Verification queries
-- =====================================================

-- Test the admin function (replace with actual admin user ID)
-- SELECT is_admin();

-- Check all policies on user_sessions table
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'user_sessions';

-- Check all policies on user_ip_history table  
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'user_ip_history';
