import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Build query
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    // Filter by unread if requested
    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error("[v0] Fetch notifications error:", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
    })
  } catch (error) {
    console.error("[v0] Notifications API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) {
        console.error("[v0] Mark all as read error:", error)
        return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "All notifications marked as read" })
    } else if (notificationId) {
      // Mark single notification as read
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", user.id)

      if (error) {
        console.error("[v0] Mark as read error:", error)
        return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Notification marked as read" })
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Mark as read API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("id")

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    const { error } = await supabase.from("notifications").delete().eq("id", notificationId).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Delete notification error:", error)
      return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Notification deleted" })
  } catch (error) {
    console.error("[v0] Delete notification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
