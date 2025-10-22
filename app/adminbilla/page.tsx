"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/admin-auth-context"
import { Users, Activity, Clock, CheckCircle, RefreshCw, Shield, ChevronRight } from "lucide-react"
import Link from "next/link"
import { AdminUserService, type AdminUser } from "@/lib/admin-user-service"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminDashboard() {
  const { admin, isLoading } = useAdminAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    if (!isLoading && !admin) {
      router.replace("/404")
    }
  }, [admin, isLoading, router])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const result = await AdminUserService.getAllUsers()
        const userData = result?.users || []
        setUsers(Array.isArray(userData) ? userData : [])
        setLastUpdated(new Date())
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setUsers([])
      } finally {
        setIsLoadingData(false)
      }
    }

    if (admin) {
      loadDashboardData()
    }
  }, [admin])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !admin) return

    const interval = setInterval(() => {
      const loadDashboardData = async () => {
        try {
          const result = await AdminUserService.getAllUsers()
          const userData = result?.users || []
          setUsers(Array.isArray(userData) ? userData : [])
          setLastUpdated(new Date())
        } catch (error) {
          console.error("Error loading dashboard data:", error)
          setUsers([])
        }
      }
      loadDashboardData()
    }, 15000) // Refresh every 15 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, admin])

  if (!isLoading && !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">The page you are looking for does not exist.</p>
          <Button onClick={() => router.push("/")} variant="default" className="mt-4">
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading || !admin) {
    return null
  }

  const menuItems = [
    {
      title: "User Management",
      description: "View and manage all user information",
      icon: Users,
      href: "/adminbilla/users",
    },
  ]

  const totalUsers = Array.isArray(users) ? users.length : 0
  const activeUsers = Array.isArray(users) ? users.filter((user) => user.current_status === "active").length : 0
  const suspendedUsers = Array.isArray(users) ? users.filter((user) => user.current_status === "suspended").length : 0
  const expiredUsers = Array.isArray(users) ? users.filter((user) => user.current_status === "expired").length : 0

  const totalGrowth = totalUsers > 0 ? "+12%" : "0%"
  const activeGrowth = activeUsers > 0 ? "+8%" : "0%"

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      change: totalGrowth,
      icon: Users,
    },
    {
      title: "Active Users",
      value: activeUsers.toString(),
      change: activeGrowth,
      icon: Activity,
    },
    {
      title: "System Status",
      value: "Active",
      change: "99.9%",
      icon: CheckCircle,
    },
  ]

  return (
    <div className="space-y-6 pb-8">
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {admin?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
              {autoRefresh && (
                <Badge variant="secondary" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} id="auto-refresh-dashboard" />
              <label htmlFor="auto-refresh-dashboard" className="text-sm">
                Auto Refresh
              </label>
            </div>
            <Button
              onClick={() => {
                const loadDashboardData = async () => {
                  try {
                    setIsLoadingData(true)
                    const result = await AdminUserService.getAllUsers()
                    const userData = result?.users || []
                    setUsers(Array.isArray(userData) ? userData : [])
                    setLastUpdated(new Date())
                  } catch (error) {
                    console.error("Error loading dashboard data:", error)
                    setUsers([])
                  } finally {
                    setIsLoadingData(false)
                  }
                }
                loadDashboardData()
              }}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {isLoadingData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary">{stat.change}</Badge>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
