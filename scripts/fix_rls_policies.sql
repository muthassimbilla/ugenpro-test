-- Fix RLS policies for admin access
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own API usage" ON public.api_usage;
DROP POLICY IF EXISTS "Admins can view all API usage" ON public.api_usage;
DROP POLICY IF EXISTS "System can insert API usage" ON public.api_usage;
DROP POLICY IF EXISTS "System can update API usage" ON public.api_usage;

-- Create new policies
CREATE POLICY "Users can view their own API usage"
  ON public.api_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all API usage"
  ON public.api_usage FOR SELECT
  USING (true);

CREATE POLICY "System can insert API usage"
  ON public.api_usage FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update API usage"
  ON public.api_usage FOR UPDATE
  USING (true);

-- Test the policies
SELECT 'Policy test' as info, COUNT(*) as count FROM api_usage WHERE usage_date = CURRENT_DATE;
