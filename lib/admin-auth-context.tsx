"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AdminAuthService, type Admin } from "./admin-auth-service"

interface AdminAuthContextType {
  admin: Admin | null
  isLoading: boolean
  login: (admin: Admin, sessionToken: string) => void
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      checkAuthStatus()
    }
  }, [isHydrated])

  const checkAuthStatus = async () => {
    console.log("[v0] Starting auth check...")
    try {
      const sessionToken = localStorage.getItem("admin_session_token")
      console.log("[v0] Session token found:", !!sessionToken)

      if (sessionToken) {
        const currentAdmin = await AdminAuthService.getCurrentAdmin(sessionToken)
        if (currentAdmin) {
          console.log("[v0] Admin authenticated:", currentAdmin.username)
          setAdmin(currentAdmin)
        } else {
          console.log("[v0] Invalid session, removing token")
          localStorage.removeItem("admin_session_token")
          localStorage.removeItem("admin_data")
        }
      } else {
        console.log("[v0] No session token found")
      }
    } catch (error) {
      console.error("Auth check error:", error)
      localStorage.removeItem("admin_session_token")
      localStorage.removeItem("admin_data")
    } finally {
      console.log("[v0] Auth check completed, setting loading to false")
      setIsLoading(false)
    }
  }

  const login = (admin: Admin, sessionToken: string) => {
    console.log("[v0] Admin login successful:", admin.username)
    setAdmin(admin)
    localStorage.setItem("admin_session_token", sessionToken)
    localStorage.setItem("admin_data", JSON.stringify(admin))
    setIsLoading(false)
  }

  const logout = async () => {
    console.log("[v0] Admin logout initiated")
    try {
      const sessionToken = localStorage.getItem("admin_session_token")
      if (sessionToken) {
        await AdminAuthService.logout(sessionToken)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setAdmin(null)
      localStorage.removeItem("admin_session_token")
      localStorage.removeItem("admin_data")
      console.log("[v0] Admin logged out, redirecting to login")
      router.push("/adminbilla/login")
    }
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="glass-card p-8 rounded-2xl">
          <div className="text-lg text-foreground">অ্যাডমিন প্যানেল লোড হচ্ছে...</div>
        </div>
      </div>
    )
  }

  return <AdminAuthContext.Provider value={{ admin, isLoading, login, logout }}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
