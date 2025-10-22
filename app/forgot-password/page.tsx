"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthService, ValidationUtils } from "@/lib/auth-client"
import { Mail, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import AuthThemeToggle from "@/components/auth-theme-toggle"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setErrors([])
    setSuccess(false)

    try {
      // Validate email
      const emailValidation = ValidationUtils.validateEmail(email)
      if (!emailValidation.isValid) {
        setErrors(emailValidation.errors)
        setLoading(false)
        return
      }

      await AuthService.resetPassword(email.trim())

      setSuccess(true)
    } catch (error: any) {
      console.error("[v0] Password reset error:", error)
      setErrors([error.message || "Failed to send reset email"])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white dark:bg-slate-900">
      {/* Go Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-blue-600 dark:text-blue-400 hover:bg-white/20 dark:hover:bg-gray-800/30 hover:border-blue-300/50 dark:hover:border-blue-500/50 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to Login</span>
        </Link>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <AuthThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="glass-card p-6 rounded-3xl shadow-2xl border-0 backdrop-blur-xl bg-white/10 dark:bg-gray-900/10">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Success Message */}
            {success && (
              <Alert className="border-green-500/30 bg-green-500/10 backdrop-blur-sm rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <AlertDescription className="text-green-400 font-medium">
                  Password reset email sent! Please check your inbox and follow the instructions.
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
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-12 pr-4 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background/80 transition-all duration-200 group-hover:border-blue-300/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                      required
                      autoComplete="email"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  </div>
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
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}

            {success && (
              <Button
                onClick={() => router.push("/login")}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                Back to Login
              </Button>
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
