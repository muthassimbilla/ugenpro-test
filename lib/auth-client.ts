import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

// Types for our authentication system
export interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  updated_at: string
  is_approved: boolean
  account_status: string
  is_active: boolean
  expiration_date?: string | null
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  ip_address?: string
  user_agent?: string
  expires_at: string
  created_at: string
  last_accessed?: string
  is_active?: boolean
  logout_reason?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  full_name: string
  email: string
  password: string
}

// Email utilities
export class EmailUtils {
  static validateEmail(email: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (email.length === 0) {
      errors.push("Email is required")
      return { isValid: false, errors }
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push("Please enter a valid email address")
      return { isValid: false, errors }
    }

    // Check if email is Gmail only
    const emailLower = email.trim().toLowerCase()
    if (!emailLower.endsWith("@gmail.com")) {
      errors.push("Only Gmail addresses are supported. Please use a @gmail.com email address.")
      return { isValid: false, errors }
    }

    // Check for multiple consecutive dots
    if (/\.{2,}/.test(email)) {
      errors.push("Email cannot contain multiple consecutive dots")
    }

    // Check for common disposable email domains
    const disposableDomains = [
      "10minutemail.com",
      "tempmail.org",
      "guerrillamail.com",
      "mailinator.com",
      "yopmail.com",
      "temp-mail.org",
      "throwaway.email",
    ]

    const domain = email.split("@")[1]?.toLowerCase()
    if (domain && disposableDomains.includes(domain)) {
      errors.push("Disposable email addresses are not allowed")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

// Password utilities
export class PasswordUtils {
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length === 0) {
      errors.push("Password is required")
    } else if (password.length < 6) {
      errors.push("Password must be at least 6 characters long")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

// Client-side authentication service using Supabase Auth
export class AuthService {
  static async signup(signupData: SignupData): Promise<void> {
    try {
      console.log("[v0] Starting signup process with email:", signupData.email)

      // Validate email format and suspicious patterns
      const emailValidation = EmailUtils.validateEmail(signupData.email)
      if (!emailValidation.isValid) {
        console.log("[v0] Email validation failed:", emailValidation.errors)
        throw new Error(emailValidation.errors[0])
      }

      const supabase = createClient()

      // Get user's current IP address for tracking
      const currentIP = await this.getUserCurrentIP().catch(() => "unknown")
      console.log("[v0] User signup IP address:", currentIP)

      const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost"
      const baseUrl = isLocalhost ? "http://localhost:3000" : "https://ugenpro.site"

      // Use auth callback route for email verification
      const redirectUrl = `${baseUrl}/api/auth/callback?next=/login`

      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupData.full_name,
          },
        },
      })

      if (error) {
        console.error("[v0] Supabase signup error:", error)
        if (error.message.includes("already registered")) {
          throw new Error("This email is already registered. Please login instead.")
        }
        throw new Error(error.message)
      }

      if (!data.user) {
        console.error("[v0] No user data returned from signup")
        throw new Error("Failed to create account. Please try again.")
      }

      console.log("[v0] User created in auth.users:", data.user.id)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.warn("[v0] Profile check warning:", profileError)
      } else {
        console.log("[v0] Profile created successfully:", profile.id)

        if (currentIP && currentIP !== "unknown") {
          console.log("[v0] Storing signup IP address:", currentIP)
          await supabase
            .from("user_ip_history")
            .insert({
              user_id: data.user.id,
              ip_address: currentIP,
              is_current: true,
              first_seen: new Date().toISOString(),
              last_seen: new Date().toISOString(),
            })
            .then(({ error: ipError }) => {
              if (ipError) {
                console.warn("[v0] IP history tracking failed during signup:", ipError)
              } else {
                console.log("[v0] IP address stored successfully during signup")
              }
            })
        }
      }

      console.log("[v0] Signup successful, email verification sent")
    } catch (error: any) {
      console.error("[v0] Signup error:", error)
      throw new Error(error.message || "Failed to create account")
    }
  }

  static async login(
    credentials: LoginCredentials,
  ): Promise<{ user: User; userStatus: "approved" | "pending" | "expired" }> {
    try {
      console.log("[v0] Starting login process with email:", credentials.email)

      const supabase = createClient()

      const ipPromise = this.getUserCurrentIP().catch(() => "unknown")

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        console.error("[v0] Login error:", error)
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error("No user data returned from login")
      }

      if (!data.user.email_confirmed_at) {
        console.error("[v0] Email not verified")
        throw new Error(
          "Please verify your email address before logging in. Check your inbox for the verification link.",
        )
      }

      const [profileResponse, currentIP] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", data.user.id).single(),
        ipPromise,
      ])

      const profile = profileResponse.data
      const profileError = profileResponse.error

      if (profileError) {
        console.error("[v0] Profile fetch error:", profileError)
        throw new Error("Failed to fetch user profile")
      }

      let userStatus: "approved" | "pending" | "expired" = "approved"

      if (profile.account_status === "suspended") {
        console.error("[v0] Account is suspended")
        throw new Error("Your account has been suspended by admin")
      }

      if (profile.account_status === "inactive") {
        console.error("[v0] Account is deactivated")
        throw new Error("Account is deactivated")
      }

      if (profile.expiration_date && new Date(profile.expiration_date) < new Date()) {
        console.log("[v0] Account is expired")
        userStatus = "expired"
      } else if (!profile.is_approved) {
        console.log("[v0] Account is pending approval")
        userStatus = "pending"
      }

      const sessionToken = uuidv4() + "-" + Date.now().toString(36)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      const sessionPromise = supabase.from("user_sessions").insert({
        user_id: data.user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: currentIP,
        user_agent: navigator.userAgent || "Unknown",
        is_active: true,
      })

      if (currentIP && currentIP !== "unknown") {
        supabase
          .from("user_ip_history")
          .insert({
            user_id: data.user.id,
            ip_address: currentIP,
            is_current: true,
          })
          .then(({ error: ipError }) => {
            if (ipError) {
              console.warn("[v0] IP history tracking failed:", ipError)
            }
          })
      }

      await sessionPromise

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        full_name: profile.full_name,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        is_approved: profile.is_approved,
        account_status: profile.account_status,
        is_active: profile.is_active,
        expiration_date: profile.expiration_date,
      }

      console.log("[v0] Login successful with status:", userStatus)
      return { user, userStatus }
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      throw error
    }
  }

  static async logout(): Promise<void> {
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("[v0] Logout error:", error)
      }

      console.log("[v0] Logout successful")
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const supabase = createClient()

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        console.log("[v0] No authenticated user")
        return null
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError || !profile) {
        console.log("[v0] Profile not found")
        return null
      }

      return {
        id: user.id,
        email: user.email!,
        full_name: profile.full_name,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        is_approved: profile.is_approved,
        account_status: profile.account_status,
        is_active: profile.is_active,
        expiration_date: profile.expiration_date,
      }
    } catch (error: any) {
      console.error("[v0] Get current user error:", error)
      return null
    }
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      const supabase = createClient()

      const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost"
      const baseUrl = isLocalhost ? "http://localhost:3000" : "https://ugenpro.site"
      const redirectUrl = `${baseUrl}/api/auth/callback?next=/reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        throw new Error(error.message)
      }

      console.log("[v0] Password reset email sent")
    } catch (error: any) {
      console.error("[v0] Password reset error:", error)
      throw error
    }
  }

  static async updatePassword(newPassword: string): Promise<void> {
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw new Error(error.message)
      }

      console.log("[v0] Password updated successfully")
    } catch (error: any) {
      console.error("[v0] Password update error:", error)
      throw error
    }
  }

  static async getUserCurrentIP(): Promise<string | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1000)

      const response = await fetch("https://api.ipify.org?format=json", {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.ip
    } catch (error: any) {
      console.warn("[v0] IP detection error:", error.message)
      return null
    }
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    try {
      const supabase = createClient()

      const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost"
      const baseUrl = isLocalhost ? "http://localhost:3000" : "https://ugenpro.site"
      const redirectUrl = `${baseUrl}/api/auth/callback?next=/login`

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      console.log("[v0] Verification email resent successfully")
    } catch (error: any) {
      console.error("[v0] Resend verification error:", error)
      throw error
    }
  }
}

// Validation utilities
export class ValidationUtils {
  static validateEmail(email: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!email || email.trim().length === 0) {
      errors.push("Email is required")
      return { isValid: false, errors }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push("Please enter a valid email address")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static validateFullName(name: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!name || name.trim().length === 0) {
      errors.push("Full name is required")
      return { isValid: false, errors }
    }

    const trimmedName = name.trim()

    if (trimmedName.length < 2) {
      errors.push("Full name must be at least 2 characters long")
    }

    if (trimmedName.length > 100) {
      errors.push("Full name can be at most 100 characters long")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
