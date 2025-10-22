"use client"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface CustomModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: "success" | "error" | "info" | "warning"
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  showCancel?: boolean
  isLoading?: boolean
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const colorMap = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  warning: "text-amber-600 dark:text-amber-400",
}

const bgColorMap = {
  success:
    "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30",
  error:
    "bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-950/30 dark:via-rose-950/30 dark:to-pink-950/30",
  info: "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30",
  warning:
    "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30",
}

const buttonColorMap = {
  success:
    "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200",
  error:
    "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200",
  warning:
    "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200",
  info: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200",
}

const borderColorMap = {
  success: "border-green-200 dark:border-green-800",
  error: "border-red-200 dark:border-red-800",
  info: "border-emerald-200 dark:border-emerald-800",
  warning: "border-amber-200 dark:border-amber-800",
}

export default function CustomModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showCancel = false,
  isLoading = false,
}: CustomModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [particles, setParticles] = useState([])
  const Icon = iconMap[type]

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 10)

      // Generate particles for success type
      if (type === "success") {
        const newParticles = Array.from({ length: 6 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 2,
        }))
        setParticles(newParticles)
      }
    } else {
      setIsAnimating(false)
      setTimeout(() => {
        setIsVisible(false)
        setParticles([])
      }, 300)
    }
  }, [isOpen, type])

  if (!isVisible) return null

  const handleConfirm = () => {
    if (!isLoading) {
      if (onConfirm) {
        onConfirm()
      }
      onClose() // Always close modal
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      onCancel?.()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced Backdrop */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500 ease-out",
          isAnimating ? "bg-black/60 backdrop-blur-md" : "bg-black/0 backdrop-blur-none",
        )}
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Container */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md transition-all duration-500 ease-out",
          isAnimating ? "opacity-100 scale-100 translate-y-0 rotate-0" : "opacity-0 scale-90 translate-y-8 -rotate-1",
        )}
      >
        {/* Particles for success */}
        {type === "success" && isAnimating && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-2 h-2 bg-green-400 rounded-full animate-bounce opacity-70"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: "2s",
                }}
              />
            ))}
          </div>
        )}

        {/* Main Modal */}
        <div
          className={cn(
            "relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-2 overflow-hidden",
            "transform transition-all duration-300",
            borderColorMap[type],
            isAnimating && "shadow-3xl",
          )}
        >
          {/* Animated top border */}
          <div className="relative h-2 overflow-hidden">
            <div
              className={cn(
                "absolute inset-0 transition-all duration-1000 ease-out",
                type === "success" && "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500",
                type === "error" && "bg-gradient-to-r from-red-400 via-rose-500 to-pink-500",
                type === "warning" && "bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500",
                type === "info" && "bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500",
                isAnimating ? "translate-x-0" : "-translate-x-full",
              )}
            />
          </div>

          {/* Header Section */}
          <div className={cn("relative px-8 py-6 border-b border-slate-200 dark:border-slate-700", bgColorMap[type])}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent dark:via-slate-600" />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Animated Icon Container */}
                <div
                  className={cn(
                    "relative p-4 rounded-2xl shadow-lg transition-all duration-500",
                    "bg-white dark:bg-slate-800",
                    "ring-4 ring-white/50 dark:ring-slate-800/50",
                    isAnimating && "animate-pulse",
                  )}
                >
                  <Icon className={cn("w-8 h-8 transition-all duration-300", colorMap[type])} />

                  {/* Success sparkle effect */}
                  {type === "success" && isAnimating && (
                    <div className="absolute -top-1 -right-1 animate-spin">
                      <Sparkles className="w-5 h-5 text-green-500" />
                    </div>
                  )}

                  {/* Pulsing ring effect */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-2xl transition-all duration-1000",
                      type === "success" && "ring-2 ring-green-300 dark:ring-green-600",
                      type === "error" && "ring-2 ring-red-300 dark:ring-red-600",
                      type === "warning" && "ring-2 ring-amber-300 dark:ring-amber-600",
                      type === "info" && "ring-2 ring-blue-300 dark:ring-blue-600",
                      isAnimating ? "ring-opacity-50 scale-110" : "ring-opacity-0 scale-100",
                    )}
                  />
                </div>

                <div>
                  <h3
                    className={cn(
                      "text-2xl font-bold text-slate-900 dark:text-slate-100 transition-all duration-300",
                      isAnimating && "translate-x-0 opacity-100",
                      !isAnimating && "translate-x-4 opacity-0",
                    )}
                  >
                    {title}
                  </h3>

                  {/* Animated underline */}
                  <div
                    className={cn(
                      "h-1 rounded-full mt-2 transition-all duration-700 ease-out",
                      type === "success" && "bg-gradient-to-r from-green-500 to-emerald-500",
                      type === "error" && "bg-gradient-to-r from-red-500 to-rose-500",
                      type === "warning" && "bg-gradient-to-r from-amber-500 to-orange-500",
                      type === "info" && "bg-gradient-to-r from-blue-500 to-indigo-500",
                      isAnimating ? "w-20 opacity-100" : "w-0 opacity-0",
                    )}
                  />
                </div>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={!isLoading ? onClose : undefined}
                disabled={isLoading}
                className={cn(
                  "h-10 w-10 p-0 rounded-full transition-all duration-200",
                  "hover:bg-slate-100 dark:hover:bg-slate-700",
                  "hover:rotate-90 hover:scale-110",
                  isLoading && "opacity-50 cursor-not-allowed",
                )}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-6">
            <p
              className={cn(
                "text-slate-600 dark:text-slate-300 leading-relaxed text-lg transition-all duration-500",
                isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              {message}
            </p>
          </div>

          {/* Footer Section */}
          <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
            <div
              className={cn(
                "flex gap-4 justify-end transition-all duration-700",
                isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              {showCancel && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className={cn(
                    "px-6 py-3 font-semibold transition-all duration-200",
                    "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700",
                    "border-2 hover:border-slate-300 dark:hover:border-slate-600",
                    "hover:scale-105 hover:shadow-md",
                    isLoading && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {cancelText}
                </Button>
              )}

              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className={cn(
                  "px-6 py-3 font-semibold text-white transition-all duration-200",
                  buttonColorMap[type],
                  isLoading && "opacity-75 cursor-not-allowed",
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Please wait...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { CustomModal }
