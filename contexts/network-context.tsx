"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNetworkStatus } from '@/hooks/use-network-status'

interface NetworkContextType {
  isOnline: boolean
  wasOffline: boolean
  isReconnecting: boolean
  retryConnection: () => void
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, wasOffline, isReconnecting } = useNetworkStatus()
  const [retryCount, setRetryCount] = useState(0)

  const retryConnection = () => {
    setRetryCount(prev => prev + 1)
    // Force a page reload to retry connection
    window.location.reload()
  }

  return (
    <NetworkContext.Provider value={{ isOnline, wasOffline, isReconnecting, retryConnection }}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}
