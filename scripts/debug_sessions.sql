-- =====================================================
-- Debug Sessions Data
-- =====================================================
-- This script helps debug why active sessions are not showing
-- =====================================================

-- 1. Check if user_sessions table has any data
SELECT 'Total sessions in user_sessions table:' as info, COUNT(*) as count FROM public.user_sessions;

-- 2. Check active sessions
SELECT 'Active sessions:' as info, COUNT(*) as count 
FROM public.user_sessions 
WHERE is_active = true;

-- 3. Check sessions that haven't expired
SELECT 'Non-expired sessions:' as info, COUNT(*) as count 
FROM public.user_sessions 
WHERE expires_at > NOW();

-- 4. Check active and non-expired sessions
SELECT 'Active and non-expired sessions:' as info, COUNT(*) as count 
FROM public.user_sessions 
WHERE is_active = true AND expires_at > NOW();

-- 5. Show sample session data
SELECT 'Sample session data:' as info;
SELECT 
    id,
    user_id,
    ip_address,
    user_agent,
    is_active,
    expires_at,
    created_at,
    last_accessed
FROM public.user_sessions 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check if admin function works
SELECT 'Admin function test:' as info, is_admin() as is_admin_result;

-- 7. Check current user
SELECT 'Current user:' as info, auth.uid() as current_user_id;

-- 8. Check if current user is in admins table
SELECT 'Current user admin status:' as info;
SELECT 
    id,
    username,
    is_active,
    created_at
FROM public.admins 
WHERE id = auth.uid();

-- 9. Test admin policy by trying to select sessions
SELECT 'Testing admin policy access:' as info;
SELECT COUNT(*) as accessible_sessions_count
FROM public.user_sessions;

-- 10. Check profiles table for users
SELECT 'Total users in profiles:' as info, COUNT(*) as count FROM public.profiles;

-- 11. Show users with their session counts
SELECT 
    p.id,
    p.full_name,
    p.email,
    COUNT(us.id) as session_count
FROM public.profiles p
LEFT JOIN public.user_sessions us ON p.id = us.user_id AND us.is_active = true AND us.expires_at > NOW()
GROUP BY p.id, p.full_name, p.email
ORDER BY session_count DESC
LIMIT 10;
