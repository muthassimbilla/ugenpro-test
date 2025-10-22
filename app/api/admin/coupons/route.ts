import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer admin-session-")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching coupons:", error)
      return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
    }

    return NextResponse.json({ coupons: coupons || [] })
  } catch (error) {
    console.error("[v0] Admin coupons API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer admin-session-")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const body = await request.json()
    const { code, discount_type, discount_value, max_uses, valid_from, valid_until, is_active, applicable_plans } = body

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Check if coupon code already exists
    const { data: existing } = await supabase.from("coupons").select("id").eq("code", code.toUpperCase()).single()

    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
    }

    const { data: coupon, error } = await supabase
      .from("coupons")
      .insert({
        code: code.toUpperCase(),
        discount_type,
        discount_value,
        max_uses: max_uses || null,
        valid_from: valid_from || new Date().toISOString(),
        valid_until: valid_until || null,
        is_active: is_active !== undefined ? is_active : true,
        applicable_plans: applicable_plans || null,
        current_uses: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating coupon:", error)
      return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
    }

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error("[v0] Admin create coupon API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
