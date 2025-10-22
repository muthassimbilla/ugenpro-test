"use client"

import type React from "react"
import { useState, useEffect, useCallback, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthService } from "@/lib/auth-client"
import { UserStatusService } from "@/lib/user-status-service"
import { getClientFlashMessage, clearClientFlashMessage, type FlashMessage } from "@/lib/flash-messages"
import { useNetwork } from "@/contexts/network-context"
import NoInternet from "@/components/no-internet"
import AuthLayout from "@/components/auth/auth-layout"
import AuthHero from "@/components/auth/auth-hero"
import AuthForm from "@/components/auth/auth-form"
import LoadingOverlay from "@/components/loading-overlay"
import AuthLoadingScreen from "@/components/auth-loading-screen"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user, loading: authLoading } = useAuth()
  const { isOnline, retryConnection, isReconnecting } = useNetwork()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null)
  const [pendingApproval, setPendingApproval] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [ipChangeLogout, setIpChangeLogout] = useState(false)
  const [sessionInvalidReason, setSessionInvalidReason] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false)
  const [verificationTimeout, setVerificationTimeout] = useState(false)

  const clearSessionData = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("session_token")
        localStorage.removeItem("current_user")

        document.cookie =
          "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" + window.location.hostname
        document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
      console.log("[v0] Session data cleared for Vercel")
    } catch (error) {
      console.error("[v0] Error clearing session data:", error)
    }
  }

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))

      if (errors.length > 0) {
        setErrors([])
        setPendingApproval(false)
      }
    },
    [errors.length],
  )

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const validateForm = useCallback(() => {
    const newErrors: string[] = []

    if (!formData.email.trim()) {
      newErrors.push("Email is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Please enter a valid email address")
    }

    if (!formData.password.trim()) {
      newErrors.push("Password is required")
    }

    return newErrors
  }, [formData.email, formData.password])

  const verifyAccountAndRedirect = async (userId: string) => {
    try {
      console.log("[v0] Starting account verification for user:", userId)
      setIsVerifyingAccount(true)

      const status = await UserStatusService.checkUserStatus(userId)
      console.log("[v0] Account status result:", status)

      const redirectParam = searchParams.get("redirect")

      if (status.status === "active") {
        const destination = redirectParam || "/tool"
        console.log("[v0] Redirecting active user to:", destination)
        router.push(destination)
        // Loading screen will stay visible until new page loads
      } else if (status.status === "expired" || status.status === "pending") {
        console.log("[v0] Redirecting expired/pending user to premium tools")
        router.push("/premium-tools")
        // Loading screen will stay visible until new page loads
      } else if (status.status === "suspended" || status.status === "deactivated" || status.status === "inactive") {
        console.log("[v0] Redirecting suspended/deactivated user to error page")
        router.push(`/account-error?type=${status.status}&message=${encodeURIComponent(status.message)}`)
        // Loading screen will stay visible until error page loads
      } else {
        console.log("[v0] Unknown status, redirecting to error page")
        router.push(`/account-error?type=unknown&message=${encodeURIComponent(status.message)}`)
        // Loading screen will stay visible until error page loads
      }
    } catch (error: any) {
      console.error("[v0] Account verification error:", error)
      setIsVerifyingAccount(false)
      setLoading(false)
      setIsSubmitting(false)

      // Show error and allow user to try again
      setErrors(["Failed to verify account status. Please try again."])
    }
  }

  const handleVerificationTimeout = () => {
    console.log("[v0] Account verification timeout")
    setVerificationTimeout(true)
    setTimeout(() => {
      router.push("/account-error?type=error&message=Server%20not%20responding")
      // Loading screen will stay visible until error page loads
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    setIsSubmitting(true)
    setLoading(true)
    setErrors([])
    setSuccessMessage("")
    setPendingApproval(false)
    setShowResendVerification(false)
    setResendSuccess(false)

    try {
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        setLoading(false)
        setIsSubmitting(false)
        return
      }

      const loginResult = await login(formData.email.trim(), formData.password)
      console.log("[v0] Login successful, starting account verification")

      if (loginResult.user) {
        await verifyAccountAndRedirect(loginResult.user.id)
      } else {
        throw new Error("Login succeeded but user data is missing")
      }
    } catch (error: any) {
      console.error("[v0] Login error:", error)

      const errorMsg = error.message?.toLowerCase() || ""

      if (errorMsg.includes("verify your email") || errorMsg.includes("email not confirmed")) {
        setErrors(["Please verify your email address before logging in. Check your inbox for the verification link."])
        setShowResendVerification(true)
      } else if (errorMsg.includes("deactivated")) {
        setErrors(["Your account has been deactivated. Please contact support."])
      } else if (errorMsg.includes("suspended")) {
        setErrors(["Your account suspended by admin"])
      } else if (errorMsg.includes("invalid") || errorMsg.includes("credentials")) {
        setErrors(["Invalid email or password. Please check your credentials and try again."])
      } else {
        setErrors([error.message || "Login failed. Please try again."])
      }

      setLoading(false)
      setIsSubmitting(false)
    }
  }

  const handleResendVerification = async () => {
    if (!formData.email || resendingVerification) return

    setResendingVerification(true)
    setResendSuccess(false)

    try {
      await AuthService.resendVerificationEmail(formData.email.trim())
      setResendSuccess(true)
      setShowResendVerification(false)
      setSuccessMessage("Verification email sent! Please check your inbox.")
      setShowSuccessMessage(true)
    } catch (error: any) {
      console.error("[v0] Resend verification error:", error)
      setErrors([error.message || "Failed to resend verification email. Please try again."])
    } finally {
      setResendingVerification(false)
    }
  }

  useEffect(() => {
    const message = searchParams.get("message")
    const reason = searchParams.get("reason")
    const success = searchParams.get("success")
    const verified = searchParams.get("verified")
    const error = searchParams.get("error")

    if (verified === "true") {
      setSuccessMessage("Email verified successfully! You can now log in.")
      setTimeout(() => {
        setShowSuccessMessage(true)
      }, 100)
      return
    }

    if (error) {
      setErrors([decodeURIComponent(error)])
      return
    }

    const flash = getClientFlashMessage()
    if (flash) {
      setFlashMessage(flash)
      clearClientFlashMessage()
      setTimeout(() => {
        setShowSuccessMessage(true)
      }, 100)
      return
    }

    if (message) {
      setSuccessMessage(message)
      setTimeout(() => {
        setShowSuccessMessage(true)
      }, 100)
    } else if (success === "signup") {
      setSuccessMessage("Account created successfully! Please check your email to verify your account.")
      setTimeout(() => {
        setShowSuccessMessage(true)
      }, 100)
    }

    if (reason === "ip_changed") {
      setIpChangeLogout(true)
    }

    if (reason === "session_invalid") {
      setSessionInvalidReason(true)
      clearSessionData()

      if (typeof window !== "undefined") {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete("reason")
        newUrl.searchParams.delete("message")
        window.history.replaceState({}, "", newUrl.toString())

        setTimeout(() => {
          console.log("[v0] Vercel session cleanup completed")
        }, 50)
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (!authLoading) {
      setIsCheckingAuth(false)
    }
  }, [authLoading])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (isVerifyingAccount) {
    return (
      <AuthLoadingScreen
        message={verificationTimeout ? "Server not responding" : "Verifying your account"}
        onTimeout={handleVerificationTimeout}
        timeoutMs={10000}
      />
    )
  }

  if (!isInitialized || (isCheckingAuth && authLoading)) {
    return <LoadingOverlay message="Loading..." fullScreen />
  }

  if (!isOnline) {
    return <NoInternet onRetry={retryConnection} isReconnecting={isReconnecting} />
  }

  return (
    <AuthLayout variant="login">
      <div className="space-y-8 page-transition">
        <AuthHero variant="login" />

        {showResendVerification && (
          <Alert className="border-primary/50 bg-card">
            <Mail className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">Didn't receive the verification email?</span>
              <Button
                onClick={handleResendVerification}
                disabled={resendingVerification}
                size="sm"
                variant="outline"
                className="ml-4 bg-transparent"
              >
                {resendingVerification ? "Sending..." : "Resend Email"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <AuthForm
          variant="login"
          formData={formData}
          errors={errors}
          loading={loading}
          isSubmitting={isSubmitting}
          showPassword={showPassword}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onTogglePassword={handleTogglePassword}
          flashMessage={flashMessage}
          showSuccessMessage={showSuccessMessage}
          successMessage={successMessage}
          sessionInvalidReason={sessionInvalidReason}
          ipChangeLogout={ipChangeLogout}
          pendingApproval={pendingApproval}
        />
      </div>
    </AuthLayout>
  )
}
