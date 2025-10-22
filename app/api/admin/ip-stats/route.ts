import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/auth-server"

// Admin API to get IP and device statistics
export async function GET(request: NextRequest) {
  try {
    const adminToken = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!adminToken) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস - অ্যাডমিন টোকেন প্রয়োজন" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get total users
    const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

    // Get active sessions count
    const { count: activeSessions } = await supabase
      .from("user_sessions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())

    // Get total devices (based on unique IPs)
    const { data: uniqueIPs } = await supabase.from("user_ip_history").select("ip_address").eq("is_current", true)
    const totalDevices = new Set(uniqueIPs?.map((ip) => ip.ip_address)).size

    // Get unique IPs count (same as total devices now)
    const uniqueIPCount = totalDevices

    // Get users with multiple devices (count users with more than 1 unique IP)
    const { data: multiDeviceUsers } = await supabase
      .from("user_ip_history")
      .select("user_id")
      .eq("is_current", true)
      .not("user_id", "is", null)

    const userIPCounts = multiDeviceUsers?.reduce((acc: any, item: any) => {
      acc[item.user_id] = (acc[item.user_id] || 0) + 1
      return acc
    }, {}) || {}

    const multiDeviceUsersCount = Object.values(userIPCounts).filter((count: any) => count > 1).length

    // Get recent IP changes (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentIPChanges } = await supabase
      .from("user_sessions")
      .select(`
        user_id,
        ip_address,
        logout_reason,
        created_at,
        users(full_name, telegram_username)
      `)
      .eq("logout_reason", "ip_address_changed")
      .gte("created_at", yesterday)
      .order("created_at", { ascending: false })

    // Get top countries by user count
    const { data: countryStats } = await supabase
      .from("user_ip_history")
      .select("country")
      .eq("is_current", true)
      .not("country", "is", null)

    const countryCounts =
      countryStats?.reduce((acc: any, item: any) => {
        acc[item.country] = (acc[item.country] || 0) + 1
        return acc
      }, {}) || {}

    const topCountries = Object.entries(countryCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }))

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total_users: totalUsers || 0,
          active_sessions: activeSessions || 0,
          total_devices: totalDevices || 0,
          unique_ips: uniqueIPCount || 0,
          multi_device_users: multiDeviceUsersCount || 0,
        },
        recent_ip_changes: recentIPChanges || [],
        top_countries: topCountries,
        last_updated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Admin IP stats API error:", error)
    return NextResponse.json({ error: "সার্ভার ত্রুটি" }, { status: 500 })
  }
}
