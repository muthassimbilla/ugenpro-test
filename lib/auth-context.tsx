"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useTransition } from "react"
import type { User } from "./auth-client"
import { AuthService } from "./auth-client"
import { useStatusMiddleware } from "./status-middleware"
import { useStatusNotification } from "@/components/status-notification-provider"
import type { UserStatus } from "./user-status-service"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ user: User | null; userStatus: UserStatus | null }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  userStatus: UserStatus | null
  checkUserStatus: () => Promise<UserStatus | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [isLoginInProgress, setIsLoginInProgress] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [initialCheckComplete, setInitialCheckComplete] = useState(false)

  const { showNotification } = useStatusNotification()

  const checkAuth = async () => {
    if (isLoginInProgress) {
      return
    }

    try {
      setLoading(true)

      const currentUser = await AuthService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
      setInitialCheckComplete(true)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoginInProgress(true)
      setLoading(true)

      const { user: loggedInUser, userStatus } = await AuthService.login({
        email,
        password,
      })

      startTransition(() => {
        setUser(loggedInUser)
        setUserStatus(userStatus)
      })

      return { user: loggedInUser, userStatus }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
      setIsLoginInProgress(false)
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()

      setUser(null)
      setUserStatus(null)

      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    } catch (error) {
      setUser(null)
      setUserStatus(null)

      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
  }

  const refreshUser = async () => {
    await checkAuth()
  }

  const handleStatusInvalid = async (status: UserStatus) => {
    setUserStatus(status)

    showNotification(status)

    if (status.status === "suspended" || status.status === "deactivated") {
      setTimeout(async () => {
        await logout()
      }, 2000)
    }

    if (status.status === "inactive") {
      setTimeout(async () => {
        await logout()
      }, 10000)
    }
  }

  const { checkStatus } = useStatusMiddleware(user?.id || null, handleStatusInvalid)

  const checkUserStatus = async (): Promise<UserStatus | null> => {
    const status = await checkStatus()
    if (status) {
      setUserStatus(status)

      if (!status.is_valid) {
        showNotification(status)
      }
    }
    return status
  }

  useEffect(() => {
    if (typeof window !== "undefined" && !initialCheckComplete) {
      try {
        checkAuth()
      } catch (error) {
        // Silent fail
      }
    }
  }, [initialCheckComplete])

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    userStatus,
    checkUserStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
