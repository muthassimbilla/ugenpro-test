import { createClient } from "@/lib/supabase/client"
import { apiCache } from "./api-cache"

export interface AdminUser {
  id: string
  full_name: string
  email: string
  telegram_username?: string
  is_active: boolean
  is_approved: boolean
  approved_at?: string | null
  approved_by?: string | null
  account_status: "active" | "suspended" | "expired"
  expiration_date?: string | null
  current_status: "active" | "suspended" | "expired" | "inactive" | "pending"
  created_at: string
  updated_at: string
  device_count?: number
  user_agent?: string
  last_login?: string
  active_sessions_count: number
  active_devices_count: number // Added device count field
}

export class AdminUserService {
  static async getAllUsers(
    page = 1,
    pageSize = 50,
    searchTerm = "",
    statusFilter: "all" | "active" | "suspended" | "expired" | "pending" = "all",
  ): Promise<{ users: AdminUser[]; total: number; hasMore: boolean }> {
    const cacheKey = `admin:users:page:${page}:${pageSize}:${searchTerm}:${statusFilter}`
    try {
      // Try to get from cache first
      const cachedData = apiCache.get<{ users: AdminUser[]; total: number; hasMore: boolean }>(cacheKey)
      if (cachedData) {
        console.log("[v0] Returning cached users data for page:", page)
        return cachedData
      }

      console.log(
        "[v0] getAllUsers called with pagination - page:",
        page,
        "pageSize:",
        pageSize,
        "search:",
        searchTerm,
        "status:",
        statusFilter,
      )
      const supabase = createClient()

      if (!supabase) {
        throw new Error("Supabase integration required. Please add Supabase integration from project settings.")
      }

      let countQuery = supabase.from("profiles").select("*", { count: "exact", head: true })
      let dataQuery = supabase.from("profiles").select("*")

      // Apply search filter
      if (searchTerm && searchTerm.trim()) {
        const searchPattern = `%${searchTerm.trim()}%`
        countQuery = countQuery.or(
          `full_name.ilike.${searchPattern},email.ilike.${searchPattern},telegram_username.ilike.${searchPattern}`,
        )
        dataQuery = dataQuery.or(
          `full_name.ilike.${searchPattern},email.ilike.${searchPattern},telegram_username.ilike.${searchPattern}`,
        )
      }

      // Apply status filter
      if (statusFilter !== "all") {
        if (statusFilter === "pending") {
          countQuery = countQuery.eq("is_approved", false)
          dataQuery = dataQuery.eq("is_approved", false)
        } else if (statusFilter === "active") {
          countQuery = countQuery.eq("account_status", "active").eq("is_active", true).eq("is_approved", true)
          dataQuery = dataQuery.eq("account_status", "active").eq("is_active", true).eq("is_approved", true)
        } else if (statusFilter === "suspended") {
          countQuery = countQuery.eq("account_status", "suspended")
          dataQuery = dataQuery.eq("account_status", "suspended")
        } else if (statusFilter === "expired") {
          countQuery = countQuery.not("expiration_date", "is", null).lt("expiration_date", new Date().toISOString())
          dataQuery = dataQuery.not("expiration_date", "is", null).lt("expiration_date", new Date().toISOString())
        }
      }

      // Get total count with filters
      const { count, error: countError } = await countQuery

      if (countError) {
        console.error("[v0] Count error:", countError)
        throw new Error(`Failed to count users: ${countError.message}`)
      }

      const totalUsers = count || 0
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // Get paginated profiles with filters
      const { data: profiles, error } = await dataQuery.order("created_at", { ascending: false }).range(from, to)

      if (error) {
        console.error("[v0] Supabase error:", error)
        throw new Error(`Failed to load user data: ${error.message}`)
      }

      console.log("[v0] Profiles fetched:", profiles?.length || 0, "Total:", totalUsers)

      if (!profiles || profiles.length === 0) {
        console.log("[v0] No profiles found in database")
        const emptyResult = { users: [], total: 0, hasMore: false }
        apiCache.set(cacheKey, emptyResult)
        return emptyResult
      }

      // Get all user IDs for batch session query
      const userIds = profiles.map((p) => p.id)

      let sessionCountsMap = new Map<string, number>()
      let deviceCountsMap = new Map<string, number>()
      try {
        const response = await fetch(`/api/admin/user-sessions/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            if (data.sessionCounts) {
              sessionCountsMap = new Map(Object.entries(data.sessionCounts))
            }
            if (data.deviceCounts) {
              deviceCountsMap = new Map(Object.entries(data.deviceCounts))
            }
          }
        }
      } catch (apiError) {
        console.warn("[v0] Batch API error, falling back to 0 counts:", apiError)
      }

      // Get unique IP counts in batch
      const { data: ipHistory, error: ipError } = await supabase
        .from("user_ip_history")
        .select("user_id, ip_address")
        .in("user_id", userIds)
        .eq("is_current", true)

      const ipCountsMap = new Map<string, number>()
      if (!ipError && ipHistory) {
        userIds.forEach((userId) => {
          const userIPs = ipHistory.filter((ip) => ip.user_id === userId)
          const uniqueIPs = new Set(userIPs.map((ip) => ip.ip_address))
          ipCountsMap.set(userId, uniqueIPs.size)
        })
      }

      // Map profiles to AdminUser format
      const usersWithDeviceCount = profiles.map((profile) => {
        const userEmail = profile.email || "No email"
        const telegramUsername = profile.telegram_username
        const activeSessionsCount = sessionCountsMap.get(profile.id) || 0
        const activeDevicesCount = deviceCountsMap.get(profile.id) || 0 // Get device count from batch API
        const uniqueIPCount = ipCountsMap.get(profile.id) || 0

        return {
          id: profile.id,
          full_name: profile.full_name,
          email: userEmail,
          telegram_username: telegramUsername,
          is_active: profile.is_active ?? true,
          is_approved: profile.is_approved ?? false,
          approved_at: profile.approved_at,
          approved_by: profile.approved_by,
          account_status: profile.account_status || "active",
          expiration_date: profile.expiration_date,
          current_status: this.calculateCurrentStatus(profile),
          created_at: profile.created_at,
          updated_at: profile.updated_at || profile.created_at,
          device_count: uniqueIPCount,
          user_agent: "Unknown",
          last_login: null,
          active_sessions_count: activeSessionsCount,
          active_devices_count: activeDevicesCount, // Added device count
        }
      })

      const hasMore = from + profiles.length < totalUsers
      const result = {
        users: usersWithDeviceCount,
        total: totalUsers,
        hasMore,
      }

      console.log("[v0] Returning users:", usersWithDeviceCount.length, "Total:", totalUsers, "Has more:", hasMore)

      // Cache the result for 30 seconds
      apiCache.set(cacheKey, result, 30000)

      return result
    } catch (error: any) {
      console.error("[v0] Error getting users:", error)
      throw error
    }
  }

  static async approveUser(userId: string, adminUserId?: string, expirationDate?: string): Promise<void> {
    const cacheKey = "admin:users:all"
    try {
      const supabase = createClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      const updateData: any = {
        is_approved: true,
        is_active: true,
        account_status: "active",
        approved_at: new Date().toISOString(),
        approved_by: adminUserId || null,
        updated_at: new Date().toISOString(),
      }

      if (expirationDate) {
        updateData.expiration_date = expirationDate
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", userId)

      if (error) {
        console.error("[v0] Approve user error:", error)
        throw new Error("Failed to approve user")
      }

      console.log("[v0] User approved successfully:", userId, "with expiration:", expirationDate)

      apiCache.clear()
    } catch (error: any) {
      console.error("[v0] Error approving user:", error)
      throw error
    }
  }

  static async rejectUser(userId: string, adminUserId?: string): Promise<void> {
    const cacheKey = "admin:users:all"
    try {
      const supabase = createClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          is_approved: false,
          is_active: false,
          account_status: "inactive",
          approved_at: null,
          approved_by: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("[v0] Reject user error:", error)
        throw new Error("Failed to reject user")
      }

      console.log("[v0] User approval revoked successfully:", userId)

      apiCache.clear()
    } catch (error: any) {
      console.error("[v0] Error rejecting user:", error)
      throw error
    }
  }

  static async getPendingUsers(): Promise<AdminUser[]> {
    try {
      const supabase = createClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Get pending users error:", error)
        throw new Error("Failed to load pending users")
      }

      const usersWithEmail = (profiles || []).map((profile) => ({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email || "No email",
        telegram_username: profile.telegram_username,
        is_active: profile.is_active ?? true,
        is_approved: profile.is_approved ?? false,
        approved_at: profile.approved_at,
        approved_by: profile.approved_by,
        account_status: profile.account_status || "active",
        expiration_date: profile.expiration_date,
        current_status: this.calculateCurrentStatus(profile),
        created_at: profile.created_at,
        updated_at: profile.updated_at || profile.created_at,
        active_sessions_count: 0,
      }))

      return usersWithEmail
    } catch (error: any) {
      console.error("[v0] Error getting pending users:", error)
      throw error
    }
  }

  static async updateUser(userId: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    console.log("[v0] Updating user:", userId, userData)

    const supabase = createClient()

    if (!supabase) {
      throw new Error("Supabase integration required")
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: userData.full_name,
          email: userData.email,
          is_active: userData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single()

      if (error) {
        console.error("[v0] Update user error:", error)
        throw new Error("Failed to update user")
      }

      const updatedUser = {
        id: data.id,
        full_name: data.full_name,
        email: data.email || "No email",
        telegram_username: data.telegram_username,
        is_active: data.is_active,
        is_approved: data.is_approved || false,
        approved_at: data.approved_at,
        approved_by: data.approved_by,
        account_status: data.account_status || "active",
        expiration_date: data.expiration_date,
        current_status: this.calculateCurrentStatus(data),
        created_at: data.created_at,
        updated_at: data.updated_at,
        active_sessions_count: 0,
        active_devices_count: 0, // Added device count
      }

      apiCache.clear()

      return updatedUser
    } catch (error: any) {
      console.error("[v0] Update user failed:", error)
      throw error
    }
  }

  static async updateUserExpiration(userId: string, expirationDate: string | null): Promise<void> {
    try {
      const supabase = createClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          expiration_date: expirationDate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("[v0] Update expiration error:", error)
        throw new Error("Failed to update user expiration")
      }

      console.log("[v0] User expiration updated successfully:", userId, expirationDate)

      apiCache.clear()
    } catch (error: any) {
      console.error("[v0] Error updating user expiration:", error)
      throw error
    }
  }

  static async updateUserStatus(userId: string, status: "active" | "suspended"): Promise<void> {
    try {
      const supabase = createClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          account_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("[v0] Update status error:", error)
        throw new Error("Failed to update user status")
      }

      console.log("[v0] User status updated successfully:", userId, status)

      apiCache.clear()
    } catch (error: any) {
      console.error("[v0] Error updating user status:", error)
      throw error
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      console.log("[v0] Starting delete operation for user:", userId)

      const supabase = createClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", userId)
        .single()

      if (checkError) {
        console.error("[v0] Error checking user existence:", checkError)
        throw new Error("User not found")
      }

      console.log("[v0] User found before delete:", existingUser)

      // First delete related sessions
      const { error: sessionError } = await supabase.from("user_sessions").delete().eq("user_id", userId)

      if (sessionError) {
        console.warn("[v0] Warning deleting sessions:", sessionError)
      }

      const { data: deleteData, error } = await supabase.from("profiles").delete().eq("id", userId).select()

      console.log("[v0] Delete operation result:", { deleteData, error })

      if (error) {
        console.error("[v0] Delete user error:", error)
        throw new Error(`Failed to delete user: ${error.message}`)
      }

      if (!deleteData || deleteData.length === 0) {
        console.error("[v0] No rows were deleted")
        throw new Error("No user was deleted. This might be due to RLS policy or permission issues.")
      }

      console.log("[v0] User successfully deleted:", userId, "Deleted rows:", deleteData.length)

      apiCache.clear()
    } catch (error: any) {
      console.error("[v0] Delete user failed:", error)
      throw error
    }
  }

  static async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      console.log("[v0] AdminUserService.toggleUserStatus called with:", { userId, isActive })

      const supabase = createClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          is_active: isActive,
          account_status: isActive ? "active" : "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select("id, is_active, full_name, account_status")

      if (error) {
        console.error("[v0] Toggle user status error:", error)
        throw new Error(`Failed to change user status: ${error.message}`)
      }

      console.log("[v0] Database update result:", data)

      if (!data || data.length === 0) {
        throw new Error("No user was updated. User may not exist.")
      }

      const updatedUser = data[0]
      console.log("[v0] User status successfully toggled:", {
        userId,
        newIsActive: updatedUser.is_active,
        accountStatus: updatedUser.account_status,
        fullName: updatedUser.full_name,
      })

      apiCache.clear()

      if (updatedUser.is_active !== isActive) {
        throw new Error("Database update failed - status not changed")
      }
    } catch (error: any) {
      console.error("[v0] Toggle user status failed:", error)
      throw error
    }
  }

  static async createUser(userData: {
    full_name: string
    email: string
    telegram_username?: string
    is_active?: boolean
    is_approved?: boolean
    account_status?: "active" | "suspended"
    expiration_date?: string | null
  }): Promise<AdminUser> {
    try {
      console.log("[v0] Creating new user:", userData)

      const supabase = createClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: Math.random().toString(36).slice(-12),
        options: {
          data: {
            full_name: userData.full_name,
            telegram_username: userData.telegram_username,
          },
        },
      })

      if (authError || !authData.user) {
        console.error("[v0] Auth signup error:", authError)
        throw new Error(`Failed to create auth user: ${authError?.message}`)
      }

      // Update the auto-created profile with additional data
      const { data, error } = await supabase
        .from("profiles")
        .update({
          email: userData.email,
          is_active: userData.is_active ?? true,
          is_approved: userData.is_approved ?? true,
          account_status: userData.account_status ?? "active",
          expiration_date: userData.expiration_date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authData.user.id)
        .select()
        .single()

      if (error) {
        console.error("[v0] Create user error:", error)
        throw new Error(`Failed to create new user: ${error.message}`)
      }

      console.log("[v0] User created successfully:", data)

      const newUser = {
        id: data.id,
        full_name: data.full_name,
        email: userData.email,
        telegram_username: userData.telegram_username,
        is_active: data.is_active,
        is_approved: data.is_approved || false,
        approved_at: data.approved_at,
        approved_by: data.approved_by,
        account_status: data.account_status || "active",
        expiration_date: data.expiration_date,
        current_status: this.calculateCurrentStatus(data),
        created_at: data.created_at,
        updated_at: data.updated_at,
        active_sessions_count: 0,
        active_devices_count: 0, // Added device count
      }

      apiCache.clear()

      return newUser
    } catch (error: any) {
      console.error("[v0] Create user failed:", error)
      throw error
    }
  }

  static async handleSecurityUpdate(
    userId: string,
    data: {
      status?: "active" | "suspended"
      expirationDate?: string | null
      activateAccount?: boolean
    },
  ): Promise<void> {
    try {
      console.log("[v0] AdminUserService.handleSecurityUpdate called with:", { userId, data })

      const supabase = createClient()

      if (!supabase) {
        throw new Error("Supabase integration required")
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (data.status) {
        updateData.account_status = data.status
        console.log("[v0] Setting account_status to:", data.status)
      }

      if (data.expirationDate !== undefined) {
        updateData.expiration_date = data.expirationDate
        console.log("[v0] Setting expiration_date to:", data.expirationDate)
      }

      if (data.status === "active" || data.activateAccount) {
        updateData.is_active = true
        console.log("[v0] Setting is_active to true")
      }

      if (data.status === "suspended") {
        updateData.is_active = false
        console.log("[v0] Setting is_active to false due to suspension")
      }

      const { data: result, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId)
        .select("id, is_active, account_status, expiration_date, full_name")

      if (error) {
        console.error("[v0] Security update error:", error)
        throw new Error(`Failed to update security settings: ${error.message}`)
      }

      console.log("[v0] Security update successful:", result)

      if (!result || result.length === 0) {
        throw new Error("No user was updated. User may not exist.")
      }

      const updatedUser = result[0]
      console.log("[v0] User security settings successfully updated:", {
        userId,
        newAccountStatus: updatedUser.account_status,
        newIsActive: updatedUser.is_active,
        newExpirationDate: updatedUser.expiration_date,
        fullName: updatedUser.full_name,
      })

      apiCache.clear()
    } catch (error: any) {
      console.error("[v0] Security update failed:", error)
      throw error
    }
  }

  private static calculateCurrentStatus(user: any): "active" | "suspended" | "expired" | "inactive" | "pending" {
    if (!user.is_approved) return "pending"
    if (user.account_status === "suspended") return "suspended"
    if (user.expiration_date && new Date(user.expiration_date) < new Date()) return "expired"
    if (!user.is_active) return "inactive"
    if (user.account_status === "active") return "active"
    return "inactive"
  }
}
