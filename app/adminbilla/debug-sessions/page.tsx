"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw, Database, Users, Shield, AlertTriangle } from "lucide-react"

interface DebugInfo {
  timestamp: string
  environment: {
    hasServiceRoleKey: boolean
    hasSupabaseUrl: boolean
    hasAnonKey: boolean
  }
  counts: {
    totalSessions: number
    activeSessions: number
    nonExpiredSessions: number
    validSessions: number
    totalProfiles: number
    totalAdmins: number
  }
  errors: {
    totalError?: string
    activeError?: string
    nonExpiredError?: string
    validError?: string
    sampleError?: string
    profilesError?: string
    adminsError?: string
  }
  sampleSessions: any[]
  admins: any[]
}

export default function DebugSessionsPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugInfo = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/debug/sessions')
      const data = await response.json()
      
      if (data.success) {
        setDebugInfo(data.debug)
      } else {
        setError(data.error || 'Failed to fetch debug info')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  const hasErrors = debugInfo && Object.values(debugInfo.errors).some(error => error)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Debug Sessions</h1>
          <p className="text-muted-foreground">Check why active sessions are not showing</p>
        </div>
        <Button onClick={fetchDebugInfo} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {debugInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Environment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Service Role Key</span>
                <Badge variant={debugInfo.environment.hasServiceRoleKey ? "default" : "destructive"}>
                  {debugInfo.environment.hasServiceRoleKey ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Supabase URL</span>
                <Badge variant={debugInfo.environment.hasSupabaseUrl ? "default" : "destructive"}>
                  {debugInfo.environment.hasSupabaseUrl ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Anon Key</span>
                <Badge variant={debugInfo.environment.hasAnonKey ? "default" : "destructive"}>
                  {debugInfo.environment.hasAnonKey ? "Set" : "Missing"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Session Counts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Session Counts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Total Sessions</span>
                <Badge variant="outline">{debugInfo.counts.totalSessions}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Sessions</span>
                <Badge variant={debugInfo.counts.activeSessions > 0 ? "default" : "secondary"}>
                  {debugInfo.counts.activeSessions}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Non-Expired</span>
                <Badge variant={debugInfo.counts.nonExpiredSessions > 0 ? "default" : "secondary"}>
                  {debugInfo.counts.nonExpiredSessions}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Valid Sessions</span>
                <Badge variant={debugInfo.counts.validSessions > 0 ? "default" : "destructive"}>
                  {debugInfo.counts.validSessions}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Database Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Database Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Total Profiles</span>
                <Badge variant="outline">{debugInfo.counts.totalProfiles}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Admins</span>
                <Badge variant="outline">{debugInfo.counts.totalAdmins}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Has Errors</span>
                <Badge variant={hasErrors ? "destructive" : "default"}>
                  {hasErrors ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Errors */}
      {debugInfo && hasErrors && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Database Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(debugInfo.errors).map(([key, error]) => 
                error && (
                  <div key={key} className="p-2 bg-red-50 border border-red-200 rounded">
                    <strong>{key}:</strong> {error}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Sessions */}
      {debugInfo && debugInfo.sampleSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Sessions</CardTitle>
            <CardDescription>Latest 5 sessions from database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {debugInfo.sampleSessions.map((session, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <strong>ID:</strong> {session.id.substring(0, 8)}...
                    </div>
                    <div>
                      <strong>User:</strong> {session.user_id.substring(0, 8)}...
                    </div>
                    <div>
                      <strong>Active:</strong> {session.is_active ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>Expires:</strong> {new Date(session.expires_at).toLocaleString()}
                    </div>
                    <div>
                      <strong>IP:</strong> {session.ip_address || "N/A"}
                    </div>
                    <div>
                      <strong>Created:</strong> {new Date(session.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admins */}
      {debugInfo && debugInfo.admins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {debugInfo.admins.map((admin, index) => (
                <div key={index} className="p-2 border rounded">
                  <div className="flex items-center justify-between">
                    <span>{admin.username}</span>
                    <Badge variant={admin.is_active ? "default" : "secondary"}>
                      {admin.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {!debugInfo?.environment.hasServiceRoleKey && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file
                </AlertDescription>
              </Alert>
            )}
            {debugInfo?.counts.validSessions === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No valid sessions found. Users need to login to create sessions.
                </AlertDescription>
              </Alert>
            )}
            {debugInfo?.counts.totalAdmins === 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No admin users found. Add yourself to the admins table.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
