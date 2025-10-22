import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Change password API called")

    const { currentPassword, newPassword } = await request.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 })
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({ error: "New password must be different from current password" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("[v0] User not authenticated:", userError)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("[v0] Updating password for user:", user.email)

    // The current password verification is now done on the client side before calling this API

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error("[v0] Password update error:", updateError)
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    console.log("[v0] Password updated successfully for user:", user.id)

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error: any) {
    console.error("[v0] Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
