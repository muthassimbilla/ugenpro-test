import { createClient } from "@/lib/supabase/client"

// User status interface
export interface UserStatus {
  is_valid: boolean
  status: "active" | "suspended" | "expired" | "inactive" | "pending" | "deactivated"
  message: string
  expiration_date?: string
}

const getSupabaseClient = () => {
  return createClient()
}

// User status service class
export class UserStatusService {
  // Check user's current status
  static async checkUserStatus(userId: string, retryCount = 0): Promise<UserStatus> {
    try {
      if (typeof window === "undefined") {
        console.log("[v0] Server-side execution, returning active status")
        return {
          is_valid: true,
          status: "active",
          message: "Your account is active.",
        }
      }

      const supabase = getSupabaseClient()

      if (!supabase) {
        console.log("[v0] No Supabase client, returning active status")
        return {
          is_valid: true,
          status: "active",
          message: "Your account is active.",
        }
      }

      console.log("[v0] Checking user status for:", userId)

      const { data: user, error } = await supabase
        .from("profiles")
        .select("id, is_active, account_status, expiration_date")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("[v0] User status check error:", error)
        return {
          is_valid: true,
          status: "active",
          message: "Your account is active.",
        }
      }

      if (!user) {
        return {
          is_valid: true,
          status: "active",
          message: "Your account is active.",
        }
      }

      // Check if user is suspended
      if (user.account_status === "suspended") {
        console.log("[v0] User is suspended:", userId)
        return {
          is_valid: false,
          status: "suspended",
          message: "Your account has been suspended. Please contact support.",
        }
      }

      // Check if user is inactive (check account_status instead of is_active)
      if (user.account_status === "inactive") {
        console.log("[v0] User is deactivated:", userId)
        return {
          is_valid: false,
          status: "deactivated",
          message: "Your account has been deactivated. Please contact support.",
        }
      }

      // Check if user account is expired
      if (user.expiration_date && new Date(user.expiration_date) < new Date()) {
        console.log("[v0] User account expired:", userId)
        return {
          is_valid: false,
          status: "expired",
          message: "Your account has expired.",
          expiration_date: user.expiration_date,
        }
      }

      // User is active
      console.log("[v0] User status is active:", userId)
      return {
        is_valid: true,
        status: "active",
        message: "Your account is active.",
      }
    } catch (error: any) {
      console.error("[v0] User status check failed:", error)

      // Only return active status for network-related errors
      if (
        error.message?.includes("fetch") ||
        error.message?.includes("network") ||
        error.message?.includes("timeout")
      ) {
        console.warn("[v0] Network error during status check, assuming active status")
        return {
          is_valid: true,
          status: "active",
          message: "Your account is active.",
        }
      }

      // For other errors, return inactive to be safe
      return {
        is_valid: false,
        status: "inactive",
        message: "Unable to verify account status.",
      }
    }
  }

  // Real-time status monitoring
  static async startStatusMonitoring(
    userId: string,
    onStatusChange: (status: UserStatus) => void,
    intervalMs = 120000, // Check every 2 minutes for better responsiveness
  ): Promise<() => void> {
    let isActive = true
    let consecutiveFailures = 0
    const maxConsecutiveFailures = 10 // Increased to 10 to be very tolerant

    console.log("[v0] Starting status monitoring for user:", userId)

    onStatusChange({
      is_valid: true,
      status: "active",
      message: "Your account is active.",
    })

    const checkStatus = async () => {
      if (!isActive) return

      try {
        console.log("[v0] Performing status check...")
        const status = await this.checkUserStatus(userId)
        console.log("[v0] Status check result:", status)
        onStatusChange(status)

        consecutiveFailures = 0

        if (
          !status.is_valid &&
          (status.status === "suspended" || status.status === "deactivated") &&
          !status.message.includes("network") &&
          !status.message.includes("active")
        ) {
          console.log("[v0] User status invalid, triggering logout")
          window.dispatchEvent(
            new CustomEvent("user-status-invalid", {
              detail: status,
            }),
          )
        }
      } catch (error) {
        console.error("[v0] Status monitoring error:", error)

        consecutiveFailures++

        if (
          consecutiveFailures >= maxConsecutiveFailures &&
          !error.message?.includes("Failed to fetch") &&
          !error.message?.includes("timeout") &&
          !error.message?.includes("Network")
        ) {
          console.warn(`[v0] ${consecutiveFailures} consecutive status check failures, triggering logout`)
          window.dispatchEvent(
            new CustomEvent("user-status-invalid", {
              detail: {
                is_valid: false,
                status: "inactive",
                message: "Multiple status checks failed.",
              },
            }),
          )
        }
      }
    }

    const intervalId = setInterval(checkStatus, intervalMs)

    // Return cleanup function
    return () => {
      console.log("[v0] Cleaning up status monitoring")
      isActive = false
      clearInterval(intervalId)
    }
  }

  // Update user expiration date (admin function)
  static async updateUserExpiration(
    userId: string,
    expirationDate: string | null,
    adminSessionToken: string,
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      const { error } = await supabase
        .from("users")
        .update({
          expiration_date: expirationDate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("[v0] Update expiration error:", error)
        throw new Error("Failed to update expiration")
      }
    } catch (error: any) {
      console.error("[v0] Update user expiration failed:", error)
      throw error
    }
  }

  // Update user status (admin function)
  static async updateUserStatus(
    userId: string,
    status: "active" | "suspended",
    adminSessionToken: string,
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      const { error } = await supabase
        .from("users")
        .update({
          account_status: status,
          is_active: status === "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("[v0] Update status error:", error)
        throw new Error("Failed to update status")
      }
    } catch (error: any) {
      console.error("[v0] Update user status failed:", error)
      throw error
    }
  }

  // Get all users with status (admin function)
  static async getAllUsersWithStatus(adminSessionToken: string) {
    try {
      const supabase = getSupabaseClient()

      if (!supabase) {
        // Demo data
        return [
          {
            id: "demo-1",
            full_name: "Ahmed Rahman",
            telegram_username: "ahmed_rahman",
            account_status: "active",
            expiration_date: null,
            current_status: "active",
            created_at: new Date().toISOString(),
          },
          {
            id: "demo-2",
            full_name: "Fatima Khatun",
            telegram_username: "fatima_khatun",
            account_status: "suspended",
            expiration_date: null,
            current_status: "suspended",
            created_at: new Date().toISOString(),
          },
        ]
      }

      const { data, error } = await supabase
        .from("user_status_view")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Get users error:", error)
        throw new Error("Failed to load user list")
      }

      return data || []
    } catch (error: any) {
      console.error("[v0] Get all users failed:", error)
      throw error
    }
  }

  // Delete user (admin function)
  static async deleteUser(userId: string, adminSessionToken: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      // First delete related sessions
      await supabase.from("sessions").delete().eq("user_id", userId)

      // Then delete the user
      const { error } = await supabase.from("users").delete().eq("id", userId)

      if (error) {
        console.error("[v0] Delete user error:", error)
        throw new Error("Failed to delete user")
      }

      console.log("[v0] User and related data successfully deleted:", userId)
    } catch (error: any) {
      console.error("[v0] Delete user failed:", error)
      throw error
    }
  }

  // Toggle user active status (admin function)
  static async toggleUserActiveStatus(userId: string, isActive: boolean, adminSessionToken: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      const { error } = await supabase
        .from("users")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("[v0] Toggle active status error:", error)
        throw new Error("Failed to toggle user active status")
      }

      console.log("[v0] User active status successfully updated:", userId, isActive)
    } catch (error: any) {
      console.error("[v0] Toggle user active status failed:", error)
      throw error
    }
  }
}
