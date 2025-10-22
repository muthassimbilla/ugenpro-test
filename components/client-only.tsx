"use client"

import { useEffect, useState } from "react"
import LoadingOverlay from "@/components/loading-overlay"

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ClientOnly({ children, fallback }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return (
      <>
        {fallback || <LoadingOverlay message="Loading..." fullScreen />}
      </>
    )
  }

  return <>{children}</>
}
