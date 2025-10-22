"use client"

import { useState, useEffect } from 'react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return

    // Set initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      console.log('Network: Connection restored')
      setIsReconnecting(true)
      setIsOnline(true)
      setWasOffline(false)
      
      // Auto reload page when connection is restored
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }

    const handleOffline = () => {
      console.log('Network: Connection lost')
      setIsOnline(false)
      setWasOffline(true)
      setIsReconnecting(false)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, wasOffline, isReconnecting }
}
