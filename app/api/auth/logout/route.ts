import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-client"

export async function POST(request: NextRequest) {
  try {
    await AuthService.logout()
    
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error: any) {
    console.error("Logout API error:", error)
    return NextResponse.json(
      { error: error.message || "Logout failed" },
      { status: 400 }
    )
  }
}
