"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Monitor, Smartphone, Tablet, X, AlertTriangle } from "lucide-react"
import { AdminSessionService, UserSession } from "@/lib/admin-session-service"
import { toast } from "@/hooks/use-toast"

interface UserSessionsModalProps {
  userId: string
  userName: string
  isOpen: boolean
  onClose: () => void
}

export default function UserSessionsModal({ 
  userId, 
  userName, 
  isOpen, 
  onClose 
}: UserSessionsModalProps) {
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(false)
  const [terminating, setTerminating] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && userId) {
      loadSessions()
    }
  }, [isOpen, userId])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const userSessions = await AdminSessionService.getUserSessions(userId)
      setSessions(userSessions)
    } catch (error: any) {
      console.error('Error loading sessions:', error)
      toast({
        title: "Error",
        description: "সেশন লোড করতে সমস্যা হয়েছে",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    setTerminating(sessionId)
    try {
      await AdminSessionService.terminateSession(sessionId)
      toast({
        title: "Success",
        description: "সেশন সফলভাবে বন্ধ করা হয়েছে",
        variant: "default"
      })
      // Reload sessions
      await loadSessions()
    } catch (error: any) {
      console.error('Error terminating session:', error)
      toast({
        title: "Error",
        description: "সেশন বন্ধ করতে সমস্যা হয়েছে",
        variant: "destructive"
      })
    } finally {
      setTerminating(null)
    }
  }

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.toLowerCase().includes('mobile')) {
      return <Smartphone className="h-4 w-4" />
    } else if (userAgent.toLowerCase().includes('tablet')) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const getDeviceType = (userAgent: string) => {
    if (userAgent.toLowerCase().includes('mobile')) {
      return 'Mobile'
    } else if (userAgent.toLowerCase().includes('tablet')) {
      return 'Tablet'
    }
    return 'Desktop'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
        <div className="flex flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {userName} এর Active Sessions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              এই ইউজারের সব সক্রিয় সেশন দেখুন এবং পরিচালনা করুন
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">সেশন লোড হচ্ছে...</span>
            </div>
          ) : sessions.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                এই ইউজারের কোনো সক্রিয় সেশন নেই।
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const sessionInfo = AdminSessionService.formatSessionInfo(session)
                return (
                  <div key={session.id} className="border-l-4 border-l-blue-500 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(sessionInfo.userAgent)}
                            <Badge variant="secondary">
                              {getDeviceType(sessionInfo.userAgent)}
                            </Badge>
                            <Badge variant={sessionInfo.isActive ? "default" : "destructive"}>
                              {sessionInfo.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">IP Address:</span>
                              <p className="font-mono">{sessionInfo.ipAddress}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">User Agent:</span>
                              <p className="text-xs break-all">{sessionInfo.userAgent}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">সেশন শুরু:</span>
                              <p>{sessionInfo.createdAt}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">শেষ অ্যাক্সেস:</span>
                              <p>{sessionInfo.lastAccessed}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">মেয়াদ শেষ:</span>
                              <p>{sessionInfo.expiresAt}</p>
                            </div>
                          </div>
                        </div>
                        
                        {sessionInfo.isActive && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleTerminateSession(session.id)}
                            disabled={terminating === session.id}
                          >
                            {terminating === session.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "সেশন বন্ধ করুন"
                            )}
                          </Button>
                        )}
                      </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
