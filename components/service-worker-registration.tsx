"use client"

import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return
    
    // Only run in production
    if (process.env.NODE_ENV !== "production") return
    
    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) return
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          })

          console.log("[SW] Service Worker registered successfully:", registration)

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content is available, show update notification
                  if (confirm("New version available! Reload to update?")) {
                    window.location.reload()
                  }
                }
              })
            }
          })

          // Handle controller change
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            window.location.reload()
          })
        } catch (error) {
          console.error("[SW] Service Worker registration failed:", error)
        }
      }

      // Register after a short delay to not block initial page load
      setTimeout(registerSW, 1000)
    }
  }, [])

  return null
}

// Hook for checking service worker status
export function useServiceWorker() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const checkSW = async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            console.log("[SW] Service Worker is active")
            return true
          } else {
            console.log("[SW] No Service Worker found")
            return false
          }
        } catch (error) {
          console.error("[SW] Error checking Service Worker:", error)
          return false
        }
      }

      checkSW()
    }
  }, [])

  return {
    isSupported: typeof window !== "undefined" && "serviceWorker" in navigator,
  }
}
