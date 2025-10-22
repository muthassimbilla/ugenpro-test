"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertTriangle, X, Cpu, Zap, Sparkles } from "lucide-react"

interface ProgressModalProps {
  isOpen: boolean
  title: string
  message: string
  progress?: number
  onCancel?: () => void
  showCancel?: boolean
  type?: "info" | "success" | "warning" | "error"
}

export default function ProgressModal({
  isOpen,
  title,
  message,
  progress,
  onCancel,
  showCancel = false,
  type = "info",
}: ProgressModalProps) {
  const [pulseAnimation, setPulseAnimation] = useState(0)

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setPulseAnimation((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  if (!isOpen) return null

  const iconMap = {
    info: Loader2,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle,
  }

  const colorMap = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-amber-500",
    error: "text-red-500",
  }

  const Icon = iconMap[type]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-modal-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!showCancel ? undefined : onCancel} />

      <div className="relative z-10 w-full max-w-lg transform transition-all duration-500 animate-in zoom-in-95">
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

          <header className="px-6 py-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <Icon
                    className={`w-6 h-6 ${colorMap[type]} ${type === "info" ? "animate-spin" : ""}`}
                    style={{ animationDuration: type === "info" ? "2s" : "1s" }}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2 id="progress-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                    {title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex space-x-1" aria-hidden="true">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
                          style={{
                            animationDelay: `${i * 0.2}s`,
                            animationDuration: "1s",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {pulseAnimation} seconds running...
                    </span>
                  </div>
                </div>
              </div>

              {showCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </header>

          <main className="px-6 py-6 bg-white dark:bg-slate-800">
            <p className="text-slate-700 dark:text-slate-300 mb-6 text-base">{message}</p>

            {progress !== undefined && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" aria-hidden="true" />
                    Progress
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400" aria-live="polite">
                    {progress}%
                  </span>
                </div>

                <div className="relative">
                  <div
                    className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        style={{
                          animation: "shimmer 2s ease-in-out infinite",
                          transform: "translateX(-100%)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                    <span>High Speed</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full" aria-hidden="true" />
                  <div className="flex items-center gap-1">
                    <Cpu
                      className="w-3 h-3 animate-spin text-blue-500"
                      style={{ animationDuration: "3s" }}
                      aria-hidden="true"
                    />
                    <span>Processing...</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>💡 Tips: Each user agent will be unique and completely valid!</span>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
