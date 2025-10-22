import { createClient } from "@/lib/supabase/client"

export interface Coupon {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  max_uses: number | null
  current_uses: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  applicable_plans: string[] | null
}

export interface CouponValidationResult {
  isValid: boolean
  message: string
  discount?: number
  coupon?: Coupon
}

export class CouponService {
  static async validateCoupon(code: string, planId: string, originalPrice: number): Promise<CouponValidationResult> {
    try {
      const supabase = createClient()

      if (!code || code.trim() === "") {
        return {
          isValid: false,
          message: "কুপন কোড প্রদান করুন",
        }
      }

      // Fetch coupon from database
      const { data: coupon, error } = await supabase.from("coupons").select("*").eq("code", code.toUpperCase()).single()

      if (error || !coupon) {
        return {
          isValid: false,
          message: "অবৈধ কুপন কোড",
        }
      }

      // Check if coupon is active
      if (!coupon.is_active) {
        return {
          isValid: false,
          message: "এই কুপন কোডটি বর্তমানে সক্রিয় নেই",
        }
      }

      // Check if coupon has expired
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return {
          isValid: false,
          message: "এই কুপন কোডের মেয়াদ শেষ হয়ে গেছে",
        }
      }

      // Check if coupon is valid yet
      if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) {
        return {
          isValid: false,
          message: "এই কুপন কোডটি এখনও বৈধ নয়",
        }
      }

      // Check if coupon has reached max uses
      if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
        return {
          isValid: false,
          message: "এই কুপন কোডের ব্যবহার সীমা শেষ হয়ে গেছে",
        }
      }

      // Check if coupon is applicable to this plan
      if (coupon.applicable_plans && coupon.applicable_plans.length > 0) {
        if (!coupon.applicable_plans.includes(planId)) {
          return {
            isValid: false,
            message: "এই কুপন কোডটি এই প্যাকেজের জন্য প্রযোজ্য নয়",
          }
        }
      }

      // Calculate discount
      let discount = 0
      if (coupon.discount_type === "percentage") {
        discount = (originalPrice * coupon.discount_value) / 100
      } else if (coupon.discount_type === "fixed") {
        discount = coupon.discount_value
      }

      // Ensure discount doesn't exceed original price
      discount = Math.min(discount, originalPrice)

      return {
        isValid: true,
        message: `${coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `৳${coupon.discount_value}`} ছাড় প্রয়োগ করা হয়েছে!`,
        discount,
        coupon,
      }
    } catch (error) {
      console.error("[v0] Coupon validation error:", error)
      return {
        isValid: false,
        message: "কুপন যাচাই করতে সমস্যা হয়েছে",
      }
    }
  }
}
