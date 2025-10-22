"use client"

import type React from "react"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface AuthFormProps {
  variant: "login" | "signup"
  formData: {
    full_name?: string
    email: string
    password: string
    confirmPassword?: string
  }
  errors: string[]
  loading: boolean
  isSubmitting: boolean
  showPassword: boolean
  showConfirmPassword?: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onTogglePassword: () => void
  onToggleConfirmPassword?: () => void
  flashMessage?: { type: string; message: string } | null
  showSuccessMessage?: boolean
  successMessage?: string
  sessionInvalidReason?: boolean
  ipChangeLogout?: boolean
  pendingApproval?: boolean
}

const AuthForm = memo(function AuthForm({
  variant,
  formData,
  errors,
  loading,
  isSubmitting,
  showPassword,
  showConfirmPassword = false,
  onInputChange,
  onSubmit,
  onTogglePassword,
  onToggleConfirmPassword,
  flashMessage,
  showSuccessMessage = false,
  successMessage,
  sessionInvalidReason = false,
  ipChangeLogout = false,
  pendingApproval = false,
}: AuthFormProps) {
  const isLogin = variant === "login"
  const hasConfirmPassword = variant === "signup"

  return (
    <div className="w-full">
      {/* Success Messages */}
      {flashMessage && (
        <Alert className="mb-4 border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm">{flashMessage.message}</AlertDescription>
        </Alert>
      )}

      {successMessage && !flashMessage && (
        <Alert className="mb-4 border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Session Messages */}
      {sessionInvalidReason && (
        <Alert className="mb-4 border-orange-500/50 bg-orange-500/10">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-sm">Your session has expired. Please log in again.</AlertDescription>
        </Alert>
      )}

      {ipChangeLogout && (
        <Alert className="mb-4 border-orange-500/50 bg-orange-500/10">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-sm">
            Your session expired due to IP address change. Please log in again.
          </AlertDescription>
        </Alert>
      )}

      {pendingApproval && (
        <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-sm">
            Your account is pending approval. This usually takes 24 hours.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Messages */}
      {errors.length > 0 && !pendingApproval && (
        <Alert variant="destructive" className="mb-4 bg-red-500/10">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Full Name Field - Only for Signup */}
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Enter your full name"
              value={formData.full_name || ""}
              onChange={onInputChange}
              className="h-11 focus-visible:ring-blue-500"
              required
            />
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={isLogin ? "your@email.com" : "yourname@gmail.com"}
            value={formData.email}
            onChange={onInputChange}
            className="h-11 focus-visible:ring-blue-500"
            required
            autoComplete="email"
          />
          {!isLogin && <p className="text-xs text-muted-foreground">Only Gmail addresses are accepted</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={onInputChange}
              className="h-11 pr-10 focus-visible:ring-blue-500"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {isLogin && (
            <div className="text-right relative z-10">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium inline-block hover:underline cursor-pointer"
              >
                Forgot password?
              </Link>
            </div>
          )}
        </div>

        {/* Confirm Password Field - Only for Signup */}
        {hasConfirmPassword && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={formData.confirmPassword || ""}
                onChange={onInputChange}
                className="h-11 pr-10 focus-visible:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={onToggleConfirmPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && formData.confirmPassword.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                {formData.password === formData.confirmPassword ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Passwords match</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 bg-[#2B7FFF] hover:bg-[#1a6bff] text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || isSubmitting}
        >
          {loading || isSubmitting ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
            </div>
          ) : isLogin ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      {/* Auth Link */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="text-transparent bg-clip-text bg-gradient-to-r from-[#2B7FFF] to-[#4a9fff] hover:from-[#1a6bff] hover:to-[#3a8fef] font-semibold transition-all"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>

      {/* Legal Links */}
      {!isLogin && (
        <div className="text-center mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">By creating an account, you agree to our</p>
          <div className="flex justify-center gap-4 text-xs">
            <Link
              href="/terms-of-service"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-muted-foreground">and</span>
            <Link
              href="/privacy-policy"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      )}
    </div>
  )
})

export default AuthForm
