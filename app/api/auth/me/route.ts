import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-client"

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error: any) {
    console.error("Get current user API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get user" },
      { status: 400 }
    )
  }
}
