import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { verifyAdminAuth } from "@/lib/admin-auth-helper"

// POST - Send bulk notifications (admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    const authResult = await verifyAdminAuth(authHeader)

    if (!authResult.isValid) {
      console.log("[v0] Unauthorized access attempt to bulk notifications")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Admin authenticated, processing bulk notification request")

    const supabase = createServiceRoleClient()
    const body = await request.json()
    const { userIds, title, message, type = "info", link, sendToAll } = body

    console.log("[v0] Request body:", { userIds, title, message, type, link, sendToAll })
    console.log("[v0] userIds type:", typeof userIds, "isArray:", Array.isArray(userIds))
    console.log("[v0] userIds length:", userIds?.length)

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    let targetUserIds = userIds || []

    // If sendToAll is true, get all user IDs
    if (sendToAll) {
      console.log("[v0] sendToAll is true, fetching all users from database")
      const { data: allUsers, error: usersError } = await supabase.from("profiles").select("id").not("id", "is", null)

      if (usersError) {
        console.error("[v0] Error fetching all users:", usersError)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
      }

      targetUserIds = allUsers?.map((user) => user.id) || []
      console.log("[v0] Fetched", targetUserIds.length, "users from database")
    } else {
      console.log("[v0] sendToAll is false, using provided userIds:", targetUserIds)
    }

    if (targetUserIds.length === 0) {
      console.log("[v0] No target users found")
      return NextResponse.json({ error: "No users specified" }, { status: 400 })
    }

    console.log("[v0] Creating notifications for", targetUserIds.length, "users")

    // Create notifications for all specified users
    const notifications = targetUserIds.map((userId: string) => ({
      user_id: userId,
      title,
      message,
      type,
      link: link || null,
    }))

    console.log("[v0] Inserting", notifications.length, "notifications into database")

    const { data: createdNotifications, error } = await supabase.from("notifications").insert(notifications).select()

    if (error) {
      console.error("[v0] Bulk create notifications error:", error)
      return NextResponse.json(
        { error: "Failed to create bulk notifications", details: error.message },
        { status: 500 },
      )
    }

    console.log("[v0] Successfully created", createdNotifications?.length || 0, "notifications")
    return NextResponse.json({
      success: true,
      message: `Successfully sent ${createdNotifications?.length || 0} notifications`,
      count: createdNotifications?.length || 0,
      notifications: createdNotifications,
    })
  } catch (error) {
    console.error("[v0] Bulk notifications API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// GET - Get bulk notification templates (admin only)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    const authResult = await verifyAdminAuth(authHeader)

    if (!authResult.isValid) {
      console.log("[v0] Unauthorized access attempt to notification templates")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Admin authenticated, returning notification templates")

    // Return predefined notification templates
    const templates = [
      {
        id: "welcome",
        title: "স্বাগতম UGen Pro তে!",
        message: "Your account has been created successfully. Start using our tools now.",
        type: "success",
        link: "/tool",
      },
      {
        id: "account_approved",
        title: "অ্যাকাউন্ট অনুমোদিত",
        message: "Your account has been approved. You can now use all features.",
        type: "success",
        link: "/profile",
      },
      {
        id: "maintenance",
        title: "সিস্টেম রক্ষণাবেক্ষণ",
        message: "আমরা সিস্টেম রক্ষণাবেক্ষণের জন্য অস্থায়ীভাবে সেবা বন্ধ রাখব। অসুবিধার জন্য দুঃখিত।",
        type: "warning",
        link: null,
      },
      {
        id: "new_feature",
        title: "নতুন ফিচার যোগ হয়েছে!",
        message: "আমাদের নতুন AI-চালিত কন্টেন্ট জেনারেটর দেখুন!",
        type: "info",
        link: "/tool",
      },
      {
        id: "account_expiring",
        title: "অ্যাকাউন্ট শীঘ্রই মেয়াদ উত্তীর্ণ",
        message: "Your account will expire in 7 days. Please renew to continue service.",
        type: "warning",
        link: "/profile",
      },
      {
        id: "security_alert",
        title: "নিরাপত্তা সতর্কতা",
        message: "Suspicious activity detected on your account. Please change your password immediately.",
        type: "error",
        link: "/change-password",
      },
    ]

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("[v0] Get notification templates API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
