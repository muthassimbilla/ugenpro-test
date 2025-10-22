import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

export async function GET(request: NextRequest) {
  try {
    console.log("[DEBUG] Starting session debug...")
    
    // Try to create service role client
    let supabase
    try {
      supabase = createServiceRoleClient()
      console.log("[DEBUG] Service role client created successfully")
    } catch (error: any) {
      console.error("[DEBUG] Failed to create service role client:", error.message)
      return NextResponse.json({
        error: "Service role client failed",
        details: error.message,
        suggestion: "Check SUPABASE_SERVICE_ROLE_KEY environment variable"
      }, { status: 500 })
    }

    // Test 1: Check total sessions
    const { data: totalSessions, error: totalError } = await supabase
      .from("user_sessions")
      .select("id", { count: "exact" })

    if (totalError) {
      console.error("[DEBUG] Error getting total sessions:", totalError)
    }

    // Test 2: Check active sessions
    const { data: activeSessions, error: activeError } = await supabase
      .from("user_sessions")
      .select("id", { count: "exact" })
      .eq("is_active", true)

    if (activeError) {
      console.error("[DEBUG] Error getting active sessions:", activeError)
    }

    // Test 3: Check non-expired sessions
    const { data: nonExpiredSessions, error: nonExpiredError } = await supabase
      .from("user_sessions")
      .select("id", { count: "exact" })
      .gt("expires_at", new Date().toISOString())

    if (nonExpiredError) {
      console.error("[DEBUG] Error getting non-expired sessions:", nonExpiredError)
    }

    // Test 4: Check active and non-expired sessions
    const { data: validSessions, error: validError } = await supabase
      .from("user_sessions")
      .select("id", { count: "exact" })
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())

    if (validError) {
      console.error("[DEBUG] Error getting valid sessions:", validError)
    }

    // Test 5: Get sample session data
    const { data: sampleSessions, error: sampleError } = await supabase
      .from("user_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    if (sampleError) {
      console.error("[DEBUG] Error getting sample sessions:", sampleError)
    }

    // Test 6: Check profiles count
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id", { count: "exact" })

    if (profilesError) {
      console.error("[DEBUG] Error getting profiles:", profilesError)
    }

    // Test 7: Check admins table
    const { data: admins, error: adminsError } = await supabase
      .from("admins")
      .select("*")

    if (adminsError) {
      console.error("[DEBUG] Error getting admins:", adminsError)
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      counts: {
        totalSessions: totalSessions?.length || 0,
        activeSessions: activeSessions?.length || 0,
        nonExpiredSessions: nonExpiredSessions?.length || 0,
        validSessions: validSessions?.length || 0,
        totalProfiles: profiles?.length || 0,
        totalAdmins: admins?.length || 0
      },
      errors: {
        totalError: totalError?.message,
        activeError: activeError?.message,
        nonExpiredError: nonExpiredError?.message,
        validError: validError?.message,
        sampleError: sampleError?.message,
        profilesError: profilesError?.message,
        adminsError: adminsError?.message
      },
      sampleSessions: sampleSessions || [],
      admins: admins || []
    }

    console.log("[DEBUG] Debug info:", debugInfo)

    return NextResponse.json({
      success: true,
      debug: debugInfo
    })

  } catch (error: any) {
    console.error("[DEBUG] Unexpected error:", error)
    return NextResponse.json({
      error: "Unexpected error",
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
