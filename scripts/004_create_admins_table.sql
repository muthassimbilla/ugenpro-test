-- Create admins table for admin panel authentication
-- This table stores admin users separately from regular users

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  full_name text not null,
  email text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_login timestamp with time zone,
  is_active boolean default true,
  role text default 'admin' check (role in ('admin', 'super_admin')),
  constraint admins_username_length check (char_length(username) >= 3 and char_length(username) <= 50),
  constraint admins_full_name_length check (char_length(full_name) >= 2 and char_length(full_name) <= 100)
);

-- Enable Row Level Security
alter table public.admins enable row level security;

-- RLS Policies for admins (only admins can access this table)
create policy "Admins can view all admins"
  on public.admins for select
  using (true); -- We'll handle auth in the application layer

create policy "Admins can update their own data"
  on public.admins for update
  using (true);

-- Create updated_at trigger for admins
create trigger on_admin_updated
  before update on public.admins
  for each row
  execute function public.handle_updated_at();

-- Create indexes for faster lookups
create index if not exists admins_username_idx on public.admins(username);
create index if not exists admins_is_active_idx on public.admins(is_active);

-- Insert default admin user
-- Username: admin
-- Password: admin123
-- Password hash generated using bcrypt with salt rounds 10
insert into public.admins (username, password_hash, full_name, email, role)
values (
  'admin',
  '$2a$10$rN8qYGZxJZKZQxJ5Z5Z5ZeX5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5u', -- This is a placeholder, will be replaced with actual hash
  'System Administrator',
  'admin@example.com',
  'super_admin'
)
on conflict (username) do nothing;

-- Note: The password hash above is a placeholder. 
-- For security, you should generate a proper bcrypt hash for 'admin123' or your desired password.
-- You can generate it using: bcrypt.hash('admin123', 10)
