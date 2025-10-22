import { type NextRequest, NextResponse } from "next/server"
import { ApiRateLimiter } from "@/lib/api-rate-limiter"

// Test API to check if global limits are being applied
export async function GET(request: NextRequest) {
  try {
    const rateLimiter = new ApiRateLimiter()

    console.log("Testing global limits application...")

    // Test 1: Get global limits
    const globalLimits = await rateLimiter.getGlobalLimits()
    console.log("Global limits:", globalLimits)

    // Test 2: Test get_or_create_daily_usage function with a test user
    // We'll use a dummy user ID for testing
    const testUserId = "00000000-0000-0000-0000-000000000000"

    try {
      const testUsage = await rateLimiter.getOrCreateTodayUsage(testUserId, "address_generator")
      console.log("Test usage result:", testUsage)

      return NextResponse.json({
        success: true,
        globalLimits: globalLimits,
        testUsage: testUsage,
        message: "Global limits test completed",
      })
    } catch (usageError) {
      console.error("Usage test error:", usageError)
      return NextResponse.json({
        success: true,
        globalLimits: globalLimits,
        usageError: usageError instanceof Error ? usageError.message : "Unknown error",
        message: "Global limits retrieved but usage test failed",
      })
    }
  } catch (error) {
    console.error("Error testing global limits:", error)
    return NextResponse.json({ error: "Failed to test global limits" }, { status: 500 })
  }
}
