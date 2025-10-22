"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle, Ban, Clock, HelpCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AccountErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorType, setErrorType] = useState<string>("unknown")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const type = searchParams.get("type") || "unknown"
    const message = searchParams.get("message") || ""
    setErrorType(type)
    setErrorMessage(message)
  }, [searchParams])

  const getErrorConfig = () => {
    switch (errorType) {
      case "banned":
      case "suspended":
        return {
          icon: <Ban className="w-16 h-16 text-red-500" />,
          title: "Account Suspended",
          description: errorMessage || "Your account has been suspended by an administrator.",
          color: "red",
          actions: [
            {
              label: "Contact Support",
              onClick: () => router.push("/contact"),
              variant: "default" as const,
            },
          ],
        }
      case "expired":
        return {
          icon: <Clock className="w-16 h-16 text-amber-500" />,
          title: "Account Expired",
          description: errorMessage || "Your account subscription has expired.",
          color: "amber",
          actions: [
            {
              label: "Upgrade Account",
              onClick: () => router.push("/premium-tools"),
              variant: "default" as const,
            },
            {
              label: "Back to Login",
              onClick: () => router.push("/login"),
              variant: "outline" as const,
            },
          ],
        }
      case "deactivated":
      case "inactive":
        return {
          icon: <AlertTriangle className="w-16 h-16 text-orange-500" />,
          title: "Account Deactivated",
          description: errorMessage || "Your account has been deactivated. Please contact support to reactivate.",
          color: "orange",
          actions: [
            {
              label: "Contact Support",
              onClick: () => router.push("/contact"),
              variant: "default" as const,
            },
            {
              label: "Back to Login",
              onClick: () => router.push("/login"),
              variant: "outline" as const,
            },
          ],
        }
      default:
        return {
          icon: <HelpCircle className="w-16 h-16 text-slate-500" />,
          title: "Account Error",
          description: errorMessage || "There was an error verifying your account. Please try again.",
          color: "slate",
          actions: [
            {
              label: "Try Again",
              onClick: () => router.push("/login"),
              variant: "default" as const,
            },
            {
              label: "Contact Support",
              onClick: () => router.push("/contact"),
              variant: "outline" as const,
            },
          ],
        }
    }
  }

  const config = getErrorConfig()

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 p-4">
      <Card className="max-w-md w-full shadow-2xl border-2">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">{config.icon}</div>
          <div>
            <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
            <CardDescription className="text-base mt-2">{config.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.actions.map((action, index) => (
            <Button key={index} onClick={action.onClick} variant={action.variant} className="w-full" size="lg">
              {action.label}
            </Button>
          ))}

          <Button onClick={() => router.push("/")} variant="ghost" className="w-full" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
