"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Clock, Shield, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { UserStatus } from "@/lib/user-status-service"

interface AccountStatusNotificationProps {
  status: UserStatus
  onClose?: () => void
  onLogout?: () => void
}

export function AccountStatusNotification({ status, onClose, onLogout }: AccountStatusNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // If status is invalid, auto logout after 15 seconds, except for expired accounts
    if (!status.is_valid && status.status !== "expired") {
      const timer = setTimeout(() => {
        if (onLogout) {
          onLogout()
        }
      }, 15000) // Increased to 15 seconds

      return () => clearTimeout(timer)
    }
  }, [status.is_valid, status.status, onLogout])

  if (!isVisible) return null

  const getStatusConfig = () => {
    switch (status.status) {
      case "suspended":
        return {
          icon: Shield,
          bgColor: "bg-red-50 border-red-200",
          iconColor: "text-red-500",
          titleColor: "text-red-800",
          textColor: "text-red-700",
          badgeVariant: "destructive" as const,
          title: "Account Suspended",
          autoClose: false,
        }
      case "expired":
        return {
          icon: Clock,
          bgColor: "bg-orange-50 border-orange-200",
          iconColor: "text-orange-500",
          titleColor: "text-orange-800",
          textColor: "text-orange-700",
          badgeVariant: "secondary" as const,
          title: "Account Expired",
          autoClose: false,
        }
      case "active":
        return {
          icon: Shield,
          bgColor: "bg-green-50 border-green-200",
          iconColor: "text-green-500",
          titleColor: "text-green-800",
          textColor: "text-green-700",
          badgeVariant: "default" as const,
          title: "Account Active",
          autoClose: true,
        }
      default:
        return {
          icon: AlertTriangle,
          bgColor: "bg-gray-50 border-gray-200",
          iconColor: "text-gray-500",
          titleColor: "text-gray-800",
          textColor: "text-gray-700",
          badgeVariant: "outline" as const,
          title: "Connection Issue",
          autoClose: true,
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg border shadow-lg ${config.bgColor}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-sm font-semibold ${config.titleColor}`}>{config.title}</h3>
            <Badge variant={config.badgeVariant} className="text-xs">
              {status.status === "active"
                ? "Active"
                : status.status === "suspended"
                  ? "Suspended"
                  : status.status === "expired"
                    ? "Expired"
                    : "Unknown"}
            </Badge>
          </div>

          <p className={`text-sm ${config.textColor} mb-3`}>{status.message}</p>

          {!status.is_valid && status.status !== "expired" && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-600 mb-1">Auto logout in 15 seconds...</div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-red-500 h-1 rounded-full transition-all duration-15000 ease-linear"
                    style={{
                      animation: "countdown 15s linear forwards",
                      width: "100%",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!status.is_valid && status.status !== "expired" && onLogout && (
              <Button size="sm" variant="outline" onClick={onLogout} className="text-xs bg-transparent">
                Logout Now
              </Button>
            )}

            {config.autoClose && (
              <Button size="sm" variant="ghost" onClick={handleClose} className="text-xs">
                OK
              </Button>
            )}
          </div>
        </div>

        <button
          onClick={handleClose}
          className={`flex-shrink-0 p-1 rounded-full hover:bg-white/50 transition-colors ${config.iconColor}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <style jsx>{`
        @keyframes countdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
