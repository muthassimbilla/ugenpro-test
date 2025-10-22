"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthService, ValidationUtils, PasswordUtils, EmailUtils } from "@/lib/auth-client"
import { setClientFlashMessage } from "@/lib/flash-messages"
import { useNetwork } from "@/contexts/network-context"
import AuthLayout from "@/components/auth/auth-layout"
import AuthHero from "@/components/auth/auth-hero"
import AuthForm from "@/components/auth/auth-form"
import { useAuth } from "@/lib/auth-context"

function SignupPage() {
  const router = useRouter()
  const { isOnline, retryConnection, isReconnecting } = useNetwork()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))

      // Clear errors when user starts typing
      if (errors.length > 0) {
        setErrors([])
      }
    },
    [errors.length],
  )

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const handleToggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev)
  }, [])

  const validateForm = useCallback(() => {
    const newErrors: string[] = []

    // Validate full name
    const nameValidation = ValidationUtils.validateFullName(formData.full_name)
    if (!nameValidation.isValid) {
      newErrors.push(...nameValidation.errors)
    }

    // Validate email format and suspicious patterns
    const emailValidation = EmailUtils.validateEmail(formData.email)
    if (!emailValidation.isValid) {
      newErrors.push(...emailValidation.errors)
    }

    // Validate password
    const passwordValidation = PasswordUtils.validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.push(...passwordValidation.errors)
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.push("Password and confirmation password do not match")
    }

    return newErrors
  }, [formData.full_name, formData.email, formData.password, formData.confirmPassword])

  useEffect(() => {
    async function checkAuthAndRedirect() {
      if (user) {
        console.log("[v0] User already logged in, redirecting...")
        setLoading(true)
        const currentUser = await AuthService.getCurrentUser()

        if (currentUser) {
          const isPending = !currentUser.is_approved
          const isSuspended = currentUser.account_status === "suspended"
          const isExpired = currentUser.expiration_date && new Date(currentUser.expiration_date) < new Date()

          if (isPending || isSuspended || isExpired) {
            router.push("/premium-tools")
          } else {
            router.push("/tool")
          }
        } else {
          router.push("/tool")
        }
      }
    }

    checkAuthAndRedirect()
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent multiple submissions
    if (isSubmitting) return

    // Immediate UI feedback - no freeze
    setIsSubmitting(true)
    setLoading(true)
    setErrors([])

    // Use requestAnimationFrame to ensure UI updates before heavy operations
    requestAnimationFrame(async () => {
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
        const signupTimeout = setTimeout(() => {
          setLoading(false)
          setIsSubmitting(false)
          setErrors(["Signup is taking longer than expected. Please try again."])
        }, 15000) // 15 second timeout

        try {
          console.log("[v0] Starting signup process")

          // Create account
          await AuthService.signup({
            full_name: formData.full_name.trim(),
            email: formData.email.trim(),
            password: formData.password,
          })

          clearTimeout(signupTimeout)
          console.log("[v0] Signup successful, redirecting to login")

          // Set flash message and redirect
          setClientFlashMessage(
            "success",
            "Account created successfully! Please check your email to verify your account before logging in.",
          )

          // Smooth transition to login page
          setTimeout(() => {
            router.push("/login?success=signup")
          }, 500) // Small delay for smooth transition
        } catch (signupError) {
          clearTimeout(signupTimeout)
          throw signupError
        }
      } catch (error: any) {
        console.error("[v0] Signup error:", error)

        if (error.message.includes("Supabase")) {
          setErrors([
            error.message,
            "Solution: Click the gear icon in the top right of the project and add Supabase integration.",
          ])
        } else {
          setErrors([error.message || "Failed to create account"])
        }
        setLoading(false)
        setIsSubmitting(false)
      }
    })
  }

  return (
    <AuthLayout variant="signup">
      <div className="space-y-8">
        <AuthHero variant="signup" />
        <AuthForm
          variant="signup"
          formData={formData}
          errors={errors}
          loading={loading}
          isSubmitting={isSubmitting}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onTogglePassword={handleTogglePassword}
          onToggleConfirmPassword={handleToggleConfirmPassword}
        />
      </div>
    </AuthLayout>
  )
}

export default SignupPage
