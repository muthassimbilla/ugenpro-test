"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Clock, AlertTriangle, Home, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AccountBlockedPage() {
  const router = useRouter()
  const [statusType, setStatusType] = useState<"suspended" | "expired" | "unknown">("unknown")
  const [message, setMessage] = useState("Your account has a problem.")

  useEffect(() => {
    // Read status type from URL parameters
    const params = new URLSearchParams(window.location.search)
    const type = params.get("type") as "suspended" | "expired" | null
    const msg = params.get("message")

    if (type) {
      setStatusType(type)
    }
    if (msg) {
      setMessage(decodeURIComponent(msg))
    }
  }, [])

  const getStatusConfig = () => {
    switch (statusType) {
      case "suspended":
        return {
          icon: Shield,
          bgGradient: "from-red-500 to-red-600",
          bgLight: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-500",
          titleColor: "text-red-800",
          textColor: "text-red-700",
          badgeVariant: "destructive" as const,
          title: "Account Suspended",
          subtitle: "Your account has been temporarily disabled",
          actionText: "Contact Admin",
        }
      case "expired":
        return {
          icon: Clock,
          bgGradient: "from-orange-500 to-orange-600",
          bgLight: "bg-orange-50",
          borderColor: "border-orange-200",
          iconColor: "text-orange-500",
          titleColor: "text-orange-800",
          textColor: "text-orange-700",
          badgeVariant: "secondary" as const,
          title: "Account Expired",
          subtitle: "Your account subscription has expired",
          actionText: "Contact for Renewal",
        }
      default:
        return {
          icon: AlertTriangle,
          bgGradient: "from-gray-500 to-gray-600",
          bgLight: "bg-gray-50",
          borderColor: "border-gray-200",
          iconColor: "text-gray-500",
          titleColor: "text-gray-800",
          textColor: "text-gray-700",
          badgeVariant: "outline" as const,
          title: "Account Problem",
          subtitle: "Your account has a problem",
          actionText: "Contact for Support",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const handleGoHome = () => {
    router.push("/")
  }

  const handleContactAdmin = () => {
    // Open admin's Telegram
    window.open("https://t.me/your_admin_username", "_blank")
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className={`${config.bgLight} ${config.borderColor} border rounded-2xl p-8 shadow-lg`}>
          {/* Icon */}
          <div
            className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${config.bgGradient} flex items-center justify-center`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>

          {/* Title and Badge */}
          <div className="text-center mb-4">
            <h1 className={`text-xl font-bold ${config.titleColor} mb-2`}>{config.title}</h1>
            <Badge variant={config.badgeVariant} className="mb-3">
              {statusType === "suspended" ? "Suspended" : statusType === "expired" ? "Expired" : "Issue"}
            </Badge>
            <p className={`text-sm ${config.textColor}`}>{config.subtitle}</p>
          </div>

          {/* Message */}
          <div className={`p-4 rounded-lg bg-white border ${config.borderColor} mb-6`}>
            <p className={`text-sm ${config.textColor} text-center`}>{message}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleContactAdmin}
              className={`w-full bg-gradient-to-r ${config.bgGradient} hover:opacity-90`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {config.actionText}
            </Button>

            <Button variant="outline" onClick={handleGoHome} className="w-full bg-transparent">
              <Home className="w-4 h-4 mr-2" />
              Back to Home Page
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Contact admin for problem resolution</p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span>Support: @your_admin_username</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">This message is displayed for your account's security</p>
        </div>
      </div>
    </div>
  )
}
