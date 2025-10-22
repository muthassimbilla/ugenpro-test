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
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    // Get unique IP count for this user (device count)
    const { data: ipHistory, error: ipError } = await supabase
      .from("user_ip_history")
      .select("ip_address")
      .eq("user_id", user.id)
      .eq("is_current", true)

    if (ipError) {
      console.error("Error fetching IP history:", ipError)
      return NextResponse.json({ error: "Failed to fetch device count" }, { status: 500 })
    }

    // Count unique IP addresses
    const uniqueIPs = new Set(ipHistory?.map((ip) => ip.ip_address) || [])
    const deviceCount = uniqueIPs.size

    return NextResponse.json({
      success: true,
      data: {
        device_count: deviceCount,
        unique_ips: Array.from(uniqueIPs),
      },
    })
  } catch (error) {
    console.error("Error in device-count API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
