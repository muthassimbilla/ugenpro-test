-- Create sample users for testing the admin panel
-- This script creates test users in auth.users first, then profiles

-- Insert sample users into auth.users table
-- Note: Supabase auth.users requires encrypted_password and other auth fields
-- We'll create users with a simple password: "test123"

DO $$
DECLARE
  user_id_1 uuid := gen_random_uuid();
  user_id_2 uuid := gen_random_uuid();
  user_id_3 uuid := gen_random_uuid();
  user_id_4 uuid := gen_random_uuid();
  user_id_5 uuid := gen_random_uuid();
  user_id_6 uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users (simplified version)
  -- Creating users in auth.users first to satisfy foreign key constraint
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
    (user_id_1, '00000000-0000-0000-0000-000000000000', 'rahim@example.com', crypt('test123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"মুহাম্মদ রহিম"}', 'authenticated', 'authenticated'),
    (user_id_2, '00000000-0000-0000-0000-000000000000', 'fatima@example.com', crypt('test123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"ফাতিমা খাতুন"}', 'authenticated', 'authenticated'),
    (user_id_3, '00000000-0000-0000-0000-000000000000', 'karim@example.com', crypt('test123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"আব্দুল করিম"}', 'authenticated', 'authenticated'),
    (user_id_4, '00000000-0000-0000-0000-000000000000', 'ayesha@example.com', crypt('test123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"আয়েশা বেগম"}', 'authenticated', 'authenticated'),
    (user_id_5, '00000000-0000-0000-0000-000000000000', 'ibrahim@example.com', crypt('test123', gen_salt('bf')), now() - interval '30 days', now() - interval '30 days', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"ইব্রাহিম হোসেন"}', 'authenticated', 'authenticated'),
    (user_id_6, '00000000-0000-0000-0000-000000000000', 'sakib@example.com', crypt('test123', gen_salt('bf')), now() - interval '60 days', now() - interval '60 days', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"সাকিব আহমেদ"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  -- Now insert into profiles table with matching IDs
  INSERT INTO public.profiles (id, full_name, is_approved, account_status, is_active, created_at, updated_at)
  VALUES
    (user_id_1, 'মুহাম্মদ রহিম', true, 'active', true, now(), now()),
    (user_id_2, 'ফাতিমা খাতুন', true, 'active', true, now(), now()),
    (user_id_3, 'আব্দুল করিম', false, 'active', true, now(), now()),
    (user_id_4, 'আয়েশা বেগম', true, 'suspended', false, now(), now()),
    (user_id_5, 'ইব্রাহিম হোসেন', true, 'active', true, now() - interval '30 days', now()),
    (user_id_6, 'সাকিব আহমেদ', true, 'active', true, now() - interval '60 days', now())
  ON CONFLICT (id) DO NOTHING;

  -- Add expiration dates
  UPDATE public.profiles
  SET expiration_date = now() + interval '7 days'
  WHERE id = user_id_5;

  UPDATE public.profiles
  SET expiration_date = now() - interval '5 days'
  WHERE id = user_id_6;

END $$;
