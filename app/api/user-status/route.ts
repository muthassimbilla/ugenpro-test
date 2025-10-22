import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          is_valid: false,
          status: "inactive",
          message: "User not authenticated",
        },
        { status: 401 },
      )
    }

    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id, is_active, account_status, expiration_date")
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      console.warn("[v0] Profile not found for user:", user.id, userError)
      return NextResponse.json({
        is_valid: true,
        status: "active",
        message: "Your account is active.",
      })
    }

    // Check if user is deactivated
    if (userData.account_status === "inactive") {
      return NextResponse.json({
        is_valid: false,
        status: "deactivated",
        message: "Your account has been deactivated. Please contact support.",
      })
    }

    // Check if user is suspended
    if (userData.account_status === "suspended") {
      return NextResponse.json({
        is_valid: false,
        status: "suspended",
        message: "Your account has been suspended. Please contact support.",
      })
    }

    // Check if user account is expired
    if (userData.expiration_date && new Date(userData.expiration_date) < new Date()) {
      return NextResponse.json({
        is_valid: false,
        status: "expired",
        message: "Your account has expired.",
        expiration_date: userData.expiration_date,
      })
    }

    // User is active
    return NextResponse.json({
      is_valid: true,
      status: "active",
      message: "Your account is active.",
    })
  } catch (error) {
    console.error("[v0] User status check error:", error)

    // For server errors, return a safe status that doesn't trigger auto-logout
    // Only return invalid status for authentication-related errors
    if (error instanceof Error && error.message?.includes("auth")) {
      return NextResponse.json(
        {
          is_valid: false,
          status: "inactive",
          message: "Authentication error. Please login again.",
        },
        { status: 401 },
      )
    }

    // For other errors, assume user is active to prevent unnecessary logouts
    return NextResponse.json({
      is_valid: true,
      status: "active",
      message: "Your account is active.",
    })
  }
}
