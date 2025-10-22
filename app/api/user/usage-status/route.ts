import { type NextRequest, NextResponse } from "next/server"
import { ApiRateLimiter } from "@/lib/api-rate-limiter"
import { getAuthenticatedUser } from "@/lib/api-auth-helper"
import type { ApiType } from "@/lib/api-rate-limiter"

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }
    
    const user = authResult.user

    const { apiType } = await request.json()
    
    if (!apiType || !['address_generator', 'email2name'].includes(apiType)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid API type" 
      }, { status: 400 })
    }

    const rateLimiter = new ApiRateLimiter()
    const usageResult = await rateLimiter.getOrCreateTodayUsage(user.id, apiType as ApiType)

    return NextResponse.json({
      success: true,
      usage: {
        daily_count: usageResult.daily_count,
        daily_limit: usageResult.daily_limit,
        remaining: usageResult.remaining,
        unlimited: usageResult.unlimited,
        success: usageResult.success
      }
    })

  } catch (error) {
    console.error("Usage status API error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }
    
    const user = authResult.user

    const rateLimiter = new ApiRateLimiter()
    const allUsage = await rateLimiter.getAllUserUsage(user.id)

    // Convert to the format our component expects
    const usageData: Record<string, any> = {}
    
    for (const [apiType, usage] of Object.entries(allUsage)) {
      if (usage) {
        usageData[apiType] = {
          daily_count: usage.daily_count,
          daily_limit: usage.daily_limit,
          remaining: usage.is_unlimited ? 'unlimited' : (usage.daily_limit - usage.daily_count),
          unlimited: usage.is_unlimited,
          success: true
        }
      } else {
        // Default values if no usage record exists yet
        usageData[apiType] = {
          daily_count: 0,
          daily_limit: 200,
          remaining: 200,
          unlimited: false,
          success: true
        }
      }
    }

    return NextResponse.json({
      success: true,
      usage: usageData
    })

  } catch (error) {
    console.error("All usage status API error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
