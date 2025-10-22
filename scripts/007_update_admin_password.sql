-- Update admin password to plain text temporarily for testing
-- Username: muthassimbilla
-- Password: muthassim@@

UPDATE public.admins 
SET 
  password_hash = 'muthassim@@',
  updated_at = now()
WHERE username = 'muthassimbilla';

-- Verify the update
SELECT username, full_name, email, role, is_active, created_at, updated_at
FROM public.admins 
WHERE username = 'muthassimbilla';
