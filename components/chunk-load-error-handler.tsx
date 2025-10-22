"use client"

import React, { useEffect } from 'react'

interface ChunkLoadErrorHandlerProps {
  children: React.ReactNode
}

export function ChunkLoadErrorHandler({ children }: ChunkLoadErrorHandlerProps) {
  useEffect(() => {
    // Handle chunk load errors
    const handleChunkLoadError = (event: ErrorEvent) => {
      if (event.message?.includes('Loading chunk') || event.message?.includes('ChunkLoadError')) {
        console.warn('Chunk load error detected, reloading page...')
        // Reload the page to retry loading chunks
        window.location.reload()
      }
    }

    // Handle unhandled promise rejections (common with chunk load errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Loading chunk') || event.reason?.message?.includes('ChunkLoadError')) {
        console.warn('Chunk load error in promise rejection, reloading page...')
        event.preventDefault()
        window.location.reload()
      }
    }

    // Add event listeners
    window.addEventListener('error', handleChunkLoadError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup
    return () => {
      window.removeEventListener('error', handleChunkLoadError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return <>{children}</>
}

export default ChunkLoadErrorHandler
