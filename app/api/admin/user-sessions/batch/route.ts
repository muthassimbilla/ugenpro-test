import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userIds } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "User IDs array is required" }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    const { data: sessions, error } = await supabase
      .from("user_sessions")
      .select("user_id, ip_address")
      .in("user_id", userIds)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())

    if (error) {
      console.error("Error fetching batch user sessions:", error)
      return NextResponse.json({ error: "Failed to fetch user sessions" }, { status: 500 })
    }

    const sessionCounts: Record<string, number> = {}
    const deviceCounts: Record<string, number> = {}

    userIds.forEach((userId) => {
      sessionCounts[userId] = 0
      deviceCounts[userId] = 0
    })

    // Track unique IPs per user
    const userIPs: Record<string, Set<string>> = {}
    userIds.forEach((userId) => {
      userIPs[userId] = new Set()
    })

    sessions?.forEach((session) => {
      // Count sessions
      sessionCounts[session.user_id] = (sessionCounts[session.user_id] || 0) + 1

      // Track unique IPs (devices)
      if (session.ip_address) {
        userIPs[session.user_id].add(session.ip_address)
      }
    })

    // Convert unique IP sets to counts
    userIds.forEach((userId) => {
      deviceCounts[userId] = userIPs[userId].size
    })

    return NextResponse.json({
      success: true,
      sessionCounts,
      deviceCounts, // Added device counts
    })
  } catch (error: any) {
    console.error("Admin batch sessions API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
