-- Create user sessions table for tracking active sessions
-- This complements Supabase Auth's built-in session management

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_token text not null unique,
  ip_address text,
  user_agent text,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  last_accessed timestamp with time zone default now(),
  is_active boolean default true,
  logout_reason text,
  constraint user_sessions_session_token_length check (char_length(session_token) > 10)
);

-- Enable Row Level Security
alter table public.user_sessions enable row level security;

-- RLS Policies for user_sessions
create policy "Users can view their own sessions"
  on public.user_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on public.user_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on public.user_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on public.user_sessions for delete
  using (auth.uid() = user_id);

-- Create indexes for faster lookups
create index if not exists user_sessions_user_id_idx on public.user_sessions(user_id);
create index if not exists user_sessions_session_token_idx on public.user_sessions(session_token);
create index if not exists user_sessions_is_active_idx on public.user_sessions(is_active);
create index if not exists user_sessions_expires_at_idx on public.user_sessions(expires_at);
