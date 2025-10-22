# Admin Panel Active Sessions Setup Guide

## সমস্যা: Active Sessions ০ দেখাচ্ছে

Active Sessions ০ দেখানোর কারণ এবং সমাধান:

## 🔍 **মূল কারণ:**

1. **RLS Policies**: Supabase এর Row Level Security (RLS) policies শুধুমাত্র users তাদের নিজের sessions দেখতে পারবে
2. **Admin Access**: Admin panel থেকে সব users এর sessions দেখার জন্য special policies দরকার
3. **Service Role Key**: Environment variable `SUPABASE_SERVICE_ROLE_KEY` set করা নেই

## ✅ **সমাধান:**

### 1. Database Policies যোগ করুন

নিম্নলিখিত SQL script run করুন আপনার Supabase database এ:

\`\`\`sql
-- scripts/add_admin_policies.sql ফাইলটি run করুন
\`\`\`

এই script:
- `is_admin()` function তৈরি করবে
- Admin policies যোগ করবে `user_sessions` এবং `user_ip_history` tables এর জন্য
- Admin users সব sessions দেখতে পারবে

### 2. Environment Variables

`.env.local` ফাইলে নিম্নলিখিত variables যোগ করুন:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### 3. Admin User Setup

নিশ্চিত করুন যে আপনি `admins` table এ registered:

\`\`\`sql
INSERT INTO public.admins (id, username, is_active) 
VALUES ('your_user_id', 'your_username', true);
\`\`\`

## 🚀 **এখন যা যা কাজ করবে:**

- ✅ **Active Sessions Count**: প্রতিটি ইউজারের সক্রিয় সেশন সংখ্যা দেখাবে
- ✅ **Session Details**: IP Address, User Agent, Device Type দেখাবে
- ✅ **Session Management**: Admin যেকোনো সেশন terminate করতে পারবে
- ✅ **Real-time Updates**: সেশন পরিবর্তন হলে automatically আপডেট হবে

## 🔧 **Technical Details:**

### Database Schema:
- `user_sessions` table: সব user sessions store করে
- `user_ip_history` table: IP address history track করে
- `admins` table: admin users identify করে

### RLS Policies:
- Users: শুধু নিজের sessions দেখতে পারে
- Admins: সব users এর sessions দেখতে পারে
- Service Role: সব tables access করতে পারে

### API Endpoints:
- `/api/admin/user-sessions`: Admin sessions API
- Direct database queries: Admin policies ব্যবহার করে

## 🐛 **Troubleshooting:**

### যদি এখনও ০ দেখায়:

1. **Database Policies Check**:
   \`\`\`sql
   SELECT is_admin(); -- true return করবে যদি admin হন
   \`\`\`

2. **Sessions Data Check**:
   \`\`\`sql
   SELECT COUNT(*) FROM user_sessions WHERE is_active = true;
   \`\`\`

3. **Admin Status Check**:
   \`\`\`sql
   SELECT * FROM admins WHERE id = auth.uid();
   \`\`\`

4. **Console Logs**: Browser console এ error messages check করুন

### Common Issues:

- **RLS Policies**: Admin policies properly set করা নেই
- **Admin Status**: User admin table এ নেই
- **Session Data**: Database এ কোনো active sessions নেই
- **Environment**: Service role key missing

## 📝 **Next Steps:**

1. SQL script run করুন
2. Environment variables set করুন
3. Admin user verify করুন
4. Browser refresh করুন
5. Active sessions check করুন

এই setup এর পর আপনার admin panel এ Active Sessions properly দেখাবে!
