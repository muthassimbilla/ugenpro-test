"use client"

import { useIntersectionObserver } from '@/lib/performance-utils'
import { cn } from '@/lib/utils'
import { ReactNode, useRef } from 'react'

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
  style?: React.CSSProperties
  onIntersect?: () => void
  once?: boolean
}

export function LazyWrapper({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  className,
  style,
  onIntersect,
  once = true
}: LazyWrapperProps) {
  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold,
    rootMargin
  })

  const shouldRender = once ? hasIntersected : isIntersecting

  const handleIntersect = () => {
    if (onIntersect && isIntersecting) {
      onIntersect()
    }
  }

  return (
    <div
      ref={ref}
      className={cn('w-full', className)}
      style={style}
      onLoad={handleIntersect}
    >
      {shouldRender ? children : (fallback || <LazyFallback />)}
    </div>
  )
}

// Default fallback component
function LazyFallback() {
  return (
    <div className="w-full h-32 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )
}

// Skeleton loader component removed - using LoadingOverlay instead

// Card skeleton removed - using LoadingOverlay instead

// Table skeleton
export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number
  columns?: number
  className?: string 
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      ))}
    </div>
  )
}

// List skeleton
export function ListSkeleton({ 
  items = 5, 
  className 
}: { 
  items?: number
  className?: string 
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
            <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Image skeleton
export function ImageSkeleton({ 
  width = '100%', 
  height = '200px', 
  className 
}: { 
  width?: string | number
  height?: string | number
  className?: string 
}) {
  return (
    <div
      className={cn('bg-gray-200 animate-pulse rounded', className)}
      style={{ width, height }}
    />
  )
}

// Button skeleton
export function ButtonSkeleton({ 
  width = '120px', 
  height = '40px', 
  className 
}: { 
  width?: string | number
  height?: string | number
  className?: string 
}) {
  return (
    <div
      className={cn('bg-gray-200 animate-pulse rounded', className)}
      style={{ width, height }}
    />
  )
}

// Chart skeleton
export function ChartSkeleton({ 
  width = '100%', 
  height = '300px', 
  className 
}: { 
  width?: string | number
  height?: string | number
  className?: string 
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3" />
      <div
        className="bg-gray-200 animate-pulse rounded"
        style={{ width, height }}
      />
      <div className="flex justify-center space-x-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
