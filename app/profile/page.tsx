"use client"

import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Calendar,
  Shield,
  LogOut,
  Clock,
  Key,
  Globe,
  CheckCircle,
  Crown,
  Heart,
  Lock,
  Mail,
  ShoppingBag,
} from "lucide-react"
import { UserIPDisplay } from "@/components/user-ip-display"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ChangePasswordModal from "@/components/change-password-modal"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [deviceCount, setDeviceCount] = useState<number>(0)
  const [isLoadingDevices, setIsLoadingDevices] = useState(true)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Load device count
  useEffect(() => {
    const loadDeviceCount = async () => {
      try {
        setIsLoadingDevices(true)
        const response = await fetch("/api/user/device-count")
        if (response.ok) {
          const data = await response.json()
          setDeviceCount(data.data.device_count || 0)
        }
      } catch (error) {
        console.error("Error loading device count:", error)
      } finally {
        setIsLoadingDevices(false)
      }
    }

    if (user) {
      loadDeviceCount()
    }
  }, [user])

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Unknown"

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error("Date formatting error:", error)
      return "Unknown"
    }
  }

  const getExpirationInfo = () => {
    if (!user?.expiration_date) {
      return {
        hasExpiration: false,
        daysRemaining: null,
        isExpired: false,
        expirationDate: null,
      }
    }

    try {
      const expirationDate = new Date(user.expiration_date)
      const now = new Date()
      const timeDiff = expirationDate.getTime() - now.getTime()
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))
      const isExpired = daysRemaining <= 0

      return {
        hasExpiration: true,
        daysRemaining: daysRemaining,
        isExpired: isExpired,
        expirationDate: expirationDate,
      }
    } catch (error) {
      console.error("Expiration date parsing error:", error)
      return {
        hasExpiration: false,
        daysRemaining: null,
        isExpired: false,
        expirationDate: null,
      }
    }
  }

  const expirationInfo = getExpirationInfo()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
          <div className="space-y-4 sm:space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
              <div className="relative glass-card p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-xl">
                        {user?.full_name?.charAt(0) || "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-white dark:border-slate-900">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center sm:text-left">
                        {user?.full_name || "User"}
                      </h1>
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mt-3">
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          <Shield className="w-3 h-3 mr-1" />
                          Active Account
                        </Badge>
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium User
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => setIsChangePasswordModalOpen(true)}
                      className="bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all duration-300 w-full sm:w-auto"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all duration-300 w-full sm:w-auto"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="glass-card border-0 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                      <p className="text-2xl font-bold text-green-600">Active</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                          : "Unknown"}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="glass-card border-0 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => router.push("/dashboard/orders")}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">My Orders</p>
                      <p className="text-2xl font-bold text-blue-600 group-hover:text-blue-700">View All</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Personal Information */}
              <Card className="glass-card border-0 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    Personal Information
                  </CardTitle>
                  <CardDescription>Your account's main information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 gap-1 sm:gap-0">
                      <span className="text-sm font-medium text-muted-foreground">Full Name</span>
                      <span className="font-semibold">{user?.full_name || "Not provided"}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 gap-1 sm:gap-0">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </span>
                      <span className="font-semibold">{user?.email || "Not provided"}</span>
                    </div>
                    {user?.telegram_username && !user?.telegram_username.includes("@") && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 gap-1 sm:gap-0">
                        <span className="text-sm font-medium text-muted-foreground">Telegram Username</span>
                        <span className="font-semibold">@{user.telegram_username}</span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 gap-1 sm:gap-0">
                      <span className="text-sm font-medium text-muted-foreground">Account Created</span>
                      <span className="font-semibold">{formatDate(user?.created_at)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 gap-1 sm:gap-0">
                      <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                      <span className="font-semibold">{formatDate(user?.updated_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Expiration */}
              <Card className="glass-card border-0 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    Account Expiration
                  </CardTitle>
                  <CardDescription>Your account validity information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {expirationInfo.hasExpiration ? (
                    <div className="space-y-4">
                      <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                        <div className="text-4xl font-bold text-orange-600 mb-2">{expirationInfo.daysRemaining}</div>
                        <div className="text-sm text-muted-foreground">Days Remaining</div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 gap-1 sm:gap-0">
                          <span className="text-sm font-medium text-muted-foreground">Expiration Date</span>
                          <span className="font-semibold">
                            {expirationInfo.expirationDate?.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 gap-1 sm:gap-0">
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                          <Badge
                            variant={
                              expirationInfo.isExpired
                                ? "destructive"
                                : expirationInfo.daysRemaining! <= 7
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {expirationInfo.isExpired
                              ? "Expired"
                              : expirationInfo.daysRemaining! <= 7
                                ? "Expiring Soon"
                                : "Active"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="text-lg font-semibold text-green-600 mb-2">No Expiration</div>
                      <div className="text-sm text-muted-foreground">Your account has no expiration date</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Access System */}
              <Card className="glass-card border-0 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    Access System
                  </CardTitle>
                  <CardDescription>Your account access and permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">Account Status</div>
                      <div className="text-sm font-semibold text-green-600">Active</div>
                    </div>

                    <div className="p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                        <Crown className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">Account Type</div>
                      <div className="text-sm font-semibold text-blue-600">Premium</div>
                    </div>

                    <div className="p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">Account Duration</div>
                      <div className="text-sm font-semibold text-orange-600">Lifetime</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* IP Information */}
            <Card className="glass-card border-0 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Network Information
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Your current IP address and device information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <UserIPDisplay />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} />
    </ProtectedRoute>
  )
}
