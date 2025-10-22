"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2, Sparkles, Crown } from "lucide-react"
import LoadingSpinner from "@/components/loading-spinner"
import SimpleHeader from "@/components/simple-header"
import { PricingCards } from "@/components/pricing-cards"

export default function PremiumToolsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userStatus, setUserStatus] = useState<"pending" | "expired" | "unknown">("unknown")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      const isPending = !user.is_approved
      const isExpired = user.expiration_date && new Date(user.expiration_date) < new Date()
      const isSuspended = user.status === "suspended"

      // If user is approved and not expired/suspended, redirect to tools page
      if (user.is_approved && !isExpired && !isSuspended) {
        router.push("/tool")
        return
      }

      // Determine user status for display
      if (isPending) {
        setUserStatus("pending")
      } else if (isExpired) {
        setUserStatus("expired")
      } else {
        setUserStatus("unknown")
      }
    }

    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [user, loading, router])

  useEffect(() => {
    if (userStatus === "pending" || userStatus === "expired") {
      // Block browser back button
      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault()
        window.history.pushState(null, "", window.location.href)
      }

      window.history.pushState(null, "", window.location.href)
      window.addEventListener("popstate", handlePopState)

      return () => {
        window.removeEventListener("popstate", handlePopState)
      }
    }
  }, [userStatus])

  if (loading || !user) {
    return <LoadingSpinner />
  }

  const getStatusConfig = () => {
    if (userStatus === "pending") {
      return {
        icon: Crown,
        bgColor: "from-purple-500 to-pink-600",
        textColor: "text-purple-700 dark:text-purple-300",
        badgeVariant: "secondary" as const,
        title: "Premium Subscription Required",
        message:
          "You need a subscription to access all Premium Tools. Choose your preferred plan from below and get started now!",
      }
    } else if (userStatus === "expired") {
      return {
        icon: AlertTriangle,
        bgColor: "from-red-500 to-rose-600",
        textColor: "text-red-700 dark:text-red-300",
        badgeVariant: "destructive" as const,
        title: "Subscription Expired",
        message: "Your subscription has expired. Buy a new plan from below to regain access.",
      }
    }
    return {
      icon: CheckCircle2,
      bgColor: "from-green-500 to-emerald-600",
      textColor: "text-green-700 dark:text-green-300",
      badgeVariant: "default" as const,
      title: "Subscription Active",
      message: "Your subscription is active.",
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  const handleContactAdmin = () => {
    if (typeof window !== "undefined") {
      window.open("https://t.me/ugenpro_admin", "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <SimpleHeader />

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-pink-100/50 dark:hidden" />
        <div className="hidden dark:block absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/25 via-purple-900/15 to-pink-900/25" />
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/10 via-transparent to-rose-900/10" />
        </div>
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-400/40 dark:bg-blue-500/20 rounded-full animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-400/40 dark:bg-purple-500/20 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-80 h-80 bg-pink-400/30 dark:bg-pink-500/15 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Added pt-24 to account for fixed header */}
      <div className="relative z-10 px-6 py-12 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Status Banner */}
          <div
            className={`mb-8 p-6 rounded-2xl bg-gradient-to-r ${statusConfig.bgColor} shadow-xl transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <StatusIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-white">{statusConfig.title}</h2>
                  <Badge variant={statusConfig.badgeVariant} className="bg-white/20 text-white border-white/30">
                    {userStatus === "pending" ? "Subscription Needed" : userStatus === "expired" ? "Expired" : "Active"}
                  </Badge>
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">{statusConfig.message}</p>
                {userStatus === "pending" && (
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        const pricingSection = document.getElementById("pricing-section")
                        if (pricingSection) {
                          pricingSection.scrollIntoView({ behavior: "smooth" })
                        }
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Buy Subscription
                    </Button>
                    <div className="text-white/70 text-xs">💎 Access Premium Tools</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div
            id="pricing-section"
            className={`transition-all duration-1000 delay-200 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pricing Plans
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Choose Your Plan
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Choose a plan according to your needs and access all Premium Tools
              </p>
            </div>

            <PricingCards showContactAdmin={true} buttonText="Buy Now" />
          </div>

          {/* Contact Admin Section */}
          <div
            className={`mt-12 text-center transition-all duration-1000 delay-400 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Card className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-purple-200/50 dark:border-purple-500/30 p-8 rounded-2xl shadow-xl">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  Need Help?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  If you have any problems or questions, please contact us
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={handleContactAdmin}
                    variant="outline"
                    className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-purple-300 dark:border-purple-600"
                  >
                    Contact Admin
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
