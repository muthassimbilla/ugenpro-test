#!/usr/bin/env tsx

/**
 * Authentication Configuration Checker
 * This script checks if all required environment variables and configurations are set up correctly
 */

import { validateEnvironment } from "@/lib/domain-config"

function checkAuthConfiguration() {
  console.log("🔍 Checking Authentication Configuration...\n")

  // Check environment variables
  const envCheck = validateEnvironment()
  if (!envCheck.isValid) {
    console.error("❌ Environment Variables Missing:")
    envCheck.errors.forEach(error => console.error(`   - ${error}`))
    console.log("\n📝 Please set the following environment variables:")
    console.log("   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url")
    console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key")
    console.log("   NEXT_PUBLIC_SUPABASE_REDIRECT_URL=https://ugenpro.site/login")
    return false
  }

  console.log("✅ Environment Variables: OK")

  // Check Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    console.warn("⚠️  Warning: Supabase URL doesn't look like a valid Supabase URL")
  }

  // Check redirect URL
  const redirectUrl = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL
  if (redirectUrl && !redirectUrl.includes('ugenpro.site')) {
    console.warn("⚠️  Warning: Redirect URL should point to ugenpro.site")
  }

  console.log("\n📋 Configuration Summary:")
  console.log(`   Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
  console.log(`   Supabase Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   Redirect URL: ${redirectUrl || 'Using default'}`)

  console.log("\n🔧 Supabase Dashboard Configuration:")
  console.log("   Please ensure the following URLs are added to your Supabase project:")
  console.log("   Site URL: https://ugenpro.site")
  console.log("   Redirect URLs:")
  console.log("     - https://ugenpro.site/auth/callback")
  console.log("     - https://ugenpro.site/login")
  console.log("     - https://ugenpro.site/signup")
  console.log("     - https://ugenpro.site/reset-password")
  console.log("     - https://ugenpro.site/change-password")
  console.log("     - https://ugenpro.site/profile")

  console.log("\n🚀 Next Steps:")
  console.log("   1. Set up environment variables in .env.local")
  console.log("   2. Configure Supabase dashboard with the URLs above")
  console.log("   3. Test authentication flow")

  return true
}

// Run the check
if (require.main === module) {
  checkAuthConfiguration()
}

export { checkAuthConfiguration }
