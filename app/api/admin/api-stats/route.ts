import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/auth-server"

// In-memory storage for API stats (in production, use database)
let apiStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [] as number[],
  errors: [] as Array<{
    timestamp: string
    error: string
    email: string
    requestId: string
  }>,
  lastReset: new Date().toISOString()
}

// Function to add request stats
export function addApiRequest(success: boolean, responseTime: number, error?: string, email?: string, requestId?: string) {
  apiStats.totalRequests++
  
  if (success) {
    apiStats.successfulRequests++
  } else {
    apiStats.failedRequests++
    if (error && email && requestId) {
      apiStats.errors.unshift({
        timestamp: new Date().toISOString(),
        error,
        email,
        requestId
      })
      // Keep only last 50 errors
      if (apiStats.errors.length > 50) {
        apiStats.errors = apiStats.errors.slice(0, 50)
      }
    }
  }
  
  apiStats.responseTimes.push(responseTime)
  // Keep only last 1000 response times
  if (apiStats.responseTimes.length > 1000) {
    apiStats.responseTimes = apiStats.responseTimes.slice(-1000)
  }
}

export async function GET(request: NextRequest) {
  try {
    // For now, allow access without strict token validation
    // In production, implement proper admin authentication
    console.log("[v0] API Stats endpoint accessed")

    // Calculate statistics
    const averageResponseTime = apiStats.responseTimes.length > 0 
      ? Math.round(apiStats.responseTimes.reduce((a, b) => a + b, 0) / apiStats.responseTimes.length)
      : 0

    // Calculate last 24 hours stats (simplified - in production, use proper time-based filtering)
    const last24Hours = {
      requests: Math.floor(apiStats.totalRequests * 0.3), // Simulate 30% of total in last 24h
      errors: Math.floor(apiStats.failedRequests * 0.3),
      avgResponseTime: averageResponseTime
    }

    // Get quota information (simulate - in production, get from Google API)
    const quotaInfo = {
      used: Math.floor(apiStats.totalRequests * 0.8), // Simulate 80% of requests as quota usage
      limit: 1000, // Simulate daily limit
      percentage: Math.min((apiStats.totalRequests * 0.8 / 1000) * 100, 100)
    }

    // Get recent errors (last 10)
    const recentErrors = apiStats.errors.slice(0, 10)

    const stats = {
      totalRequests: apiStats.totalRequests,
      successfulRequests: apiStats.successfulRequests,
      failedRequests: apiStats.failedRequests,
      averageResponseTime,
      last24Hours,
      quotaInfo,
      recentErrors,
      lastUpdated: new Date().toISOString(),
      lastReset: apiStats.lastReset
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error("Error fetching API stats:", error)
    return NextResponse.json({ 
      error: "Failed to fetch API statistics" 
    }, { status: 500 })
  }
}

// Reset stats endpoint
export async function POST(request: NextRequest) {
  try {
    // For now, allow access without strict token validation
    // In production, implement proper admin authentication
    console.log("[v0] API Stats reset endpoint accessed")

    const { action } = await request.json()
    
    if (action === "reset") {
      apiStats = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        responseTimes: [],
        errors: [],
        lastReset: new Date().toISOString()
      }
      
      return NextResponse.json({
        success: true,
        message: "API statistics reset successfully"
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (error) {
    console.error("Error resetting API stats:", error)
    return NextResponse.json({ 
      error: "Failed to reset API statistics" 
    }, { status: 500 })
  }
}
