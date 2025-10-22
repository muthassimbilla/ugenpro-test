import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/auth-server"

// Helper function to extract device name from user agent
function extractDeviceName(userAgent: string): string {
  if (userAgent.includes("iPhone")) return "iPhone"
  if (userAgent.includes("iPad")) return "iPad"
  if (userAgent.includes("Android")) return "Android Device"
  if (userAgent.includes("Windows")) return "Windows PC"
  if (userAgent.includes("Mac")) return "Mac"
  if (userAgent.includes("Linux")) return "Linux PC"
  return "Unknown Device"
}

// Helper function to extract browser from user agent
function extractBrowser(userAgent: string): string {
  if (userAgent.includes("Chrome")) return "Chrome"
  if (userAgent.includes("Firefox")) return "Firefox"
  if (userAgent.includes("Safari")) return "Safari"
  if (userAgent.includes("Edge")) return "Edge"
  return "Unknown Browser"
}

// Helper function to extract OS from user agent
function extractOS(userAgent: string): string {
  if (userAgent.includes("Windows NT 10.0")) return "Windows 10"
  if (userAgent.includes("Windows NT 6.1")) return "Windows 7"
  if (userAgent.includes("Mac OS X")) return "macOS"
  if (userAgent.includes("Android")) return "Android"
  if (userAgent.includes("iPhone OS")) return "iOS"
  return "Unknown OS"
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get devices based on unique IP addresses instead of sessions
    let processedDevices = []
    
    // Get IP history for this user to create devices based on unique IPs
    const { data: ipHistory, error: ipError } = await supabase
      .from("user_ip_history")
      .select("*")
      .eq("user_id", userId)
      .eq("is_current", true)
      .order("created_at", { ascending: false })

    if (ipError) {
      console.error("Error fetching IP history:", ipError)
      return NextResponse.json({ error: "Failed to fetch IP history" }, { status: 500 })
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
            user_id: userId,
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

      // Convert map to array
      processedDevices = Array.from(deviceMap.values())
      console.log("Created devices from IP history:", processedDevices.length)
    } else {
      // If no IP history, return empty array
      processedDevices = []
    }

    return NextResponse.json({
      success: true,
      data: processedDevices
    })

  } catch (error) {
    console.error("Error in user-devices API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    const action = searchParams.get("action")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (action === "logout-others") {
      // Logout from all other devices (IPs) except current one
      const { error } = await supabase
        .from("user_sessions")
        .update({ 
          is_active: false, 
          logout_reason: "admin_logout_others",
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .eq("is_active", true)

      if (error) {
        console.error("Error logging out other devices:", error)
        return NextResponse.json({ error: "Failed to logout other devices" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Successfully logged out from other devices"
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (error) {
    console.error("Error in user-devices DELETE API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
