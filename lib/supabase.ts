import { createClient } from "@supabase/supabase-js"

let supabaseInstance: any = null

const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  // Only create client if both URL and key are available
  if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }

  return supabaseInstance
}

export const supabase = getSupabaseClient()

export const isSupabaseAvailable = () => {
  const client = getSupabaseClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  return client !== null && supabaseUrl && supabaseAnonKey
}

// Database entity classes
export class BaseEntity {
  static tableName = ""

  static async list(orderBy = "id", limit = 100) {
    const client = getSupabaseClient()
    if (!client || !isSupabaseAvailable()) {
      console.warn(`Supabase not available for ${this.tableName}`)
      return []
    }

    console.log(`Fetching data from ${this.tableName} with limit ${limit}...`)

    const { data, error } = await client
      .from(this.tableName)
      .select("*")
      .order(orderBy.startsWith("-") ? orderBy.slice(1) : orderBy, {
        ascending: !orderBy.startsWith("-"),
      })
      .limit(limit) // Added limit to prevent fetching all records

    console.log(`${this.tableName} data:`, data)
    console.log(`${this.tableName} error:`, error)

    if (error) {
      console.error(`Error fetching ${this.tableName}:`, error)
      throw error
    }
    return data || []
  }

  static async create(data: any) {
    const client = getSupabaseClient()
    if (!client || !isSupabaseAvailable()) {
      throw new Error("Supabase not available")
    }

    console.log(`Creating ${this.tableName}:`, data)

    const { data: result, error } = await client.from(this.tableName).insert(data).select().single()

    console.log(`${this.tableName} create result:`, result)
    console.log(`${this.tableName} create error:`, error)

    if (error) {
      console.error(`Error creating ${this.tableName}:`, error)
      throw error
    }
    return result
  }

  static async update(id: string, data: any) {
    const client = getSupabaseClient()
    if (!client || !isSupabaseAvailable()) {
      throw new Error("Supabase not available")
    }

    console.log(`Updating ${this.tableName} ${id}:`, data)

    const { data: result, error } = await client.from(this.tableName).update(data).eq("id", id).select().single()

    console.log(`${this.tableName} update result:`, result)
    console.log(`${this.tableName} update error:`, error)

    if (error) {
      console.error(`Error updating ${this.tableName}:`, error)
      throw error
    }
    return result
  }

  static async delete(id: string) {
    const client = getSupabaseClient()
    if (!client || !isSupabaseAvailable()) {
      throw new Error("Supabase not available")
    }

    console.log(`Deleting ${this.tableName} ${id}`)

    const { error } = await client.from(this.tableName).delete().eq("id", id)

    console.log(`${this.tableName} delete error:`, error)

    if (error) {
      console.error(`Error deleting ${this.tableName}:`, error)
      throw error
    }
    return true
  }

  static async filter(filters: any, orderBy = "id", limit = 100) {
    const client = getSupabaseClient()
    if (!client || !isSupabaseAvailable()) {
      console.warn(`Supabase not available for ${this.tableName}`)
      return []
    }

    console.log(`Filtering ${this.tableName}:`, filters)

    let query = client.from(this.tableName).select("*")

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data, error } = await query
      .order(orderBy.startsWith("-") ? orderBy.slice(1) : orderBy, {
        ascending: !orderBy.startsWith("-"),
      })
      .limit(limit) // Added limit to filter method

    console.log(`${this.tableName} filter result:`, data)
    console.log(`${this.tableName} filter error:`, error)

    if (error) {
      console.error(`Error filtering ${this.tableName}:`, error)
      throw error
    }
    return data || []
  }
}

export class DeviceModel extends BaseEntity {
  static tableName = "device_models"

  static async list(orderBy = "-created_date") {
    return super.list(orderBy)
  }

  static async filter(filters: any, orderBy = "-created_date") {
    return super.filter(filters, orderBy)
  }
}

export class IOSVersion extends BaseEntity {
  static tableName = "ios_versions"
}

export class AppVersion extends BaseEntity {
  static tableName = "app_versions"
}

export class Configuration extends BaseEntity {
  static tableName = "configurations"
}

export class GenerationHistory extends BaseEntity {
  static tableName = "generation_history"

  static async list(orderBy = "-generated_at", limit = 20) {
    return super.list(orderBy, limit)
  }
}

export class BlacklistedUserAgent extends BaseEntity {
  static tableName = "blacklisted_user_agents"

  static async createOrUpdate(data: any) {
    const client = getSupabaseClient()
    if (!client || !isSupabaseAvailable()) {
      throw new Error("Supabase not available")
    }

    console.log(`Creating or updating ${this.tableName}:`, data)

    // Use upsert to handle duplicates - update on conflict with hash
    const { data: result, error } = await client
      .from(this.tableName)
      .upsert(data, {
        onConflict: "hash",
        ignoreDuplicates: false,
      })
      .select()
      .single()

    console.log(`${this.tableName} upsert result:`, result)
    console.log(`${this.tableName} upsert error:`, error)

    if (error) {
      console.error(`Error upserting ${this.tableName}:`, error)
      throw error
    }
    return result
  }

  static async bulkCreateOrUpdate(dataArray: any[]) {
    const client = getSupabaseClient()
    if (!client || !isSupabaseAvailable()) {
      throw new Error("Supabase not available")
    }

    if (!dataArray.length) return []

    console.log(`Bulk creating/updating ${dataArray.length} ${this.tableName} records`)

    // Use bulk upsert without .single() for better performance
    const { data: result, error } = await client
      .from(this.tableName)
      .upsert(dataArray, {
        onConflict: "hash",
        ignoreDuplicates: false,
      })
      .select()

    console.log(`${this.tableName} bulk upsert result count:`, result?.length || 0)
    console.log(`${this.tableName} bulk upsert error:`, error)

    if (error) {
      console.error(`Error bulk upserting ${this.tableName}:`, error)
      throw error
    }
    return result || []
  }
}

export class AndroidDeviceModel extends BaseEntity {
  static tableName = "android_device_models"
}

export class AndroidBuildNumber extends BaseEntity {
  static tableName = "android_build_numbers"
}

export class AndroidAppVersion extends BaseEntity {
  static tableName = "android_app_versions"
}

export class User extends BaseEntity {
  static tableName = "users"

  static async me() {
    // Check if we're on the client side
    if (typeof window === "undefined") {
      throw new Error("Not authenticated")
    }

    // Check localStorage
    const storedUser = localStorage.getItem("current_user")
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch (e) {
        localStorage.removeItem("current_user")
      }
    }
    throw new Error("Not authenticated")
  }

  static async loginWithEmail(email: string) {
    const client = getSupabaseClient()
    if (!client || !isSupabaseAvailable()) {
      throw new Error("Supabase not available")
    }

    try {
      console.log("Attempting admin login with email:", email)

      // First check if user exists
      const { data: existingUser, error: selectError } = await client
        .from("users")
        .select("*")
        .eq("email", email)
        .single()

      console.log("Existing user:", existingUser)
      console.log("Select error:", selectError)

      if (existingUser) {
        // User exists, store in localStorage (only on client side)
        if (typeof window !== "undefined") {
          localStorage.setItem("current_user", JSON.stringify(existingUser))
        }
        return existingUser
      }

      // User doesn't exist, create new admin user
      if (selectError && selectError.code === "PGRST116") {
        const newUserData = {
          email: email,
          is_approved: true, // All users are admin and approved
        }

        console.log("Creating new admin user:", newUserData)

        const { data: newUser, error: insertError } = await client.from("users").insert(newUserData).select().single()

        console.log("New admin user created:", newUser)
        console.log("Insert error:", insertError)

        if (insertError) {
          console.error("Insert error:", insertError)
          throw new Error(`Failed to create user: ${insertError.message}`)
        }

        // Store new user in localStorage (only on client side)
        if (typeof window !== "undefined") {
          localStorage.setItem("current_user", JSON.stringify(newUser))
        }
        return newUser
      }

      throw selectError
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  static async login() {
    if (typeof window === "undefined") return

    const email = prompt("Enter your email for testing:")
    if (email && email.trim()) {
      try {
        const user = await this.loginWithEmail(email.trim())
        alert(`Login successful! Welcome ${user.email}`)
        window.location.reload()
      } catch (error) {
        console.error("Login failed:", error)
        alert("Login failed: " + error.message)
      }
    }
  }

  static async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("current_user")
      window.location.reload()
    }
  }

  // Check if user is logged in
  static async getCurrentUser() {
    if (typeof window === "undefined") {
      return null
    }

    const storedUser = localStorage.getItem("current_user")
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch (e) {
        localStorage.removeItem("current_user")
      }
    }
    return null
  }
}

// Helper function to get a random element from an array
function getRandomElement(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Example usage of the updated generateUserAgent function
async function generateUserAgent() {
  const client = getSupabaseClient()

  const iosVersionUA = "15.0"
  const iosVersion = {
    webkit_version: "605.1.15",
    build_number: "19A5365",
    version: "15.0",
  }
  const appVersion = {
    version: "324.0",
    build_number: "123456789",
    fbrv: null, // This should be fetched from the database
  }
  const device = {
    model_name: "iPhone 12",
  }
  const language = "en_US"

  let userAgent = ""

  if (Math.random() < 0.5) {
    userAgent = `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVersionUA} like Mac OS X) AppleWebKit/${iosVersion.webkit_version} (KHTML, like Gecko) Mobile/${iosVersion.build_number} [FBAN/FBIOS;FBAV/${appVersion.version};FBBV/${appVersion.build_number};FBDV/${device.model_name};FBMD/iPhone;FBSN/iOS;FBSV/${iosVersion.version};FBSS/2;FBID/phone;FBLC/${language}]`
  } else {
    // Fetch device scaling from database if available
    if (client && isSupabaseAvailable()) {
      const { data: deviceScalingData, error: deviceScalingError } = await client
        .from("device_scaling")
        .select("scaling")
        .single()

      if (deviceScalingError) {
        console.error("Error fetching device scaling:", deviceScalingError)
      }

      const fbss = deviceScalingData ? deviceScalingData.scaling.replace(".00", "") : "2"
      const extra = Math.random() < 0.1 ? ";FBOP/80" : ""

      // Use FBRV from database or generate random
      let fbrv = appVersion.fbrv
      if (!fbrv) {
        // Fallback to random generation if no FBRV in database
        fbrv = Math.floor(Math.random() * 999999) + 700000000
      } else {
        // Handle partial FBRV completion
        const fbrvStr = fbrv.toString()
        if (fbrvStr.length < 9) {
          // Complete partial FBRV with random numbers
          const remainingDigits = 9 - fbrvStr.length
          const randomPart = Math.floor(Math.random() * Math.pow(10, remainingDigits))
            .toString()
            .padStart(remainingDigits, "0")
          fbrv = fbrvStr + randomPart
        }
      }

      const fbrv_part = extra ? "" : `;FBOP/5;FBRV/${fbrv}`
      const iabmv = Math.random() < 0.9 ? ";IABMV/1" : ""

      userAgent =
        `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVersionUA} like Mac OS X) ` +
        `AppleWebKit/${iosVersion.webkit_version} (KHTML, like Gecko) Mobile/${iosVersion.build_number} ` +
        `[FBAN/FBIOS;FBAV/${appVersion.version};FBBV/${appVersion.build_number};FBDV/${device.model_name};FBMD/iPhone;FBSN/iOS;` +
        `FBSV/${iosVersion.version};FBSS/${fbss};FBID/phone;FBLC/${language}${extra}${fbrv_part}${iabmv}]`
    } else {
      // Fallback when Supabase is not available
      const fbss = "2"
      const fbrv = Math.floor(Math.random() * 999999) + 700000000
      const fbrv_part = `;FBOP/5;FBRV/${fbrv}`
      const iabmv = Math.random() < 0.9 ? ";IABMV/1" : ""

      userAgent =
        `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVersionUA} like Mac OS X) ` +
        `AppleWebKit/${iosVersion.webkit_version} (KHTML, like Gecko) Mobile/${iosVersion.build_number} ` +
        `[FBAN/FBIOS;FBAV/${appVersion.version};FBBV/${appVersion.build_number};FBDV/${device.model_name};FBMD/iPhone;FBSN/iOS;` +
        `FBSV/${iosVersion.version};FBSS/${fbss};FBID/phone;FBLC/${language}${fbrv_part}${iabmv}]`
    }
  }

  console.log("Generated User Agent:", userAgent)
  return userAgent
}

// AccessKey entity class for authentication system
export class AccessKey extends BaseEntity {
  static tableName = "access_keys"

  static async authenticate(accessKey: string) {
    const client = getSupabaseClient()
    if (!client || !isSupabaseAvailable()) {
      throw new Error("Supabase not available")
    }

    console.log("Authenticating with key:", accessKey)

    const { data: user, error } = await client
      .from(this.tableName)
      .select("*")
      .eq("access_key", accessKey)
      .eq("is_active", true)
      .single()

    if (error || !user) {
      console.error("Authentication failed:", error)
      throw new Error("Invalid access key")
    }

    // Update last login
    await this.update(user.id, { last_login: new Date().toISOString() })

    console.log("Authentication successful:", user)
    return user
  }

  // Get current authenticated user from localStorage with sessionStorage fallback
  static getCurrentUser() {
    if (typeof window === "undefined") return null

    // Try localStorage first
    let storedUser = localStorage.getItem("authenticated_user")
    let storageType = "localStorage"

    // If localStorage fails or is empty, try sessionStorage
    if (!storedUser) {
      storedUser = sessionStorage.getItem("authenticated_user")
      storageType = "sessionStorage"
    }

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        console.log(`[v0] Retrieved user from ${storageType}:`, user)
        return user
      } catch (e) {
        console.log(`[v0] Failed to parse user from ${storageType}, removing:`, e)
        // Clean up corrupted data from both storages
        localStorage.removeItem("authenticated_user")
        sessionStorage.removeItem("authenticated_user")
      }
    }

    console.log("[v0] No user found in either localStorage or sessionStorage")
    return null
  }

  static async validateCurrentUser() {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return null

    try {
      // Re-authenticate with database to get fresh data
      const validatedUser = await this.authenticate(currentUser.access_key)
      this.setCurrentUser(validatedUser)
      return validatedUser
    } catch (error) {
      // Key is invalid, deleted, or expired
      this.logout()
      return null
    }
  }

  // Store authenticated user
  static setCurrentUser(user: any) {
    if (typeof window !== "undefined") {
      localStorage.setItem("authenticated_user", JSON.stringify(user))
    }
  }

  // Logout user
  static logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authenticated_user")
      sessionStorage.removeItem("authenticated_user")
      window.location.href = "/login"
    }
  }

  static isAdmin(user?: any) {
    const currentUser = user || this.getCurrentUser()
    return currentUser !== null // All authenticated users are admins
  }

  static canGenerate(user?: any) {
    const currentUser = user || this.getCurrentUser()
    return currentUser !== null // All authenticated users can generate unlimited
  }
}

export class UserGeneration extends BaseEntity {
  static tableName = "user_generations"

  static async createGeneration(accessKey: string, userName: string, generatedData: any, platform: string) {
    const client = getSupabaseClient()
    if (!client || !isSupabaseAvailable()) {
      throw new Error("Supabase not available")
    }

    const generationData = {
      access_key: accessKey,
      user_name: userName,
      generated_data: generatedData,
      platform: platform,
      created_at: new Date().toISOString(),
    }

    return await this.create(generationData)
  }

  static async getUserHistory(accessKey: string, limit = 50) {
    const client = getSupabaseClient()
    if (!client || !isSupabaseAvailable()) {
      return []
    }

    const { data, error } = await client
      .from(this.tableName)
      .select("*")
      .eq("access_key", accessKey)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching user history:", error)
      return []
    }

    return data || []
  }
}

export class InstagramDeviceModel extends BaseEntity {
  static tableName = "instagram_device_models"
}

export class InstagramVersion extends BaseEntity {
  static tableName = "instagram_versions"
}

export class InstagramBuildNumber extends BaseEntity {
  static tableName = "instagram_build_numbers"
}

export class ChromeVersion extends BaseEntity {
  static tableName = "chrome_versions"
}

export class ResolutionDpi extends BaseEntity {
  static tableName = "resolution_dpis"
}

export class PixelFacebookDeviceModel extends BaseEntity {
  static tableName = "pixel_facebook_device_models"
}

export class PixelFacebookBuildNumber extends BaseEntity {
  static tableName = "pixel_facebook_build_numbers"
}

export class PixelFacebookAppVersion extends BaseEntity {
  static tableName = "pixel_facebook_app_versions"
}

export class PixelInstagramDeviceModel extends BaseEntity {
  static tableName = "pixel_instagram_device_models"
}

export class PixelInstagramVersion extends BaseEntity {
  static tableName = "pixel_instagram_versions"
}

export class PixelInstagramChromeVersion extends BaseEntity {
  static tableName = "pixel_instagram_chrome_versions"
}

export class PixelInstagramResolutionDpi extends BaseEntity {
  static tableName = "pixel_instagram_resolution_dpis"
}

export class AdminNotice extends BaseEntity {
  static tableName = "admin_notices"

  static async getActiveNotices(targetUser?: string) {
    const client = getSupabaseClient()
    if (!client || !isSupabaseAvailable()) {
      return []
    }

    let query = client.from(this.tableName).select("*").eq("is_active", true)

    // Get notices for specific user or global notices
    if (targetUser) {
      query = query.or(`target_user.eq.${targetUser},target_user.is.null`)
    } else {
      query = query.is("target_user", null)
    }

    // Filter out expired notices
    query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching notices:", error)
      return []
    }

    return data || []
  }

  static async createNotice(title: string, message: string, targetUser?: string, expiresAt?: string) {
    const noticeData = {
      title,
      message,
      target_user: targetUser || null,
      expires_at: expiresAt || null,
      is_active: true,
      created_at: new Date().toISOString(),
    }

    return await this.create(noticeData)
  }
}

export class SamsungInstagramBuildNumber extends BaseEntity {
  static tableName = "samsung_instagram_build_numbers"
}
