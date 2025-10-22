-- Create user IP history table for tracking IP addresses
-- This helps with security monitoring and analytics

create table if not exists public.user_ip_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ip_address text not null,
  is_current boolean default false,
  created_at timestamp with time zone default now(),
  constraint user_ip_history_ip_address_length check (char_length(ip_address) > 0)
);

-- Enable Row Level Security
alter table public.user_ip_history enable row level security;

-- RLS Policies for user_ip_history
create policy "Users can view their own IP history"
  on public.user_ip_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own IP history"
  on public.user_ip_history for insert
  with check (auth.uid() = user_id);

-- Create indexes for faster lookups
create index if not exists user_ip_history_user_id_idx on public.user_ip_history(user_id);
create index if not exists user_ip_history_ip_address_idx on public.user_ip_history(ip_address);
create index if not exists user_ip_history_is_current_idx on public.user_ip_history(is_current);
