// Test script to check pricing plans database connection
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPricingPlans() {
  try {
    console.log('🔍 Testing pricing plans database connection...')
    
    // Test landing plans
    console.log('\n📄 Testing landing plans...')
    const { data: landingPlans, error: landingError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('plan_type', 'landing')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (landingError) {
      console.error('❌ Landing plans error:', landingError)
    } else {
      console.log('✅ Landing plans loaded:', landingPlans?.length || 0, 'plans')
      if (landingPlans?.length > 0) {
        console.log('   First plan:', landingPlans[0].name)
      }
    }

    // Test premium plans
    console.log('\n💎 Testing premium plans...')
    const { data: premiumPlans, error: premiumError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('plan_type', 'premium')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (premiumError) {
      console.error('❌ Premium plans error:', premiumError)
    } else {
      console.log('✅ Premium plans loaded:', premiumPlans?.length || 0, 'plans')
      if (premiumPlans?.length > 0) {
        console.log('   First plan:', premiumPlans[0].name)
      }
    }

    // Test all plans (for admin)
    console.log('\n🔧 Testing all plans (admin view)...')
    const { data: allPlans, error: allError } = await supabase
      .from('pricing_plans')
      .select('*')
      .order('plan_type', { ascending: true })
      .order('display_order', { ascending: true })

    if (allError) {
      console.error('❌ All plans error:', allError)
    } else {
      console.log('✅ All plans loaded:', allPlans?.length || 0, 'plans')
      const landingCount = allPlans?.filter(p => p.plan_type === 'landing').length || 0
      const premiumCount = allPlans?.filter(p => p.plan_type === 'premium').length || 0
      console.log('   Landing plans:', landingCount)
      console.log('   Premium plans:', premiumCount)
    }

    console.log('\n🎉 Database connection test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testPricingPlans()
