import { type NextRequest, NextResponse } from "next/server"
import { ApiRateLimiter } from "@/lib/api-rate-limiter"
import { getAuthenticatedUser } from "@/lib/api-auth-helper"

// GET: Get today's API usage statistics
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("Fetching today's API usage statistics...")

    const today = new Date().toISOString().split("T")[0]
    console.log("Today date:", today)

    const rateLimiter = new ApiRateLimiter()

    // Get all usage for today
    const todayUsage = await rateLimiter.getAllUsageByDate(today)
    console.log("Today usage data:", todayUsage)
    console.log("Usage data length:", todayUsage.length)

    // Calculate statistics
    const stats = {
      totalUsers: new Set(todayUsage.map((u) => u.user_id)).size,
      totalApiCalls: todayUsage.reduce((sum, u) => sum + u.daily_count, 0),
      byApiType: {
        address_generator: {
          totalCalls: todayUsage
            .filter((u) => u.api_type === "address_generator")
            .reduce((sum, u) => sum + u.daily_count, 0),
          activeUsers: new Set(todayUsage.filter((u) => u.api_type === "address_generator").map((u) => u.user_id)).size,
          users: todayUsage.filter((u) => u.api_type === "address_generator").length,
        },
        email2name: {
          totalCalls: todayUsage.filter((u) => u.api_type === "email2name").reduce((sum, u) => sum + u.daily_count, 0),
          activeUsers: new Set(todayUsage.filter((u) => u.api_type === "email2name").map((u) => u.user_id)).size,
          users: todayUsage.filter((u) => u.api_type === "email2name").length,
        },
      },
      topUsers: todayUsage
        .reduce((acc, usage) => {
          const existing = acc.find((u) => u.user_id === usage.user_id)
          if (existing) {
            existing.totalCalls += usage.daily_count
            existing[usage.api_type] = usage.daily_count
          } else {
            acc.push({
              user_id: usage.user_id,
              totalCalls: usage.daily_count,
              [usage.api_type]: usage.daily_count,
              address_generator: usage.api_type === "address_generator" ? usage.daily_count : 0,
              email2name: usage.api_type === "email2name" ? usage.daily_count : 0,
            })
          }
          return acc
        }, [] as any[])
        .sort((a, b) => b.totalCalls - a.totalCalls)
        .slice(0, 10),
    }

    return NextResponse.json({
      success: true,
      date: today,
      stats: stats,
      rawData: todayUsage,
    })
  } catch (error) {
    console.error("Error fetching today usage stats:", error)
    return NextResponse.json({ error: "Failed to fetch today usage stats" }, { status: 500 })
  }
}
