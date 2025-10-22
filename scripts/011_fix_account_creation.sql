-- Comprehensive fix for account creation issues
-- This script adds missing columns and fixes the trigger

-- Step 1: Add telegram_username column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'telegram_username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN telegram_username text;
  END IF;
END $$;

-- Step 2: Add email column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email text;
  END IF;
END $$;

-- Step 3: Update existing profiles with email from auth.users
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id
AND p.email IS NULL;

-- Step 4: Update existing profiles with telegram_username from metadata
UPDATE public.profiles p
SET telegram_username = au.raw_user_meta_data->>'telegram_username'
FROM auth.users au
WHERE p.id = au.id
AND p.telegram_username IS NULL
AND au.raw_user_meta_data->>'telegram_username' IS NOT NULL;

-- Step 5: Drop and recreate the trigger function with all fields
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create comprehensive trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with all available data
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
    false, -- Require admin approval by default
    'active',
    true,
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

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Create profiles for any existing auth users that don't have profiles
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
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
  au.email,
  COALESCE(au.raw_user_meta_data->>'telegram_username', NULL),
  false,
  'active',
  true,
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 7: Create index for email searches
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_telegram_username_idx ON public.profiles(telegram_username);
