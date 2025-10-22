import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 })
    }

    // Get user's devices with session information
    const { data: devices, error } = await supabase
      .from("user_devices")
      .select(`
        *,
        user_sessions!inner(
          id,
          ip_address,
          last_accessed,
          is_active,
          expires_at
        )
      `)
      .eq("user_id", user.id)
      .order("last_seen", { ascending: false })

    if (error) {
      console.error("Error fetching user devices:", error)
      return NextResponse.json({ error: "ডিভাইস তথ্য লোড করতে সমস্যা হয়েছে" }, { status: 500 })
    }

    // Get current session to identify current device
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const currentDeviceFingerprint = session?.user?.id // Use user ID as fallback

    const processedDevices =
      devices?.map((device) => ({
        ...device,
        is_current: device.device_fingerprint === currentDeviceFingerprint,
        active_sessions:
          device.user_sessions?.filter((session: any) => session.is_active && new Date(session.expires_at) > new Date())
            .length || 0,
      })) || []

    return NextResponse.json({
      success: true,
      data: processedDevices,
    })
  } catch (error) {
    console.error("[v0] User devices API error:", error)
    return NextResponse.json({ error: "সার্ভার ত্রুটি" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "logout-others") {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        return NextResponse.json({ error: "সেশন পাওয়া যায়নি" }, { status: 401 })
      }

      // Logout from all other devices using RPC function
      const { error } = await supabase.rpc("logout_other_devices", {
        p_user_id: user.id,
        p_current_session_id: session.access_token, // Use access token as session identifier
      })

      if (error) {
        console.error("Error logging out other devices:", error)
        return NextResponse.json({ error: "অন্যান্য ডিভাইস থেকে লগআউট করতে সমস্যা হয়েছে" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "অন্যান্য সকল ডিভাইস থেকে সফলভাবে লগআউট হয়েছে",
      })
    }

    return NextResponse.json({ error: "অবৈধ অ্যাকশন" }, { status: 400 })
  } catch (error) {
    console.error("[v0] User devices DELETE API error:", error)
    return NextResponse.json({ error: "সার্ভার ত্রুটি" }, { status: 500 })
  }
}
