"use client"

import { useEffect, useState } from "react"
import { Sparkles, AlertCircle } from "lucide-react"
import Image from "next/image"

interface AuthLoadingScreenProps {
  message?: string
  onTimeout?: () => void
  timeoutMs?: number
}

export default function AuthLoadingScreen({
  message = "Verifying your account...",
  onTimeout,
  timeoutMs = 10000, // 10 seconds default timeout
}: AuthLoadingScreenProps) {
  const [showTimeout, setShowTimeout] = useState(false)
  const [dots, setDots] = useState("")

  useEffect(() => {
    // Animated dots for loading message
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    // Timeout handler
    const timeoutTimer = setTimeout(() => {
      setShowTimeout(true)
      if (onTimeout) {
        onTimeout()
      }
    }, timeoutMs)

    return () => {
      clearInterval(dotsInterval)
      clearTimeout(timeoutTimer)
    }
  }, [onTimeout, timeoutMs])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex flex-col items-center space-y-8 px-4">
        {/* Logo with Animation */}
        <div className="relative">
          {/* Animated Rings */}
          <div className="absolute inset-0 -m-8">
            <div className="w-32 h-32 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400 opacity-50"></div>
          </div>
          <div className="absolute inset-0 -m-6">
            <div
              className="w-28 h-28 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin border-t-purple-600 dark:border-t-purple-400 opacity-50"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            ></div>
          </div>

          {/* Logo */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center animate-pulse">
            <Image
              src="/placeholder-logo.svg"
              alt="UgenPro Logo"
              width={40}
              height={40}
              className="drop-shadow-lg"
              priority
            />
          </div>

          {/* Sparkle Effects */}
          <div className="absolute -top-2 -right-2 animate-bounce" style={{ animationDelay: "0.5s" }}>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="absolute -bottom-2 -left-2 animate-bounce" style={{ animationDelay: "1s" }}>
            <Sparkles className="w-4 h-4 text-pink-500" />
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center space-y-4 max-w-md">
          {!showTimeout ? (
            <>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {message}
                <span className="inline-block w-8 text-left">{dots}</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Please wait while we verify your account status
              </p>

              {/* Animated Progress Dots */}
              <div className="flex justify-center space-x-2 pt-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div
                  className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                ></div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center space-x-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Server Not Responding</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The server is taking longer than expected. Please try again or contact support if the issue persists.
              </p>
            </>
          )}
        </div>

        {/* Brand Name */}
        <div className="absolute bottom-8">
          <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">UgenPro</p>
        </div>
      </div>
    </div>
  )
}
