import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST - Create a notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get admin user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, title, message, type = "info", link } = body

    if (!userId || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create notification
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        type,
        link,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Create notification error:", error)
      return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
    }

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error("[v0] Create notification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
