-- Add approval tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid references auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_approved_at_idx ON public.profiles(approved_at);
CREATE INDEX IF NOT EXISTS profiles_approved_by_idx ON public.profiles(approved_by);

-- Update existing approved users to have approved_at timestamp
UPDATE public.profiles 
SET approved_at = created_at 
WHERE is_approved = true AND approved_at IS NULL;
