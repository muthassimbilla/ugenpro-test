import { type NextRequest, NextResponse } from "next/server"
import { ApiRateLimiter } from "@/lib/api-rate-limiter"
import { getAuthenticatedUser } from "@/lib/api-auth-helper"

// GET: Get all global limits
export async function GET(request: NextRequest) {
  try {
    const rateLimiter = new ApiRateLimiter()

    // Check admin authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("Fetching global limits for user:", user.id)
    const limits = await rateLimiter.getGlobalLimits()
    console.log("Global limits result:", limits)

    return NextResponse.json({
      success: true,
      limits: limits,
    })
  } catch (error) {
    console.error("Error fetching global limits:", error)
    return NextResponse.json(
      { error: "Failed to fetch global limits", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// POST: Update global limit
export async function POST(request: NextRequest) {
  try {
    const rateLimiter = new ApiRateLimiter()

    // Check admin authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // TODO: Add admin role check here
    // For now, allow any authenticated user to update

    const body = await request.json()
    const { api_type, daily_limit, is_unlimited } = body

    if (!api_type || daily_limit === undefined || is_unlimited === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: api_type, daily_limit, is_unlimited" },
        { status: 400 },
      )
    }

    if (!["address_generator", "email2name"].includes(api_type)) {
      return NextResponse.json({ error: "Invalid api_type. Must be address_generator or email2name" }, { status: 400 })
    }

    if (!is_unlimited && (daily_limit < 1 || daily_limit > 10000)) {
      return NextResponse.json({ error: "Daily limit must be between 1 and 10000" }, { status: 400 })
    }

    const success = await rateLimiter.setGlobalLimit(api_type, is_unlimited ? 0 : daily_limit, is_unlimited)

    if (!success) {
      return NextResponse.json({ error: "Failed to update global limit" }, { status: 500 })
    }

    // Update existing usage records to use new global limits
    const updateSuccess = await rateLimiter.updateExistingUsageRecords()
    if (!updateSuccess) {
      console.warn("Failed to update existing usage records, but global limit was saved")
    }

    return NextResponse.json({
      success: true,
      message: "Global limit updated successfully",
    })
  } catch (error) {
    console.error("Error updating global limit:", error)
    return NextResponse.json({ error: "Failed to update global limit" }, { status: 500 })
  }
}
