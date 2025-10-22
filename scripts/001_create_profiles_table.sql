-- Create profiles table that references Supabase auth.users
-- This table stores additional user information beyond what Supabase Auth provides

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_approved boolean default false,
  account_status text default 'active' check (account_status in ('active', 'suspended', 'inactive')),
  is_active boolean default true,
  expiration_date timestamp with time zone,
  constraint profiles_full_name_length check (char_length(full_name) >= 2 and char_length(full_name) <= 100)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profile_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, is_approved, account_status, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'User'),
    false, -- Require admin approval
    'active',
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create index for faster lookups
create index if not exists profiles_account_status_idx on public.profiles(account_status);
create index if not exists profiles_is_approved_idx on public.profiles(is_approved);
