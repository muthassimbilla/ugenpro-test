export interface UserSession {
  id: string
  user_id: string
  session_token: string
  ip_address?: string
  user_agent?: string
  expires_at: string
  created_at: string
  last_accessed?: string
  is_active: boolean
  logout_reason?: string
}

export class AdminSessionService {
  static async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      const response = await fetch(`/api/admin/user-sessions?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch user sessions')
      }

      const data = await response.json()
      return data.sessions || []
    } catch (error: any) {
      console.error('[v0] Error fetching user sessions:', error)
      throw error
    }
  }

  static async terminateSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/user-sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to terminate session')
      }

      const data = await response.json()
      console.log('[v0] Session terminated:', data.message)
    } catch (error: any) {
      console.error('[v0] Error terminating session:', error)
      throw error
    }
  }

  static formatSessionInfo(session: UserSession): {
    id: string
    ipAddress: string
    userAgent: string
    createdAt: string
    lastAccessed: string
    expiresAt: string
    isActive: boolean
  } {
    return {
      id: session.id,
      ipAddress: session.ip_address || 'Unknown',
      userAgent: session.user_agent || 'Unknown',
      createdAt: new Date(session.created_at).toLocaleString('bn-BD'),
      lastAccessed: session.last_accessed 
        ? new Date(session.last_accessed).toLocaleString('bn-BD')
        : new Date(session.created_at).toLocaleString('bn-BD'),
      expiresAt: new Date(session.expires_at).toLocaleString('bn-BD'),
      isActive: session.is_active
    }
  }
}
