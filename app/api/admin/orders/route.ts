import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer admin-session-")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
    const search = searchParams.get("search") || ""

    const supabase = createServiceRoleClient()

    // Build query
    let query = supabase.from("orders").select("*", { count: "exact" })

    if (search) {
      query = query.or(
        `user_name.ilike.%${search}%,user_email.ilike.%${search}%,payment_transaction_id.ilike.%${search}%`,
      )
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: orders, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

    if (error) {
      console.error("[v0] Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
      page,
      pageSize,
      hasMore: count ? from + pageSize < count : false,
    })
  } catch (error) {
    console.error("[v0] Admin orders API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer admin-session-")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, orderStatus, paymentStatus } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const updateData: any = {}
    if (orderStatus) updateData.order_status = orderStatus
    if (paymentStatus) updateData.payment_status = paymentStatus

    const { data, error } = await supabase.from("orders").update(updateData).eq("id", orderId).select().single()

    if (error) {
      console.error("[v0] Error updating order:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error("[v0] Admin order update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
