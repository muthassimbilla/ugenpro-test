import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/tool"
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Handle error from Supabase
  if (error) {
    console.error("[v0] Auth callback error:", error, errorDescription)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (code) {
    const supabase = await createClient()

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("[v0] Code exchange error:", exchangeError)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent("Failed to verify email. Please try again.")}`,
      )
    }

    // Get the user to verify they're authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("[v0] User fetch error:", userError)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent("Authentication failed. Please try logging in.")}`,
      )
    }

    // Email verified successfully - redirect to intended destination
    console.log("[v0] Email verified successfully for user:", user.id)
    return NextResponse.redirect(`${requestUrl.origin}${next}?verified=true`)
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
