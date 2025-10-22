import { type NextRequest, NextResponse } from "next/server"
import { ApiRateLimiter } from "@/lib/api-rate-limiter"
import { createServerSupabaseClient } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    // Get all user limits with profile information
    const { data: limits, error } = await supabase
      .from('api_user_limits')
      .select(`
        *,
        profiles:user_id(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user limits:', error)
      return NextResponse.json({ 
        success: false, 
        error: "Database error" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      limits: limits || []
    })

  } catch (error) {
    console.error("API user limits error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    const { user_id, api_type, daily_limit, is_unlimited } = await request.json()

    if (!user_id || !api_type) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    const rateLimiter = new ApiRateLimiter()
    const success = await rateLimiter.setUserLimit(
      user_id, 
      api_type, 
      daily_limit || 200, 
      is_unlimited || false,
      user.id
    )

    if (success) {
      return NextResponse.json({
        success: true,
        message: "User limit created successfully"
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to create user limit" 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Create user limit error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    const { id, daily_limit, is_unlimited } = await request.json()

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing limit ID" 
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('api_user_limits')
      .update({
        daily_limit: daily_limit || 200,
        is_unlimited: is_unlimited || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating user limit:', error)
      return NextResponse.json({ 
        success: false, 
        error: "Database error" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "User limit updated successfully"
    })

  } catch (error) {
    console.error("Update user limit error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing limit ID" 
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('api_user_limits')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting user limit:', error)
      return NextResponse.json({ 
        success: false, 
        error: "Database error" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "User limit deleted successfully"
    })

  } catch (error) {
    console.error("Delete user limit error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
