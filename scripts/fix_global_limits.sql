-- Manual check and fix for global_api_limits table
-- Run this in Supabase SQL Editor if needed

-- 1. Check if table exists and has data
SELECT 'Table exists check' as step, COUNT(*) as count FROM global_api_limits;

-- 2. Check current data
SELECT 'Current data' as step, * FROM global_api_limits ORDER BY api_type;

-- 3. Insert default data if missing
INSERT INTO global_api_limits (api_type, daily_limit, is_unlimited) 
VALUES 
    ('address_generator', 200, FALSE),
    ('email2name', 200, FALSE)
ON CONFLICT (api_type) DO UPDATE SET
    daily_limit = EXCLUDED.daily_limit,
    is_unlimited = EXCLUDED.is_unlimited,
    updated_at = NOW();

-- 4. Verify data after insert
SELECT 'After insert' as step, * FROM global_api_limits ORDER BY api_type;

-- 5. Test the function
SELECT 'Function test' as step, get_or_create_daily_usage(
    (SELECT id FROM auth.users LIMIT 1),
    'address_generator',
    CURRENT_DATE
) as result;
