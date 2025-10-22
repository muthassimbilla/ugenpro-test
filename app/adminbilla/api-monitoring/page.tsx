"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
  Wifi,
  WifiOff
} from "lucide-react"
import { toast } from "sonner"

interface ApiStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  last24Hours: {
    requests: number
    errors: number
    avgResponseTime: number
  }
  apiStatus: 'healthy' | 'error' | 'unknown'
  quotaInfo: {
    used: number
    limit: number
    percentage: number
  }
  recentErrors: Array<{
    timestamp: string
    error: string
    email: string
    requestId: string
  }>
}

interface HealthCheckResult {
  status: string
  message: string
  responseTime: number
  timestamp: string
  apiKeyConfigured: boolean
}

export default function ApiMonitoringPage() {
  const [apiStats, setApiStats] = useState<ApiStats | null>(null)
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchApiStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/api-stats')
      if (response.ok) {
        const data = await response.json()
        setApiStats(data.stats)
      } else {
        toast.error("Failed to fetch API statistics")
      }
    } catch (error) {
      toast.error("Error fetching API statistics")
    } finally {
      setIsLoading(false)
    }
  }

  const checkApiHealth = async () => {
    try {
      const response = await fetch('/api/health/email2name')
      const data = await response.json()
      setHealthStatus(data)
    } catch (error) {
      setHealthStatus({
        status: 'error',
        message: 'Failed to check API health',
        responseTime: 0,
        timestamp: new Date().toISOString(),
        apiKeyConfigured: false
      })
    }
  }

  const refreshAll = async () => {
    await Promise.all([fetchApiStats(), checkApiHealth()])
    setLastUpdated(new Date())
    toast.success("Data refreshed successfully")
  }

  useEffect(() => {
    refreshAll()
    
    // Auto refresh every 30 seconds
    const interval = setInterval(refreshAll, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <Wifi className="h-4 w-4" />
      case 'error': return <WifiOff className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Monitoring</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor Email2Name API performance and usage
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <Button onClick={refreshAll} disabled={isLoading} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health Status</TabsTrigger>
            <TabsTrigger value="errors">Error Logs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* API Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Status</CardTitle>
                  {healthStatus && getStatusIcon(healthStatus.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge className={getStatusColor(healthStatus?.status || 'unknown')}>
                      {healthStatus?.status || 'Unknown'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {healthStatus?.message || 'Checking...'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {apiStats?.totalRequests || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time requests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {apiStats ? 
                      `${Math.round((apiStats.successfulRequests / apiStats.totalRequests) * 100)}%` : 
                      '0%'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {apiStats?.successfulRequests || 0} successful
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {apiStats?.averageResponseTime || 0}ms
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last 24h: {apiStats?.last24Hours.avgResponseTime || 0}ms
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quota Usage */}
            {apiStats?.quotaInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    API Quota Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Used: {apiStats.quotaInfo.used}</span>
                      <span>Limit: {apiStats.quotaInfo.limit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          apiStats.quotaInfo.percentage > 80 ? 'bg-red-500' :
                          apiStats.quotaInfo.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(apiStats.quotaInfo.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {apiStats.quotaInfo.percentage.toFixed(1)}% used
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  API Health Check
                </CardTitle>
                <CardDescription>
                  Current status of the Email2Name API
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(healthStatus.status)}
                        <div>
                          <div className="font-medium">
                            Status: {healthStatus.status}
                          </div>
                          <div className="text-sm text-gray-600">
                            {healthStatus.message}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(healthStatus.status)}>
                        {healthStatus.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Response Time:</span> {healthStatus.responseTime}ms
                      </div>
                      <div>
                        <span className="font-medium">API Key:</span> {healthStatus.apiKeyConfigured ? 'Configured' : 'Missing'}
                      </div>
                      <div>
                        <span className="font-medium">Last Check:</span> {new Date(healthStatus.timestamp).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">API Response:</span> {healthStatus.apiResponse || 'N/A'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No health check data available</p>
                    <Button onClick={checkApiHealth} className="mt-4">
                      Run Health Check
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Errors
                </CardTitle>
                <CardDescription>
                  Latest API errors and issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiStats?.recentErrors && apiStats.recentErrors.length > 0 ? (
                  <div className="space-y-3">
                    {apiStats.recentErrors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-red-800">{error.error}</div>
                            <div className="text-sm text-red-600 mt-1">
                              Email: {error.email} | Request ID: {error.requestId}
                            </div>
                          </div>
                          <div className="text-xs text-red-500 ml-4">
                            {new Date(error.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent errors found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Requests:</span>
                      <span className="font-medium">{apiStats?.totalRequests || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Successful:</span>
                      <span className="font-medium text-green-600">{apiStats?.successfulRequests || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="font-medium text-red-600">{apiStats?.failedRequests || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">
                        {apiStats ? 
                          `${Math.round((apiStats.successfulRequests / apiStats.totalRequests) * 100)}%` : 
                          '0%'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Avg Response Time:</span>
                      <span className="font-medium">{apiStats?.averageResponseTime || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last 24h Requests:</span>
                      <span className="font-medium">{apiStats?.last24Hours.requests || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last 24h Errors:</span>
                      <span className="font-medium text-red-600">{apiStats?.last24Hours.errors || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last 24h Avg Time:</span>
                      <span className="font-medium">{apiStats?.last24Hours.avgResponseTime || 0}ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
