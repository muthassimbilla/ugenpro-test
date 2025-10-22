import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer admin-session-")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Get all coupons with usage stats
    const { data: coupons, error: couponsError } = await supabase.from("coupons").select("*")

    if (couponsError) {
      console.error("[v0] Error fetching coupons:", couponsError)
      return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
    }

    // Get all orders with coupon usage
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .not("coupon_code", "is", null)

    if (ordersError) {
      console.error("[v0] Error fetching orders:", ordersError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    // Calculate analytics
    const totalCoupons = coupons?.length || 0
    const activeCoupons = coupons?.filter((c) => c.is_active).length || 0
    const totalRedemptions = coupons?.reduce((sum, c) => sum + (c.current_uses || 0), 0) || 0
    const totalDiscountGiven = orders?.reduce((sum, o) => sum + (o.discount_amount || 0), 0) || 0

    // Coupon usage breakdown
    const couponUsageMap = new Map()
    orders?.forEach((order) => {
      if (order.coupon_code) {
        const existing = couponUsageMap.get(order.coupon_code) || {
          code: order.coupon_code,
          uses: 0,
          totalDiscount: 0,
          revenue: 0,
        }
        existing.uses += 1
        existing.totalDiscount += order.discount_amount || 0
        existing.revenue += order.final_price || 0
        couponUsageMap.set(order.coupon_code, existing)
      }
    })

    const topCoupons = Array.from(couponUsageMap.values())
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 10)

    // Monthly usage trend (last 6 months)
    const monthlyUsage = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString()

      const monthOrders = orders?.filter((o) => {
        const orderDate = new Date(o.created_at)
        return orderDate >= new Date(monthStart) && orderDate <= new Date(monthEnd)
      })

      monthlyUsage.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        uses: monthOrders?.length || 0,
        discount: monthOrders?.reduce((sum, o) => sum + (o.discount_amount || 0), 0) || 0,
      })
    }

    // Discount type breakdown
    const percentageCoupons = coupons?.filter((c) => c.discount_type === "percentage").length || 0
    const fixedCoupons = coupons?.filter((c) => c.discount_type === "fixed").length || 0

    return NextResponse.json({
      summary: {
        totalCoupons,
        activeCoupons,
        totalRedemptions,
        totalDiscountGiven,
      },
      topCoupons,
      monthlyUsage,
      discountTypeBreakdown: {
        percentage: percentageCoupons,
        fixed: fixedCoupons,
      },
    })
  } catch (error) {
    console.error("[v0] Coupon analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
