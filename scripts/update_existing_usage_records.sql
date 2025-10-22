-- Update existing usage records to use current global limits
-- Run this in Supabase SQL Editor

-- 1. Check current global limits
SELECT 'Current Global Limits' as info, * FROM global_api_limits ORDER BY api_type;

-- 2. Check existing usage records
SELECT 'Existing Usage Records' as info, api_type, daily_limit, COUNT(*) as count 
FROM api_usage 
WHERE usage_date = CURRENT_DATE 
GROUP BY api_type, daily_limit
ORDER BY api_type, daily_limit;

-- 3. Update existing usage records to use current global limits
UPDATE api_usage 
SET 
  daily_limit = CASE 
    WHEN api_type = 'address_generator' THEN (SELECT daily_limit FROM global_api_limits WHERE api_type = 'address_generator')
    WHEN api_type = 'email2name' THEN (SELECT daily_limit FROM global_api_limits WHERE api_type = 'email2name')
    ELSE daily_limit
  END,
  is_unlimited = CASE 
    WHEN api_type = 'address_generator' THEN (SELECT is_unlimited FROM global_api_limits WHERE api_type = 'address_generator')
    WHEN api_type = 'email2name' THEN (SELECT is_unlimited FROM global_api_limits WHERE api_type = 'email2name')
    ELSE is_unlimited
  END,
  updated_at = NOW()
WHERE usage_date = CURRENT_DATE;

-- 4. Check updated records
SELECT 'Updated Usage Records' as info, api_type, daily_limit, COUNT(*) as count 
FROM api_usage 
WHERE usage_date = CURRENT_DATE 
GROUP BY api_type, daily_limit
ORDER BY api_type, daily_limit;

-- 5. Test the function with a real user (replace with actual user ID)
-- SELECT 'Function Test' as info, get_or_create_daily_usage(
--   (SELECT id FROM auth.users LIMIT 1),
--   'address_generator',
--   CURRENT_DATE
-- ) as result;
