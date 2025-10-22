import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const result = await AuthService.login({ email, password })
    
    return NextResponse.json({
      success: true,
      user: result.user,
      userStatus: result.userStatus,
    })
  } catch (error: any) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 400 }
    )
  }
}
