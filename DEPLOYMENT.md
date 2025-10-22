# Netlify Deployment Guide

## 🚀 Netlify এ Deploy করার পদ্ধতি

### Method 1: GitHub/GitLab Integration (Recommended)

1. **Repository তৈরি করুন:**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   \`\`\`

2. **Netlify এ Connect করুন:**
   - [netlify.com](https://netlify.com) এ যান
   - "New site from Git" ক্লিক করুন
   - GitHub/GitLab account connect করুন
   - আপনার repository select করুন

3. **Build Settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 18

### Method 2: Manual Deploy

1. **Build করুন:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Netlify এ Upload:**
   - [netlify.com](https://netlify.com) এ যান
   - "Deploy manually" ক্লিক করুন
   - `.next` folder drag & drop করুন

### Method 3: Netlify CLI

1. **CLI Install করুন:**
   \`\`\`bash
   npm install -g netlify-cli
   \`\`\`

2. **Login করুন:**
   \`\`\`bash
   netlify login
   \`\`\`

3. **Deploy করুন:**
   \`\`\`bash
   npm run build
   netlify deploy --prod --dir=.next
   \`\`\`

## 🔧 Environment Variables

Netlify dashboard এ যান এবং Environment Variables যোগ করুন:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

## 📁 Important Files

- `netlify.toml` - Netlify configuration
- `_redirects` - URL redirects
- `public/_headers` - Security headers

## ⚠️ Important Notes

1. **Supabase Configuration:** Environment variables সঠিকভাবে set করুন
2. **Database:** Supabase database production ready করুন
3. **Domain:** Custom domain যোগ করতে পারেন
4. **SSL:** Netlify automatically SSL provide করে

## 🎯 Post-Deployment

1. **Test করুন:** সব features কাজ করছে কিনা
2. **Performance:** Page speed test করুন
3. **SEO:** Meta tags check করুন
4. **Analytics:** Google Analytics যোগ করুন (যদি প্রয়োজন)

## 🔄 Continuous Deployment

GitHub integration এর মাধ্যমে automatic deployment:
- Main branch এ push করলে automatically deploy হবে
- Pull request এ preview deployment হবে
