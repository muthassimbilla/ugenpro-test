import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get all users first
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, telegram_username")
      .order("created_at", { ascending: false })

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    const allDevices = []

    // Get devices for each user
    for (const user of users || []) {
      // Get IP history for this user to create devices based on unique IPs
      const { data: ipHistory, error: ipError } = await supabase
        .from("user_ip_history")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_current", true)
        .order("created_at", { ascending: false })

      if (ipError) {
        console.error("Error fetching IP history for user:", user.id, ipError)
        continue
      }

      if (ipHistory && ipHistory.length > 0) {
        // Group IPs by unique IP address
        const deviceMap = new Map()
        
        ipHistory.forEach(ipRecord => {
          const ipAddress = ipRecord.ip_address
          
          if (!deviceMap.has(ipAddress)) {
            deviceMap.set(ipAddress, {
              device_fingerprint: `ip-${ipAddress}`,
              device_name: `Device from ${ipAddress}`,
              browser_info: "Unknown Browser",
              os_info: "Unknown OS",
              screen_resolution: "Unknown",
              timezone: "Unknown",
              language: "Unknown",
              first_seen: ipRecord.created_at,
              last_seen: ipRecord.updated_at || ipRecord.created_at,
              is_trusted: true,
              is_blocked: false,
              total_logins: 1,
              user_id: user.id,
              full_name: user.full_name,
              telegram_username: user.telegram_username,
              ip_address: ipAddress,
              country: ipRecord.country || "Unknown",
              city: ipRecord.city || "Unknown",
              current_ips: [ipAddress],
              ip_history: [{
                ip_address: ipAddress,
                country: ipRecord.country || "Unknown",
                city: ipRecord.city || "Unknown",
                isp: ipRecord.isp || "Unknown",
                first_seen: ipRecord.created_at,
                last_seen: ipRecord.updated_at || ipRecord.created_at,
                is_current: true
              }],
              active_sessions: 1
            })
          } else {
            const device = deviceMap.get(ipAddress)
            device.total_logins += 1
            device.active_sessions += 1
            
            // Update last_seen to the most recent IP record
            if (new Date(ipRecord.updated_at || ipRecord.created_at) > new Date(device.last_seen)) {
              device.last_seen = ipRecord.updated_at || ipRecord.created_at
            }
          }
        })

        // Convert map to array and add to allDevices
        const userDevices = Array.from(deviceMap.values())
        allDevices.push(...userDevices)
      }
    }

    return NextResponse.json({
      success: true,
      data: allDevices
    })

  } catch (error) {
    console.error("Error in all-devices API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
