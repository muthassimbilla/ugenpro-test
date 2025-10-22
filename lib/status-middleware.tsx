"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { UserStatusService } from "./user-status-service"
import type { UserStatus } from "./user-status-service"

// Status middleware hook
export function useStatusMiddleware(userId: string | null, onStatusInvalid?: (status: UserStatus) => void) {
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!userId) {
      // Cleanup if no user ID
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
      return
    }

    console.log("[v0] Starting status monitoring for user:", userId)

    // Start status monitoring
    const startMonitoring = async () => {
      try {
        const cleanup = await UserStatusService.startStatusMonitoring(
          userId,
          (status) => {
            console.log("[v0] Status update:", status)

            // If status is invalid
            if (!status.is_valid && onStatusInvalid) {
              onStatusInvalid(status)
            }
          },
          30000, // 30 second interval
        )

        cleanupRef.current = cleanup
      } catch (error) {
        console.error("[v0] Failed to start status monitoring:", error)
      }
    }

    startMonitoring()

    // Add custom event listener
    const handleStatusInvalid = (event: CustomEvent) => {
      console.log("[v0] Received status invalid event:", event.detail)
      if (onStatusInvalid) {
        onStatusInvalid(event.detail)
      }
    }

    window.addEventListener("user-status-invalid", handleStatusInvalid as EventListener)

    // Cleanup
    return () => {
      console.log("[v0] Cleaning up status monitoring")

      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }

      window.removeEventListener("user-status-invalid", handleStatusInvalid as EventListener)
    }
  }, [userId, onStatusInvalid])

  // Manual status check function
  const checkStatus = async (): Promise<UserStatus | null> => {
    if (!userId) return null

    try {
      return await UserStatusService.checkUserStatus(userId)
    } catch (error) {
      console.error("[v0] Manual status check failed:", error)
      return {
        is_valid: false,
        status: "inactive",
        message: "Unable to verify account status.",
      }
    }
  }

  return { checkStatus }
}

// Page level status guard component
export function StatusGuard({
  children,
  userId,
  onStatusInvalid,
}: {
  children: React.ReactNode
  userId: string | null
  onStatusInvalid?: (status: UserStatus) => void
}) {
  useStatusMiddleware(userId, onStatusInvalid)

  return <>{children}</>
}
