"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordUtils } from "@/lib/auth-client"
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Shield } from "lucide-react"
import AuthThemeToggle from "@/components/auth-theme-toggle"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const supabase = createClient()
        if (!supabase) {
          setErrors(["Authentication client not initialized. Please try again."])
          setCheckingSession(false)
          return
        }

        // 1) Try to complete recovery/session from URL params
        //    Supabase can send either `code` in query or tokens in hash fragment
        try {
          // Handle `code` param (PKCE flow)
          const code = typeof window !== "undefined" ? new URL(window.location.href).searchParams.get("code") : null
          if (code) {
            await supabase.auth.exchangeCodeForSession(code)
          } else if (typeof window !== "undefined" && window.location.hash) {
            // Handle hash tokens: #access_token=...&refresh_token=...&type=recovery
            const hash = window.location.hash.replace(/^#/, "")
            const params = new URLSearchParams(hash)
            const access_token = params.get("access_token")
            const refresh_token = params.get("refresh_token")
            const type = params.get("type")

            if (access_token && refresh_token) {
              await supabase.auth.setSession({ access_token, refresh_token })
            }

            // Clean up the hash from the URL to avoid re-processing on re-render
            if (type || access_token || refresh_token) {
              const url = new URL(window.location.href)
              url.hash = ""
              window.history.replaceState({}, document.title, url.toString())
            }
          }
        } catch (linkError: any) {
          console.warn("[v0] Recovery link processing warning:", linkError)
        }

        // Check if we have a valid session (from email link)
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("[v0] Session check error:", error)
          setErrors(["Invalid or expired reset link. Please request a new password reset."])
          setCheckingSession(false)
          return
        }

        if (!session) {
          console.log("[v0] No recovery session found")
          setErrors(["Invalid or expired reset link. Please request a new password reset."])
          setCheckingSession(false)
          return
        }

        console.log("[v0] Valid recovery session found")
        setHasValidSession(true)
        setCheckingSession(false)
      } catch (error: any) {
        console.error("[v0] Recovery session check error:", error)
        setErrors(["Failed to verify reset link. Please try again."])
        setCheckingSession(false)
      }
    }

    checkRecoverySession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setErrors([])
    setSuccess(false)

    try {
      // Validate password
      const passwordValidation = PasswordUtils.validatePassword(password)
      if (!passwordValidation.isValid) {
        setErrors(passwordValidation.errors)
        setLoading(false)
        return
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        setErrors(["Passwords do not match"])
        setLoading(false)
        return
      }

      const supabase = createClient()

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        console.error("[v0] Password update error:", updateError)
        throw new Error(updateError.message || "Failed to reset password")
      }

      console.log("[v0] Password reset successful")
      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login?message=Password reset successful! Please login with your new password.")
      }, 2000)
    } catch (error: any) {
      console.error("[v0] Password update error:", error)
      setErrors([error.message || "Failed to reset password"])
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="absolute top-6 right-6 z-20">
          <AuthThemeToggle />
        </div>
        <Card className="glass-card p-6 rounded-3xl shadow-2xl border-0 backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-blue-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-muted-foreground">Verifying reset link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasValidSession) {
    return (
      <div className="h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="absolute top-6 right-6 z-20">
          <AuthThemeToggle />
        </div>
        <div className="w-full max-w-md relative z-10">
          <Card className="glass-card p-6 rounded-3xl shadow-2xl border-0 backdrop-blur-xl bg-white/10 dark:bg-gray-900/10">
            <CardHeader className="text-center space-y-2 pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Invalid Reset Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive" className="backdrop-blur-sm rounded-xl">
                <XCircle className="h-5 w-5" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="font-medium">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push("/forgot-password")}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                Request New Reset Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white dark:bg-slate-900">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <AuthThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="glass-card p-6 rounded-3xl shadow-2xl border-0 backdrop-blur-xl bg-white/10 dark:bg-gray-900/10">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reset Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">Enter your new password</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Success Message */}
            {success && (
              <Alert className="border-green-500/30 bg-green-500/10 backdrop-blur-sm rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <AlertDescription className="text-green-400 font-medium">
                  Password reset successful! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
              <Alert variant="destructive" className="backdrop-blur-sm rounded-xl">
                <XCircle className="h-5 w-5" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="font-medium">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    New Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-12 pr-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background/80 transition-all duration-200 group-hover:border-blue-300/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-blue-500 transition-colors p-1 rounded-md hover:bg-blue-50/50 dark:hover:bg-blue-900/30"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold text-foreground flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Confirm New Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 pl-12 pr-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background/80 transition-all duration-200 group-hover:border-blue-300/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                    <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-blue-500 transition-colors p-1 rounded-md hover:bg-blue-50/50 dark:hover:bg-blue-900/30"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className="flex items-center space-x-2 text-xs">
                      {password === confirmPassword ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-green-500 font-medium">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-red-500" />
                          <span className="text-red-500 font-medium">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin spinner h-5 w-5 text-white"
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
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground/70">© 2025 UGen Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
