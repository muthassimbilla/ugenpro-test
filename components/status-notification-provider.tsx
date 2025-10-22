"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { AccountStatusNotification } from "./account-status-notification"
import type { UserStatus } from "@/lib/user-status-service"

interface StatusNotificationContextType {
  showNotification: (status: UserStatus) => void
  hideNotification: () => void
}

const StatusNotificationContext = createContext<StatusNotificationContextType | undefined>(undefined)

export function StatusNotificationProvider({ children }: { children: ReactNode }) {
  const [currentStatus, setCurrentStatus] = useState<UserStatus | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const showNotification = useCallback((status: UserStatus) => {
    setCurrentStatus(status)
    setIsVisible(true)
  }, [])

  const hideNotification = useCallback(() => {
    setIsVisible(false)
    setCurrentStatus(null)
  }, [])

  const handleLogout = useCallback(() => {
    // Logout and redirect to block page
    if (currentStatus && typeof window !== "undefined") {
      const params = new URLSearchParams({
        type: currentStatus.status,
        message: currentStatus.message,
      })
      window.location.href = `/account-blocked?${params.toString()}`
    }
  }, [currentStatus])

  return (
    <StatusNotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {isVisible && currentStatus && currentStatus.status !== "expired" && (
        <AccountStatusNotification status={currentStatus} onClose={hideNotification} onLogout={handleLogout} />
      )}
    </StatusNotificationContext.Provider>
  )
}

export function useStatusNotification() {
  const context = useContext(StatusNotificationContext)
  if (context === undefined) {
    throw new Error("useStatusNotification must be used within a StatusNotificationProvider")
  }
  return context
}
