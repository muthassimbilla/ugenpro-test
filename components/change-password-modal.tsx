"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Key, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const validateForm = () => {
    const newErrors: string[] = []

    // Validate current password
    if (!formData.currentPassword.trim()) {
      newErrors.push("Current password is required")
    }

    // Validate new password
    if (!formData.newPassword.trim()) {
      newErrors.push("New password is required")
    } else if (formData.newPassword.length < 6) {
      newErrors.push("New password must be at least 6 characters long")
    }

    // Validate password confirmation
    if (!formData.confirmPassword.trim()) {
      newErrors.push("Password confirmation is required")
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.push("New password and confirmation password do not match")
    }

    // Check if new password is different from current password
    if (formData.currentPassword === formData.newPassword) {
      newErrors.push("New password must be different from current password")
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent multiple submissions
    if (isSubmitting) return

    // Immediate UI feedback
    setIsSubmitting(true)
    setLoading(true)
    setErrors([])
    setSuccessMessage("")

    try {
      // Validate form
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        setLoading(false)
        setIsSubmitting(false)
        return
      }

      // Add timeout to prevent infinite loading
      const changePasswordTimeout = setTimeout(() => {
        setLoading(false)
        setIsSubmitting(false)
        setErrors(["Password change is taking longer than expected. Please try again."])
      }, 15000) // 15 second timeout

      try {
        console.log("[v0] Starting password change process")

        // Use Supabase client for authentication
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        console.log("[v0] Verifying current password")
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email || "",
          password: formData.currentPassword,
        })

        if (signInError) {
          clearTimeout(changePasswordTimeout)
          setErrors(["Current password is incorrect"])
          setLoading(false)
          setIsSubmitting(false)
          return
        }

        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          throw new Error("Session expired. Please login again.")
        }

        // Call change password API
        const response = await fetch("/api/user/change-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        })

        const data = await response.json()

        clearTimeout(changePasswordTimeout)

        if (!response.ok) {
          throw new Error(data.error || "Failed to change password")
        }

        console.log("[v0] Password changed successfully")

        // Show success message
        setSuccessMessage("Password changed successfully!")

        // Clear form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose()
        }, 2000)
      } catch (changePasswordError) {
        clearTimeout(changePasswordTimeout)
        throw changePasswordError
      }
    } catch (error: any) {
      console.error("[v0] Password change error:", error)
      setErrors([error.message || "Failed to change password"])
    } finally {
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!loading && !isSubmitting) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setErrors([])
      setSuccessMessage("")
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        {/* Change Password Modal */}
        <div className="glass-card p-6 rounded-3xl shadow-2xl border backdrop-blur-xl bg-white dark:bg-slate-900">
          {/* Header */}
          <div className="text-center space-y-2 pb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8e2de2] via-[#4a9fff] to-[#ff4b8a] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#8e2de2] via-[#4a9fff] to-[#ff4b8a] bg-clip-text text-transparent">
              Change Password
            </h2>
            <p className="text-muted-foreground text-sm">Update your account password for better security</p>
          </div>

          <div className="space-y-4">
            {/* Success Message */}
            {successMessage && (
              <Alert className="border-green-500/30 bg-green-500/10 backdrop-blur-sm rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <AlertDescription className="text-green-400 font-medium">{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
              <Alert variant="destructive" className="backdrop-blur-sm rounded-xl">
                <XCircle className="h-5 w-5" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {errors.map((error, index) => (
                      <li key={index} className="font-medium">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Change Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="currentPassword"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Current Password
                </Label>
                <div className="relative group">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="h-12 pl-12 pr-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background/80 transition-all duration-200 group-hover:border-blue-300/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    required
                    autoComplete="current-password"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-blue-500 transition-colors p-1 rounded-md hover:bg-blue-50/50 dark:hover:bg-blue-900/30"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  New Password
                </Label>
                <div className="relative group">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="h-12 pl-12 pr-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background/80 transition-all duration-200 group-hover:border-green-300/50 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                    required
                    autoComplete="new-password"
                  />
                  <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-green-500 transition-colors p-1 rounded-md hover:bg-green-50/50 dark:hover:bg-green-900/30"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground ml-1">Password must be at least 6 characters long</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm New Password
                </Label>
                <div className="relative group">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="h-12 pl-12 pr-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background/80 transition-all duration-200 group-hover:border-green-300/50 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                    required
                    autoComplete="new-password"
                  />
                  <CheckCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-green-500 transition-colors p-1 rounded-md hover:bg-green-50/50 dark:hover:bg-green-900/30"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Match Indicators */}
                {formData.confirmPassword && (
                  <div className="flex items-center space-x-2 text-xs">
                    {formData.newPassword === formData.confirmPassword ? (
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200"
                  disabled={loading || isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-[#2B7FFF] hover:bg-[#1a6bff] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden active:scale-[0.98] active:shadow-md"
                  disabled={loading || isSubmitting}
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
                      <span>Changing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Change Password
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
