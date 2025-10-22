"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Users, 
  AlertCircle, 
  Infinity, 
  RefreshCw,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface ApiUsage {
  id: string
  user_id: string
  api_type: string
  usage_date: string
  daily_count: number
  daily_limit: number
  is_unlimited: boolean
  last_used_at: string
  profiles?: {
    full_name: string
    email: string
  }
}


interface TodayUsageStats {
  totalUsers: number
  totalApiCalls: number
  byApiType: {
    address_generator: {
      totalCalls: number
      activeUsers: number
      users: number
    }
    email2name: {
      totalCalls: number
      activeUsers: number
      users: number
    }
  }
  topUsers: Array<{
    user_id: string
    totalCalls: number
    address_generator: number
    email2name: number
  }>
}

export default function ApiLimitsPage() {
  const [usageData, setUsageData] = useState<ApiUsage[]>([])
  const [todayStats, setTodayStats] = useState<TodayUsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStatsLoading, setIsStatsLoading] = useState(true)

  const fetchUsageData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/api-usage-stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsageData(data.usage || [])
        }
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
      toast.error('Failed to fetch usage data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTodayStats = async () => {
    try {
      setIsStatsLoading(true)
      const response = await fetch('/api/admin/today-usage-stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTodayStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Error fetching today stats:', error)
      toast.error('Failed to fetch today stats')
    } finally {
      setIsStatsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsageData()
    fetchTodayStats()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Limits Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user API limits and monitor daily usage
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => { fetchUsageData(); fetchTodayStats(); }}
            variant="outline"
            disabled={isLoading || isStatsLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(isLoading || isStatsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Today's Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Today's API Usage
          </CardTitle>
          <CardDescription>
            Current daily usage by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          {isStatsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="text-muted-foreground">Loading usage statistics...</span>
              </div>
            </div>
          ) : todayStats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {todayStats.totalUsers}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Active Users
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {todayStats.totalApiCalls}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Total API Calls
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {todayStats.byApiType.address_generator.totalCalls}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Address Generator
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {todayStats.byApiType.email2name.totalCalls}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  Email2Name
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No usage data for today
            </div>
          )}
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : usageData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No usage data for today
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>API Type</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageData.map((usage) => (
                    <TableRow key={usage.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {usage.profiles?.full_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {usage.profiles?.email || usage.user_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {usage.api_type === 'address_generator' ? 'Address Gen' : 'Email2Name'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {usage.daily_count} / {usage.is_unlimited ? '∞' : usage.daily_limit}
                        </div>
                      </TableCell>
                      <TableCell>
                        {usage.is_unlimited ? (
                          <Badge className="bg-purple-100 text-purple-700">
                            <Infinity className="w-3 h-3 mr-1" />
                            Unlimited
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {usage.daily_limit} daily
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {usage.is_unlimited ? (
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        ) : usage.daily_count >= usage.daily_limit ? (
                          <Badge className="bg-red-100 text-red-700">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Exceeded
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(usage.last_used_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetUserDailyUsage(usage.user_id, usage.api_type)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reset
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
