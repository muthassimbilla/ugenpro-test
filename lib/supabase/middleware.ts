import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Handle CORS for different domains
  const origin = request.headers.get("origin")
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://ugenpro.site",
    "https://www.ugenpro.site",
  ]

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // This ensures the session is valid when API routes call getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Set CORS headers if origin is allowed
  if (origin && allowedOrigins.some((allowed) => origin.includes(allowed.replace(/^https?:\/\//, "")))) {
    supabaseResponse.headers.set("Access-Control-Allow-Origin", origin)
    supabaseResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    supabaseResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    supabaseResponse.headers.set("Access-Control-Allow-Credentials", "true")
  }

  // Don't do any redirects for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return supabaseResponse
  }

  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/privacy-policy",
    "/terms-of-service",
    "/adminbilla",
  ]

  const isPublicRoute = publicRoutes.some((route) => {
    // Exact match for home page
    if (route === "/" && request.nextUrl.pathname === "/") {
      return true
    }
    // For other routes, check if pathname starts with the route
    return route !== "/" && request.nextUrl.pathname.startsWith(route)
  })

  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const url = request.nextUrl.clone()
    url.pathname = "/tool"
    return NextResponse.redirect(url)
  }

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    const redirectPath = request.nextUrl.pathname + request.nextUrl.search
    url.pathname = "/login"
    url.searchParams.set("redirect", redirectPath)
    return NextResponse.redirect(url)
  }

  if (user && !isPublicRoute) {
    const statusPages = ["/premium-tools", "/account-error", "/account-blocked", "/premium-tools/orders"]
    const isOnStatusPage = statusPages.some((page) => request.nextUrl.pathname.startsWith(page))

    if (!isOnStatusPage) {
      try {
        // Fetch user profile to check account status
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("account_status, is_approved, expiration_date, is_active")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("[v0] Error fetching user profile:", error)
          // If we can't fetch profile, allow access (fail open to avoid blocking legitimate users)
          return supabaseResponse
        }

        if (profile) {
          const now = new Date()
          const expirationDate = profile.expiration_date ? new Date(profile.expiration_date) : null
          const isExpired = expirationDate && expirationDate < now

          // Check if account is suspended or inactive
          if (profile.account_status === "suspended" || profile.account_status === "inactive" || !profile.is_active) {
            console.log("[v0] User account is suspended/inactive, redirecting to error page")
            const url = request.nextUrl.clone()
            url.pathname = "/account-error"
            url.searchParams.set("reason", "suspended")
            return NextResponse.redirect(url)
          }

          // Check if account is not approved (pending)
          if (!profile.is_approved) {
            console.log("[v0] User account is pending approval, redirecting to premium-tools")
            const url = request.nextUrl.clone()
            url.pathname = "/premium-tools"
            url.searchParams.set("reason", "pending")
            return NextResponse.redirect(url)
          }

          // Check if account is expired
          if (isExpired) {
            console.log("[v0] User account is expired, redirecting to premium-tools")
            const url = request.nextUrl.clone()
            url.pathname = "/premium-tools"
            url.searchParams.set("reason", "expired")
            return NextResponse.redirect(url)
          }

          // If all checks pass, user has active status and can access protected routes
          console.log("[v0] User account is active, allowing access")
        }
      } catch (error) {
        console.error("[v0] Error checking user status:", error)
        // If there's an error, allow access (fail open)
        return supabaseResponse
      }
    }
  }

  return supabaseResponse
}
