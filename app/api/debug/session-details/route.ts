import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Get detailed session data
    const { data: sessions, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching session details:", error)
      return NextResponse.json(
        { error: "Failed to fetch session details" },
        { status: 500 }
      )
    }

    // Get user profile info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single()

    const debugInfo = {
      userId,
      profile: profile || null,
      sessionsCount: sessions?.length || 0,
      sessions: sessions?.map(session => ({
        id: session.id,
        user_id: session.user_id,
        session_token: session.session_token?.substring(0, 20) + "...",
        ip_address: session.ip_address,
        user_agent: session.user_agent,
        is_active: session.is_active,
        expires_at: session.expires_at,
        created_at: session.created_at,
        last_accessed: session.last_accessed,
        logout_reason: session.logout_reason
      })) || [],
      rawSessions: sessions || []
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo
    })

  } catch (error: any) {
    console.error("Debug session details API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
