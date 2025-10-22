"use client"

import { useEffect, useState, memo } from "react"
import { Globe, Shield, RefreshCw, Copy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface UserIPInfo {
  ip: string
  user_id: string
}

export const UserIPDisplay = memo(function UserIPDisplay() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [currentIP, setCurrentIP] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      loadIPInfo()
    }
  }, [user])

  const loadIPInfo = async () => {
    try {
      setLoading(true)

      const cachedData = localStorage.getItem("ip_cache")
      if (cachedData) {
        const { ip, timestamp } = JSON.parse(cachedData)
        const fiveMinutes = 5 * 60 * 1000
        if (Date.now() - timestamp < fiveMinutes) {
          setCurrentIP(ip)
          setLoading(false)
          return
        }
      }

      let detectedIP = null

      // Try multiple IP detection methods
      const ipDetectionMethods = [
        // Method 1: Our API
        async () => {
          const response = await fetch("/api/user/current-ip")
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data?.ip) {
              return data.data.ip
            }
          }
          return null
        },
        // Method 2: ipify.org
        async () => {
          const response = await fetch("https://api.ipify.org?format=json")
          if (response.ok) {
            const data = await response.json()
            return data.ip
          }
          return null
        },
        // Method 3: ipapi.co
        async () => {
          const response = await fetch("https://ipapi.co/ip/")
          if (response.ok) {
            const text = await response.text()
            return text.trim()
          }
          return null
        },
      ]

      // Try each method until one succeeds
      for (const method of ipDetectionMethods) {
        try {
          const ip = await method()
          if (ip && ip !== "::1" && ip !== "127.0.0.1" && ip !== "unknown" && ip.length > 0) {
            detectedIP = ip
            break
          }
        } catch (error) {
          console.warn("IP detection method failed:", error)
          continue
        }
      }

      if (detectedIP) {
        setCurrentIP(detectedIP)
        localStorage.setItem(
          "ip_cache",
          JSON.stringify({
            ip: detectedIP,
            timestamp: Date.now(),
          }),
        )
      } else {
        setCurrentIP("IP Detection Failed")
      }
    } catch (error) {
      console.error("Error loading IP info:", error)
      setCurrentIP("IP Detection Failed")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    localStorage.removeItem("ip_cache")
    await loadIPInfo()
    setRefreshing(false)

    // Only show success toast if IP was successfully loaded
    if (currentIP && currentIP !== "IP Detection Failed") {
      toast({
        title: "Success",
        description: "IP information updated",
      })
    }
  }

  if (!user) return null

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security Information
            </CardTitle>
            <CardDescription>Your current IP address and device information</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current IP */}
        <div
          className={`p-6 rounded-xl border ${
            currentIP === "IP Detection Failed"
              ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20"
              : "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  currentIP === "IP Detection Failed"
                    ? "bg-gradient-to-br from-orange-500 to-red-600"
                    : "bg-gradient-to-br from-green-500 to-emerald-600"
                }`}
              >
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Current IP Address</p>
                <p className="text-xl font-mono font-bold text-foreground">
                  {loading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : currentIP && currentIP !== "IP Detection Failed" ? (
                    currentIP
                  ) : (
                    <span className="text-orange-500">IP Detection Failed</span>
                  )}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    currentIP === "IP Detection Failed"
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {currentIP === "IP Detection Failed"
                    ? "Unable to detect your IP address. Please check your internet connection."
                    : "This IP is being monitored for security"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={currentIP === "IP Detection Failed" ? "secondary" : "default"}
                className={
                  currentIP === "IP Detection Failed"
                    ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                    : "bg-green-500/10 text-green-600 border-green-500/20"
                }
              >
                {currentIP === "IP Detection Failed" ? "Failed" : "Active"}
              </Badge>
              {currentIP && currentIP !== "IP Detection Failed" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(currentIP)
                      // Remove toast notification - just show tick mark
                    } catch (err) {
                      // Only show error toast for actual failures
                      toast({
                        title: "Error",
                        description: "Failed to copy IP address",
                        variant: "destructive"
                      })
                    }
                  }}
                  className="h-8 px-3 rounded-lg border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
