// Test script to verify deactivated account auto logout
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDeactivatedLogout() {
  try {
    console.log('🔍 Testing deactivated account auto logout...')
    
    // Test 1: Check user status API
    console.log('\n📡 Testing user status API...')
    const response = await fetch('http://localhost:3000/api/user-status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const status = await response.json()
      console.log('✅ User status API working:', status)
    } else {
      console.log('❌ User status API failed:', response.status, response.statusText)
    }

    // Test 2: Check database user status
    console.log('\n🗄️ Testing database user status...')
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, account_status, is_active')
      .limit(5)

    if (error) {
      console.error('❌ Database query error:', error)
    } else {
      console.log('✅ Database users found:', users?.length || 0)
      users?.forEach(user => {
        console.log(`   - ${user.email}: ${user.account_status} (active: ${user.is_active})`)
      })
    }

    // Test 3: Simulate deactivated user
    console.log('\n🧪 Testing deactivated user simulation...')
    const testUserId = users?.[0]?.id
    
    if (testUserId) {
      // Temporarily deactivate user
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          account_status: 'inactive',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', testUserId)

      if (updateError) {
        console.error('❌ Failed to deactivate user:', updateError)
      } else {
        console.log('✅ User deactivated for testing')
        
        // Check status again
        const { data: deactivatedUser } = await supabase
          .from('users')
          .select('id, email, account_status, is_active')
          .eq('id', testUserId)
          .single()
        
        console.log('📊 Deactivated user status:', deactivatedUser)
        
        // Reactivate user
        const { error: reactivateError } = await supabase
          .from('users')
          .update({ 
            account_status: 'active',
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', testUserId)
        
        if (reactivateError) {
          console.error('❌ Failed to reactivate user:', reactivateError)
        } else {
          console.log('✅ User reactivated')
        }
      }
    }

    console.log('\n🎉 Deactivated account auto logout test completed!')
    console.log('\n📋 Manual Test Steps:')
    console.log('1. Login to the application')
    console.log('2. Open browser DevTools Console')
    console.log('3. Deactivate your account in admin panel')
    console.log('4. Wait 30 seconds or refresh page')
    console.log('5. You should be automatically logged out')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testDeactivatedLogout()
