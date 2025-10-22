import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Debug API to check database directly
export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Checking database directly...')
    
    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const today = new Date().toISOString().split('T')[0]
    
    // Test 1: Direct query without RLS
    const { data: directData, error: directError } = await supabase
      .from('api_usage')
      .select('*')
      .eq('usage_date', today)
    
    console.log('Direct query result:', { directData, directError })
    
    // Test 2: Query with profiles join
    const { data: joinData, error: joinError } = await supabase
      .from('api_usage')
      .select(`
        *,
        profiles:user_id(full_name, email)
      `)
      .eq('usage_date', today)
    
    console.log('Join query result:', { joinData, joinError })
    
    // Test 3: Check if we can see any data at all
    const { data: allData, error: allError } = await supabase
      .from('api_usage')
      .select('*')
      .limit(10)
    
    console.log('All data query result:', { allData, allError })
    
    // Test 4: Check profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    console.log('Profiles query result:', { profilesData, profilesError })
    
    return NextResponse.json({
      success: true,
      debug: {
        today: today,
        directQuery: { data: directData, error: directError },
        joinQuery: { data: joinData, error: joinError },
        allDataQuery: { data: allData, error: allError },
        profilesQuery: { data: profilesData, error: profilesError }
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
