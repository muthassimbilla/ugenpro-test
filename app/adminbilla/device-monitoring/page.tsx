"use client"

import { useEffect, useState } from "react"
import { useAdminAuth } from "@/lib/admin-auth-context"
import {
  Smartphone,
  Monitor,
  Globe,
  AlertTriangle,
  Users,
  Activity,
  MapPin,
  Clock,
  Ban,
  CheckCircle,
  LogOut,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

interface UserDevice {
  user_id: string
  full_name: string
  telegram_username: string
  device_fingerprint: string
  device_name?: string
  browser_info?: string
  os_info?: string
  first_seen: string
  last_seen: string
  total_logins: number
  is_trusted: boolean
  is_blocked: boolean
  active_sessions: number
  last_session_activity?: string
  current_ips: string[]
  ip_history: Array<{
    ip_address: string
    country?: string
    city?: string
    isp?: string
    first_seen: string
    last_seen: string
    is_current: boolean
  }>
}

interface IPStats {
  overview: {
    total_users: number
    active_sessions: number
    total_devices: number
    unique_ips: number
    multi_device_users: number
  }
  recent_ip_changes: Array<{
    user_id: string
    ip_address: string
    logout_reason: string
    created_at: string
    users: {
      full_name: string
      telegram_username: string
    }
  }>
  top_countries: Array<{
    country: string
    count: number
  }>
  last_updated: string
}

export default function DeviceMonitoringPage() {
  const { admin } = useAdminAuth()
  const { toast } = useToast()

  const [devices, setDevices] = useState<UserDevice[]>([])
  const [stats, setStats] = useState<IPStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    if (admin) {
      loadData()
    }
  }, [admin])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !admin) return

    const interval = setInterval(() => {
      loadData()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, admin])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Any cleanup if needed
    }
  }, [])

  const loadData = async (showToast = false) => {
    try {
      setLoading(true)

      // Load device data - Get all devices at once
      const devicesResponse = await fetch("/api/admin/all-devices", {
        headers: {
          Authorization: `Bearer ${admin?.id || "admin-token"}`,
        },
      })

      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json()
        setDevices(devicesData.data || [])
        setLastUpdated(new Date())

        if (showToast) {
          toast({
            title: "Data Updated",
            description: "Device monitoring data has been refreshed",
          })
        }
      } else {
        console.error("Failed to load devices:", devicesResponse.status)
        if (showToast) {
          toast({
            title: "Error",
            description: "Failed to load device data",
            variant: "destructive",
          })
        }
      }

      // Load IP stats
      const statsResponse = await fetch("/api/admin/ip-stats", {
        headers: {
          Authorization: `Bearer ${admin?.id || "admin-token"}`,
        },
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data)
      } else {
        console.error("Failed to load stats:", statsResponse.status)
        if (showToast) {
          toast({
            title: "Error",
            description: "Failed to load statistics",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error loading device monitoring data:", error)
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeviceAction = async (action: string, userId: string, deviceFingerprint?: string) => {
    try {
      const response = await fetch("/api/admin/user-devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${admin?.id || "admin-token"}`,
        },
        body: JSON.stringify({
          action,
          user_id: userId,
          device_fingerprint: deviceFingerprint,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        await loadData() // Reload data
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete operation",
        variant: "destructive",
      })
    }
  }

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.telegram_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.current_ips.some((ip) => ip.includes(searchTerm))

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && device.active_sessions > 0) ||
      (filterStatus === "blocked" && device.is_blocked) ||
      (filterStatus === "multiple" && device.active_sessions > 1)

    const matchesUser = !selectedUser || device.user_id === selectedUser

    return matchesSearch && matchesFilter && matchesUser
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Device Monitoring</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card p-4 rounded-2xl border-2 border-indigo-200/50 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Device Monitoring
            </h1>
            <p className="text-muted-foreground">Track user devices and IP addresses</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
              {autoRefresh && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} id="auto-refresh" />
              <label htmlFor="auto-refresh" className="text-sm text-muted-foreground">
                Auto Refresh
              </label>
            </div>
            <Button
              onClick={() => loadData(true)}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-0 hover:from-indigo-600 hover:to-blue-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Card className="border-2 border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.overview.total_users}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200/50 dark:border-green-800/50 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {stats.overview.active_sessions}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.overview.total_devices}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Devices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.overview.unique_ips}</p>
                  <p className="text-xs text-muted-foreground">Unique IPs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200/50 dark:border-red-800/50 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {stats.overview.multi_device_users}
                  </p>
                  <p className="text-xs text-muted-foreground">Multi-Device Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent IP Changes Alert */}
      {stats && stats.recent_ip_changes.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Recent IP Changes:</strong> {stats.recent_ip_changes.length} auto-logouts due to IP changes in the
            last 24 hours.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by user name, username or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="active">Active Sessions</SelectItem>
                <SelectItem value="blocked">Blocked Devices</SelectItem>
                <SelectItem value="multiple">Multi Sessions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Device List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDevices.map((device) => (
          <Card key={`${device.user_id}-${device.device_fingerprint}`} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {device.device_name?.includes("iPhone") || device.device_name?.includes("iPad") ? (
                      <Smartphone className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Monitor className="w-5 h-5 text-gray-600" />
                    )}
                    {device.full_name}
                    <Badge variant="outline">@{device.telegram_username}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {device.device_name} • {device.browser_info} • {device.os_info}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {device.is_blocked ? (
                    <Badge variant="destructive">
                      <Ban className="w-3 h-3 mr-1" />
                      Blocked
                    </Badge>
                  ) : device.active_sessions > 0 ? (
                    <Badge variant="default">
                      <Activity className="w-3 h-3 mr-1" />
                      Active ({device.active_sessions})
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Device Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">First Seen</p>
                  <p>{formatDate(device.first_seen)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Last Seen</p>
                  <p>{formatDate(device.last_seen)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Total Logins</p>
                  <p>{device.total_logins} times</p>
                </div>
              </div>

              {/* Current IPs */}
              {device.current_ips.length > 0 && (
                <div>
                  <p className="font-medium text-muted-foreground mb-2">Current IP</p>
                  <div className="flex flex-wrap gap-2">
                    {device.current_ips.map((ip, index) => (
                      <Badge key={index} variant="outline" className="font-mono">
                        <Globe className="w-3 h-3 mr-1" />
                        {ip}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* IP History */}
              {device.ip_history.length > 0 && (
                <div>
                  <p className="font-medium text-muted-foreground mb-2">IP History</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {device.ip_history.slice(0, 5).map((ip, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <code className="font-mono">{ip.ip_address}</code>
                          {ip.is_current && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {ip.country && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {ip.city ? `${ip.city}, ${ip.country}` : ip.country}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(ip.last_seen)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {!device.is_blocked ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeviceAction("block_device", device.user_id, device.device_fingerprint)}
                  >
                    <Ban className="w-4 h-4 mr-1" />
                    Block Device
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeviceAction("unblock_device", device.user_id, device.device_fingerprint)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Unblock
                  </Button>
                )}

                {device.active_sessions > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeviceAction("logout_user_all_devices", device.user_id)}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout All Devices
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No devices found</p>
          </CardContent>
        </Card>
      )}

      {/* Top Countries */}
      {stats && stats.top_countries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.top_countries.map((country, index) => (
                <div key={index} className="text-center">
                  <p className="font-medium">{country.country}</p>
                  <p className="text-2xl font-bold text-primary">{country.count}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
