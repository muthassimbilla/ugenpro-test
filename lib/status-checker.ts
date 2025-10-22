"use client"

import type { UserStatus } from "./user-status-service"

export class StatusChecker {
  private static instance: StatusChecker
  private checkInterval: NodeJS.Timeout | null = null
  private isChecking = false

  static getInstance(): StatusChecker {
    if (!StatusChecker.instance) {
      StatusChecker.instance = new StatusChecker()
    }
    return StatusChecker.instance
  }

  startChecking(intervalMs = 30000): void {
    if (this.checkInterval) {
      console.log("[v0] Status checking already started")
      return
    }

    console.log("[v0] Starting status checking every", intervalMs, "ms")
    
    this.checkInterval = setInterval(async () => {
      if (this.isChecking) {
        console.log("[v0] Status check already in progress, skipping")
        return
      }

      await this.checkStatus()
    }, intervalMs)

    // Initial check
    this.checkStatus()
  }

  stopChecking(): void {
    if (this.checkInterval) {
      console.log("[v0] Stopping status checking")
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  private async checkStatus(): Promise<void> {
    if (this.isChecking) return

    this.isChecking = true

    try {
      console.log("[v0] Checking user status...")
      
      // Check network connectivity first
      if (!navigator.onLine) {
        console.log("[v0] Offline - skipping status check")
        return
      }

      // Try with retry logic
      const status = await this.checkStatusWithRetry()
      
      console.log("[v0] Status check result:", status)

      if (!status.is_valid) {
        console.log("[v0] User status invalid, dispatching event")
        
        // Dispatch custom event for auth context to handle
        window.dispatchEvent(
          new CustomEvent("user-status-invalid", {
            detail: status,
          })
        )
      }

    } catch (error) {
      console.error("[v0] Status check failed:", error)
      
      // Only dispatch error event for authentication-related errors
      // Don't auto-logout for network issues or server errors
      if (error instanceof Error && 
          (error.message?.includes("401") || 
           error.message?.includes("403") || 
           error.message?.includes("auth"))) {
        window.dispatchEvent(
          new CustomEvent("user-status-invalid", {
            detail: {
              is_valid: false,
              status: "inactive",
              message: "Authentication error. Please login again.",
            },
          })
        )
      } else {
        // For network/server errors, just log but don't trigger logout
        console.warn("[v0] Status check failed due to network/server error, not triggering logout")
      }
    } finally {
      this.isChecking = false
    }
  }

  private async checkStatusWithRetry(): Promise<UserStatus> {
    const maxRetries = 3
    const retryDelay = 2000 // 2 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch("/api/user-status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Increased timeout to 30 seconds
          signal: AbortSignal.timeout(30000),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const status: UserStatus = await response.json()
        console.log(`[v0] Status check successful on attempt ${attempt}`)
        return status
        
      } catch (error) {
        console.warn(`[v0] Status check attempt ${attempt} failed:`, error)
        
        if (attempt === maxRetries) {
          throw error
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }
    
    throw new Error("All retry attempts failed")
  }

  // Manual status check
  async checkStatusNow(): Promise<UserStatus | null> {
    try {
      console.log("[v0] Performing manual status check...")
      const response = await fetch("/api/user-status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout for manual checks
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const status: UserStatus = await response.json()
      console.log("[v0] Manual status check result:", status)
      return status
    } catch (error) {
      console.error("[v0] Manual status check failed:", error)
      return null
    }
  }

  // Force immediate status check
  async forceStatusCheck(): Promise<void> {
    console.log("[v0] Force checking status...")
    await this.checkStatus()
  }
}
