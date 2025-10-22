import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer admin-session-")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const body = await request.json()
    const couponId = params.id

    if (!couponId) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const updateData: any = {}
    if (body.code !== undefined) updateData.code = body.code.toUpperCase()
    if (body.discount_type !== undefined) updateData.discount_type = body.discount_type
    if (body.discount_value !== undefined) updateData.discount_value = body.discount_value
    if (body.max_uses !== undefined) updateData.max_uses = body.max_uses
    if (body.valid_from !== undefined) updateData.valid_from = body.valid_from
    if (body.valid_until !== undefined) updateData.valid_until = body.valid_until
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.applicable_plans !== undefined) updateData.applicable_plans = body.applicable_plans

    const { data: coupon, error } = await supabase
      .from("coupons")
      .update(updateData)
      .eq("id", couponId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating coupon:", error)
      return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
    }

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error("[v0] Admin update coupon API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer admin-session-")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const couponId = params.id

    if (!couponId) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const { error } = await supabase.from("coupons").delete().eq("id", couponId)

    if (error) {
      console.error("[v0] Error deleting coupon:", error)
      return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Admin delete coupon API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
