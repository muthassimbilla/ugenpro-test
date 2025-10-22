import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    // Get active sessions for the user
    const { data: sessions, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user sessions:", error)
      return NextResponse.json(
        { error: "Failed to fetch user sessions" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || []
    })

  } catch (error: any) {
    console.error("Admin sessions API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    // Deactivate the session
    const { error } = await supabase
      .from("user_sessions")
      .update({ 
        is_active: false,
        logout_reason: "Terminated by admin"
      })
      .eq("id", sessionId)

    if (error) {
      console.error("Error terminating session:", error)
      return NextResponse.json(
        { error: "Failed to terminate session" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Session terminated successfully"
    })

  } catch (error: any) {
    console.error("Admin terminate session API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
