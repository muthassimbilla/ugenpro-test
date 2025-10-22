import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, email, password } = body

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email and password are required" },
        { status: 400 }
      )
    }

    await AuthService.signup({ full_name, email, password })
    
    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please check your email to verify your account.",
    })
  } catch (error: any) {
    console.error("Signup API error:", error)
    return NextResponse.json(
      { error: error.message || "Signup failed" },
      { status: 400 }
    )
  }
}
