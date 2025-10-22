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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const rateLimiter = new ApiRateLimiter()
    const usageData = await rateLimiter.getAllUsageByDate(date)

    return NextResponse.json({
      success: true,
      usage: usageData,
      date: date
    })

  } catch (error) {
    console.error("API usage stats error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
