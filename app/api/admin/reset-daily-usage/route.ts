import { type NextRequest, NextResponse } from "next/server"
import { ApiRateLimiter } from "@/lib/api-rate-limiter"
import { createServerSupabaseClient } from "@/lib/auth-server"

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

    const { user_id, api_type, date } = await request.json()

    if (!user_id || !api_type) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    const rateLimiter = new ApiRateLimiter()
    const success = await rateLimiter.resetUserDailyUsage(
      user_id, 
      api_type, 
      date || new Date().toISOString().split('T')[0]
    )

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Daily usage reset successfully"
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to reset daily usage" 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Reset daily usage error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
