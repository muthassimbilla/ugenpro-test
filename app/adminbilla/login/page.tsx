"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminAuthService } from "@/lib/admin-auth-service"
import { useAdminAuth } from "@/lib/admin-auth-context"
import { Shield, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react"
import AuthThemeToggle from "@/components/auth-theme-toggle"
import { useNetwork } from "@/contexts/network-context"
import NoInternet from "@/components/no-internet"

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { admin, login } = useAdminAuth()
  const { isOnline, retryConnection, isReconnecting } = useNetwork()

  useEffect(() => {
    if (admin) {
      console.log("[v0] Admin already logged in, redirecting to dashboard")
      router.replace("/adminbilla")
    }
  }, [admin, router])

  if (admin) {
    return null
  }

  // Show no internet page if offline
  if (!isOnline) {
    return <NoInternet onRetry={retryConnection} isReconnecting={isReconnecting} />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Attempting login with:", credentials.username)
      const result = await AdminAuthService.login(credentials)
      console.log("[v0] Login successful, calling login function")
      login(result.admin, result.sessionToken)

      router.replace("/adminbilla")
    } catch (error: any) {
      console.error("[v0] Admin login error:", error)
      setError(error.message || "Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-background">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-20">
        <AuthThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="border rounded-lg p-8 bg-card shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">অ্যাডমিন প্যানেল</h1>
            <p className="text-sm text-muted-foreground">সুরক্ষিত অ্যাডমিন লগইন</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">অ্যাডমিন ইউজারনেম</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="অ্যাডমিন ইউজারনেম লিখুন"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">This is a secure admin panel</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">© 2025 UGen Pro</p>
        </div>
      </div>
    </div>
  )
}
