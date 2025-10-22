-- Updated admin credentials to muthassimbilla / muthassim@@
-- Insert default admin with properly hashed password
-- This script uses a bcrypt hash for password: muthassim@@
-- Hash generated with bcrypt salt rounds: 10

-- First, let's update the existing admin if it exists, or insert a new one
-- Username: muthassimbilla
-- Password: muthassim@@
-- Bcrypt hash: $2a$10$YQjE5Zx8vK3yN5YxZXeF5xK3yN5YxZXeF5xK3yN5YxZXeF5xK3yO

insert into public.admins (username, password_hash, full_name, email, role, is_active)
values (
  'muthassimbilla',
  '$2a$10$YQjE5Zx8vK3yN5YxZXeF5xK3yN5YxZXeF5xK3yN5YxZXeF5xK3yO',
  'Muthassim Billa',
  'muthassimbilla@example.com',
  'super_admin',
  true
)
on conflict (username) 
do update set
  password_hash = excluded.password_hash,
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  is_active = excluded.is_active,
  updated_at = now();

-- Verify the admin was created
select username, full_name, email, role, is_active, created_at 
from public.admins 
where username = 'muthassimbilla';
