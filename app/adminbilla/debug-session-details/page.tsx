"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, AlertTriangle, Monitor, Smartphone, Tablet } from "lucide-react"

interface SessionDebugInfo {
  userId: string
  profile: {
    full_name: string
    email: string
  } | null
  sessionsCount: number
  sessions: Array<{
    id: string
    user_id: string
    session_token: string
    ip_address: string | null
    user_agent: string | null
    is_active: boolean
    expires_at: string
    created_at: string
    last_accessed: string | null
    logout_reason: string | null
  }>
  rawSessions: any[]
}

export default function DebugSessionDetailsPage() {
  const [userId, setUserId] = useState("")
  const [debugInfo, setDebugInfo] = useState<SessionDebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSessionDetails = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID")
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/debug/session-details?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setDebugInfo(data.debug)
      } else {
        setError(data.error || 'Failed to fetch session details')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />
    if (userAgent.toLowerCase().includes('mobile')) {
      return <Smartphone className="h-4 w-4" />
    } else if (userAgent.toLowerCase().includes('tablet')) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const getDeviceType = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown'
    if (userAgent.toLowerCase().includes('mobile')) {
      return 'Mobile'
    } else if (userAgent.toLowerCase().includes('tablet')) {
      return 'Tablet'
    }
    return 'Desktop'
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Debug Session Details</h1>
        <p className="text-muted-foreground">Check specific user's session data and IP addresses</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search User Sessions</CardTitle>
          <CardDescription>Enter a user ID to check their session details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Enter user ID (UUID)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchSessionDetails} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {debugInfo && (
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>User ID</Label>
                  <p className="font-mono text-sm">{debugInfo.userId}</p>
                </div>
                <div>
                  <Label>Full Name</Label>
                  <p>{debugInfo.profile?.full_name || "N/A"}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p>{debugInfo.profile?.email || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Sessions Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {debugInfo.sessionsCount} Active Sessions
                </Badge>
                {debugInfo.sessionsCount === 0 && (
                  <Alert variant="destructive" className="flex-1">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>No active sessions found for this user</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Session Details */}
          {debugInfo.sessions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Session Details</h3>
              {debugInfo.sessions.map((session, index) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getDeviceIcon(session.user_agent)}
                      Session {index + 1}
                      <Badge variant={session.is_active ? "default" : "secondary"}>
                        {session.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <Label>IP Address</Label>
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            <code className="text-sm">
                              {session.ip_address || "NULL/EMPTY"}
                            </code>
                          </div>
                          {!session.ip_address && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>IP address is null or empty in database</AlertDescription>
                            </Alert>
                          )}
                        </div>
                        <div>
                          <Label>User Agent</Label>
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            <code className="text-xs break-all">
                              {session.user_agent || "NULL/EMPTY"}
                            </code>
                          </div>
                        </div>
                        <div>
                          <Label>Device Type</Label>
                          <Badge variant="secondary">
                            {getDeviceType(session.user_agent)}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label>Session Token</Label>
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            <code className="text-xs">
                              {session.session_token}
                            </code>
                          </div>
                        </div>
                        <div>
                          <Label>Created At</Label>
                          <p className="text-sm">
                            {new Date(session.created_at).toLocaleString('bn-BD')}
                          </p>
                        </div>
                        <div>
                          <Label>Expires At</Label>
                          <p className="text-sm">
                            {new Date(session.expires_at).toLocaleString('bn-BD')}
                          </p>
                        </div>
                        <div>
                          <Label>Last Accessed</Label>
                          <p className="text-sm">
                            {session.last_accessed 
                              ? new Date(session.last_accessed).toLocaleString('bn-BD')
                              : "Never"
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Raw Data */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Database Data</CardTitle>
              <CardDescription>Complete session data from database</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(debugInfo.rawSessions, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
