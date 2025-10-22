-- Drop existing trigger and function if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create improved function to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert profile with user data from signup
  insert into public.profiles (id, full_name, is_approved, account_status, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    false, -- Require admin approval by default
    'active',
    true
  )
  on conflict (id) do nothing;
  
  return new;
exception
  when others then
    -- Log error but don't fail the signup
    raise warning 'Failed to create profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Create trigger to run after user is created in auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Update RLS policies to allow service role full access
drop policy if exists "Service role can manage all profiles" on public.profiles;

create policy "Service role can manage all profiles"
  on public.profiles
  for all
  using (true)
  with check (true);

-- Ensure existing policies work correctly
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create profiles for any existing auth users that don't have profiles
insert into public.profiles (id, full_name, is_approved, account_status, is_active)
select 
  au.id,
  coalesce(au.raw_user_meta_data->>'full_name', 'User'),
  false,
  'active',
  true
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null
on conflict (id) do nothing;
