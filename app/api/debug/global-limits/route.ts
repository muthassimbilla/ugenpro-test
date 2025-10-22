import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth-server'

// Debug route to check database connection and data
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Test 1: Check if global_api_limits table exists and has data
    const { data: limits, error: limitsError } = await supabase
      .from('global_api_limits')
      .select('*')
      .order('api_type')

    console.log('Global limits query result:', { limits, limitsError })

    // Test 2: Check if we can insert test data
    const { data: insertData, error: insertError } = await supabase
      .from('global_api_limits')
      .upsert([
        { api_type: 'address_generator', daily_limit: 200, is_unlimited: false },
        { api_type: 'email2name', daily_limit: 200, is_unlimited: false }
      ], { onConflict: 'api_type' })
      .select()

    console.log('Insert test result:', { insertData, insertError })

    // Test 3: Check again after insert
    const { data: finalLimits, error: finalError } = await supabase
      .from('global_api_limits')
      .select('*')
      .order('api_type')

    console.log('Final limits query result:', { finalLimits, finalError })

    return NextResponse.json({
      success: true,
      debug: {
        initialLimits: limits,
        initialError: limitsError,
        insertResult: insertData,
        insertError: insertError,
        finalLimits: finalLimits,
        finalError: finalError
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
