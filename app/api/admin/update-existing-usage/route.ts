import { type NextRequest, NextResponse } from "next/server"
import { ApiRateLimiter } from "@/lib/api-rate-limiter"

// Manual API to update existing usage records
export async function POST(request: NextRequest) {
  try {
    const rateLimiter = new ApiRateLimiter()

    console.log("Updating existing usage records...")

    const success = await rateLimiter.updateExistingUsageRecords()

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Existing usage records updated successfully",
      })
    } else {
      return NextResponse.json({ error: "Failed to update existing usage records" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating existing usage records:", error)
    return NextResponse.json({ error: "Failed to update existing usage records" }, { status: 500 })
  }
}
