// Test Supabase Connection Script
// Run this in browser console to test connection

const SUPABASE_URL = 'https://pozoauxismiqgytbsjic.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvem9hdXhpc21pcWd5dGJzamljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTkyNjksImV4cCI6MjA3MDM5NTI2OX0.RiZZ0Phft_U3XShCvWwKpeFQtwve3ZfCaX9WETPfBGU'

// Test function
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...')
  console.log('📍 Current URL:', window.location.origin)
  console.log('🔗 Supabase URL:', SUPABASE_URL)
  
  try {
    // Test basic connection
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    
    if (response.ok) {
      console.log('✅ Supabase connection successful!')
      console.log('📊 Response status:', response.status)
    } else {
      console.log('❌ Supabase connection failed!')
      console.log('📊 Response status:', response.status)
      console.log('📝 Response text:', await response.text())
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message)
  }
}

// Test authentication
async function testAuth() {
  console.log('🔐 Testing Authentication...')
  
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    })
    
    if (response.ok) {
      const settings = await response.json()
      console.log('✅ Auth settings loaded:', settings)
    } else {
      console.log('❌ Auth settings failed:', response.status)
    }
  } catch (error) {
    console.log('❌ Auth error:', error.message)
  }
}

// Run tests
console.log('🚀 Starting Supabase Tests...')
testSupabaseConnection()
testAuth()

// Instructions
console.log(`
📋 Instructions:
1. Copy and paste this script in browser console
2. Check the results above
3. If you see ✅ - connection is working
4. If you see ❌ - check Supabase configuration

🔧 Next Steps:
1. Go to https://supabase.com/dashboard
2. Select your project: pozoauxismiqgytbsjic
3. Go to Settings → Authentication
4. Add localhost URLs to Site URL and Redirect URLs
`)
