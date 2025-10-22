import { createClient } from "@/lib/supabase/client"

export interface OrderData {
  planId: string
  planName: string
  originalPrice: number
  discountAmount: number
  finalPrice: number
  couponCode?: string
  userName: string
  userEmail: string
  userPhone?: string
  notes?: string
}

export class OrderService {
  static async createOrder(orderData: OrderData): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          success: false,
          error: "আপনাকে লগইন করতে হবে",
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          plan_id: orderData.planId,
          plan_name: orderData.planName,
          original_price: orderData.originalPrice,
          discount_amount: orderData.discountAmount,
          final_price: orderData.finalPrice,
          coupon_code: orderData.couponCode || null,
          user_name: orderData.userName,
          user_email: orderData.userEmail,
          user_phone: orderData.userPhone || null,
          notes: orderData.notes || null,
          payment_status: "pending",
          order_status: "pending",
        })
        .select()
        .single()

      if (orderError) {
        console.error("[v0] Order creation error:", orderError)
        return {
          success: false,
          error: "অর্ডার তৈরি করতে সমস্যা হয়েছে",
        }
      }

      return {
        success: true,
        orderId: order.id,
      }
    } catch (error) {
      console.error("[v0] Order service error:", error)
      return {
        success: false,
        error: "অর্ডার তৈরি করতে সমস্যা হয়েছে",
      }
    }
  }

  static async getUserOrders(userId: string) {
    try {
      const supabase = createClient()

      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Fetch orders error:", error)
        return []
      }

      return orders || []
    } catch (error) {
      console.error("[v0] Get user orders error:", error)
      return []
    }
  }
}
