import { createClient } from "@supabase/supabase-js"

// API types যেগুলো rate limit করা হবে
export type ApiType = "address_generator" | "email2name"

// Rate limit result interface
export interface RateLimitResult {
  success: boolean
  unlimited: boolean
  daily_count: number
  daily_limit: number
  remaining: number | "unlimited"
  error?: string
}

// User API usage interface
export interface ApiUsage {
  id: string
  user_id: string
  api_type: ApiType
  usage_date: string
  daily_count: number
  daily_limit: number
  is_unlimited: boolean
  last_used_at: string
  created_at: string
  updated_at: string
}

// User limits interface
export interface ApiUserLimit {
  id: string
  user_id: string
  api_type: ApiType
  daily_limit: number
  is_unlimited: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

// Global limits interface
export interface GlobalApiLimit {
  id: number
  api_type: ApiType
  daily_limit: number
  is_unlimited: boolean
  created_at: string
  updated_at: string
}

export class ApiRateLimiter {
  private supabase: any

  constructor() {
    // Use service role key for admin operations to bypass RLS
    this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    console.log("ApiRateLimiter initialized with service role")
  }

  /**
   * Check করে যে user API call করতে পারবে কিনা এবং count increment করে
   */
  async checkAndIncrementUsage(userId: string, apiType: ApiType): Promise<RateLimitResult> {
    try {
      if (!userId) {
        return {
          success: false,
          unlimited: false,
          daily_count: 0,
          daily_limit: 0,
          remaining: 0,
          error: "User not authenticated",
        }
      }

      // Database function call করে usage increment করি
      const { data, error } = await this.supabase.rpc("increment_api_usage", {
        p_user_id: userId,
        p_api_type: apiType,
        p_usage_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
      })

      if (error) {
        console.error("Rate limiter error:", error)
        return {
          success: false,
          unlimited: false,
          daily_count: 0,
          daily_limit: 200,
          remaining: 0,
          error: "Database error",
        }
      }

      return data as RateLimitResult
    } catch (error) {
      console.error("Rate limiter exception:", error)
      return {
        success: false,
        unlimited: false,
        daily_count: 0,
        daily_limit: 200,
        remaining: 0,
        error: "Service error",
      }
    }
  }

  /**
   * User এর current usage status check করে (increment না করে)
   */
  async getUserUsageStatus(userId: string, apiType: ApiType): Promise<ApiUsage | null> {
    try {
      if (!userId) return null

      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await this.supabase
        .from("api_usage")
        .select("*")
        .eq("user_id", userId)
        .eq("api_type", apiType)
        .eq("usage_date", today)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching usage status:", error)
        return null
      }

      return data as ApiUsage | null
    } catch (error) {
      console.error("Exception fetching usage status:", error)
      return null
    }
  }

  /**
   * User এর সব API এর usage status একসাথে get করে
   */
  async getAllUserUsage(userId: string): Promise<Record<ApiType, ApiUsage | null>> {
    try {
      if (!userId) {
        return {
          address_generator: null,
          email2name: null,
        }
      }

      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await this.supabase
        .from("api_usage")
        .select("*")
        .eq("user_id", userId)
        .eq("usage_date", today)

      if (error) {
        console.error("Error fetching all usage:", error)
        return {
          address_generator: null,
          email2name: null,
        }
      }

      const usageMap: Record<ApiType, ApiUsage | null> = {
        address_generator: null,
        email2name: null,
      }

      if (data) {
        data.forEach((usage: ApiUsage) => {
          usageMap[usage.api_type] = usage
        })
      }

      return usageMap
    } catch (error) {
      console.error("Exception fetching all usage:", error)
      return {
        address_generator: null,
        email2name: null,
      }
    }
  }

  /**
   * Admin function: Set user specific limits
   */
  async setUserLimit(
    userId: string,
    apiType: ApiType,
    dailyLimit: number,
    isUnlimited = false,
    adminUserId?: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("api_user_limits").upsert(
        {
          user_id: userId,
          api_type: apiType,
          daily_limit: dailyLimit,
          is_unlimited: isUnlimited,
          created_by: adminUserId || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id, api_type",
        },
      )

      if (error) {
        console.error("Error setting user limit:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Exception setting user limit:", error)
      return false
    }
  }

  /**
   * Admin function: Get user limits
   */
  async getUserLimits(userId: string): Promise<ApiUserLimit[]> {
    try {
      const { data, error } = await this.supabase.from("api_user_limits").select("*").eq("user_id", userId)

      if (error) {
        console.error("Error fetching user limits:", error)
        return []
      }

      return (data as ApiUserLimit[]) || []
    } catch (error) {
      console.error("Exception fetching user limits:", error)
      return []
    }
  }

  /**
   * Admin function: Get all users usage for a specific date
   */
  async getAllUsageByDate(date: string = new Date().toISOString().split("T")[0]): Promise<ApiUsage[]> {
    try {
      console.log("Getting all usage for date:", date)

      // First try without profiles join
      const { data, error } = await this.supabase
        .from("api_usage")
        .select("*")
        .eq("usage_date", date)
        .order("daily_count", { ascending: false })

      if (error) {
        console.error("Error fetching all usage by date:", error)
        return []
      }

      console.log("Raw usage data:", data)
      return (data as ApiUsage[]) || []
    } catch (error) {
      console.error("Exception fetching all usage by date:", error)
      return []
    }
  }

  /**
   * Admin function: Reset user's daily usage
   */
  async resetUserDailyUsage(
    userId: string,
    apiType: ApiType,
    date: string = new Date().toISOString().split("T")[0],
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("api_usage")
        .update({
          daily_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("api_type", apiType)
        .eq("usage_date", date)

      if (error) {
        console.error("Error resetting daily usage:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Exception resetting daily usage:", error)
      return false
    }
  }

  /**
   * Get user usage statistics (last 30 days)
   */
  async getUserUsageStats(userId: string, apiType: ApiType, days = 30): Promise<ApiUsage[]> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - days)

      const { data, error } = await this.supabase
        .from("api_usage")
        .select("*")
        .eq("user_id", userId)
        .eq("api_type", apiType)
        .gte("usage_date", startDate.toISOString().split("T")[0])
        .lte("usage_date", endDate.toISOString().split("T")[0])
        .order("usage_date", { ascending: false })

      if (error) {
        console.error("Error fetching usage stats:", error)
        return []
      }

      return (data as ApiUsage[]) || []
    } catch (error) {
      console.error("Exception fetching usage stats:", error)
      return []
    }
  }

  /**
   * Log API request details (optional detailed logging)
   */
  async logApiRequest(
    userId: string | null,
    apiType: ApiType,
    requestData: any,
    responseData: any,
    success: boolean,
    errorMessage?: string,
    ipAddress?: string,
    userAgent?: string,
    responseTimeMs?: number,
  ): Promise<void> {
    try {
      await this.supabase.from("api_request_logs").insert({
        user_id: userId,
        api_type: apiType,
        request_data: requestData,
        response_data: responseData,
        success: success,
        error_message: errorMessage || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        response_time_ms: responseTimeMs || null,
      })
    } catch (error) {
      // Silent fail for logging
      console.error("Error logging API request:", error)
    }
  }

  /**
   * Helper function: Get or create today's usage record without incrementing
   */
  async getOrCreateTodayUsage(userId: string, apiType: ApiType): Promise<RateLimitResult> {
    try {
      const { data, error } = await this.supabase.rpc("get_or_create_daily_usage", {
        p_user_id: userId,
        p_api_type: apiType,
        p_usage_date: new Date().toISOString().split("T")[0],
      })

      if (error) {
        console.error("Error getting today usage:", error)
        return {
          success: true,
          unlimited: false,
          daily_count: 0,
          daily_limit: 200,
          remaining: 200,
        }
      }

      const usage = data as ApiUsage
      return {
        success: true,
        unlimited: usage.is_unlimited,
        daily_count: usage.daily_count,
        daily_limit: usage.daily_limit,
        remaining: usage.is_unlimited ? "unlimited" : usage.daily_limit - usage.daily_count,
      }
    } catch (error) {
      console.error("Exception getting today usage:", error)
      return {
        success: true,
        unlimited: false,
        daily_count: 0,
        daily_limit: 200,
        remaining: 200,
      }
    }
  }

  /**
   * Admin function: Get global limits for all APIs
   */
  async getGlobalLimits(): Promise<GlobalApiLimit[]> {
    try {
      const { data, error } = await this.supabase.from("global_api_limits").select("*").order("api_type")

      if (error) {
        console.error("Error fetching global limits:", error)
        return []
      }

      return (data as GlobalApiLimit[]) || []
    } catch (error) {
      console.error("Exception fetching global limits:", error)
      return []
    }
  }

  /**
   * Admin function: Set global limit for an API type
   */
  async setGlobalLimit(apiType: ApiType, dailyLimit: number, isUnlimited = false): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("global_api_limits").upsert(
        {
          api_type: apiType,
          daily_limit: dailyLimit,
          is_unlimited: isUnlimited,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "api_type",
        },
      )

      if (error) {
        console.error("Error setting global limit:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Exception setting global limit:", error)
      return false
    }
  }

  /**
   * Get global limit for a specific API type
   */
  async getGlobalLimit(apiType: ApiType): Promise<GlobalApiLimit | null> {
    try {
      const { data, error } = await this.supabase.from("global_api_limits").select("*").eq("api_type", apiType).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching global limit:", error)
        return null
      }

      return data as GlobalApiLimit | null
    } catch (error) {
      console.error("Exception fetching global limit:", error)
      return null
    }
  }

  /**
   * Update existing usage records to use current global limits
   */
  async updateExistingUsageRecords(): Promise<boolean> {
    try {
      // Get current global limits
      const globalLimits = await this.getGlobalLimits()

      for (const globalLimit of globalLimits) {
        // Update existing usage records for today
        const { error } = await this.supabase
          .from("api_usage")
          .update({
            daily_limit: globalLimit.daily_limit,
            is_unlimited: globalLimit.is_unlimited,
            updated_at: new Date().toISOString(),
          })
          .eq("api_type", globalLimit.api_type)
          .eq("usage_date", new Date().toISOString().split("T")[0])

        if (error) {
          console.error(`Error updating usage records for ${globalLimit.api_type}:`, error)
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Exception updating existing usage records:", error)
      return false
    }
  }
}
