import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const adminToken = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!adminToken) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস - অ্যাডমিন টোকেন প্রয়োজন" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get recent user registrations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentUsers, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, telegram_username, created_at, is_approved, approved_at")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(5)

    if (usersError) {
      console.error("Error fetching recent users:", usersError)
    }

    // Get recent user approvals (last 7 days)
    const { data: recentApprovals, error: approvalsError } = await supabase
      .from("users")
      .select("id, full_name, telegram_username, approved_at")
      .not("approved_at", "is", null)
      .gte("approved_at", sevenDaysAgo)
      .order("approved_at", { ascending: false })
      .limit(3)

    if (approvalsError) {
      console.error("Error fetching recent approvals:", approvalsError)
    }

    // Get recent login sessions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentSessions, error: sessionsError } = await supabase
      .from("user_sessions")
      .select(`
        id,
        user_id,
        ip_address,
        user_agent,
        created_at,
        users(full_name, telegram_username)
      `)
      .gte("created_at", oneDayAgo)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5)

    if (sessionsError) {
      console.error("Error fetching recent sessions:", sessionsError)
    }

    // Get recent IP changes (last 24 hours)
    const { data: recentIPChanges, error: ipError } = await supabase
      .from("user_sessions")
      .select(`
        user_id,
        ip_address,
        logout_reason,
        created_at,
        users(full_name, telegram_username)
      `)
      .eq("logout_reason", "ip_address_changed")
      .gte("created_at", oneDayAgo)
      .order("created_at", { ascending: false })
      .limit(3)

    if (ipError) {
      console.error("Error fetching recent IP changes:", ipError)
    }

    // Process activities
    const activities = []

    // Add user registrations
    if (recentUsers) {
      recentUsers.forEach((user) => {
        activities.push({
          id: `user-${user.id}`,
          type: "user",
          action: "New User Registration",
          user: user.full_name,
          username: user.telegram_username,
          time: user.created_at,
          details: `@${user.telegram_username} registered`,
          icon: "Users",
          color: "blue"
        })
      })
    }

    // Add user approvals
    if (recentApprovals) {
      recentApprovals.forEach((user) => {
        activities.push({
          id: `approval-${user.id}`,
          type: "approval",
          action: "User Approved",
          user: user.full_name,
          username: user.telegram_username,
          time: user.approved_at,
          details: `@${user.telegram_username} account approved`,
          icon: "CheckCircle",
          color: "green"
        })
      })
    }

    // Add recent logins
    if (recentSessions) {
      recentSessions.forEach((session) => {
        activities.push({
          id: `login-${session.id}`,
          type: "login",
          action: "User Login",
          user: session.users?.full_name || "Unknown",
          username: session.users?.telegram_username || "unknown",
          time: session.created_at,
          details: `Login from ${session.ip_address}`,
          icon: "LogIn",
          color: "purple"
        })
      })
    }

    // Add IP changes
    if (recentIPChanges) {
      recentIPChanges.forEach((change) => {
        activities.push({
          id: `ip-${change.user_id}-${change.created_at}`,
          type: "security",
          action: "IP Address Changed",
          user: change.users?.full_name || "Unknown",
          username: change.users?.telegram_username || "unknown",
          time: change.created_at,
          details: `New IP: ${change.ip_address}`,
          icon: "Shield",
          color: "orange"
        })
      })
    }

    // Sort by time (most recent first)
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    return NextResponse.json({
      success: true,
      data: activities.slice(0, 10) // Return top 10 most recent activities
    })

  } catch (error) {
    console.error("Error in recent-activity API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
