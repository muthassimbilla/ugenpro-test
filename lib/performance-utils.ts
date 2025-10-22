"use client"

import { useEffect, useRef, useState } from 'react'

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Mark performance points
  mark(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name)
    }
  }

  // Measure performance between marks
  measure(name: string, startMark: string, endMark: string): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        performance.measure(name, startMark, endMark)
        const measure = performance.getEntriesByName(name, 'measure')[0]
        const duration = measure.duration
        this.metrics.set(name, duration)
        return duration
      } catch (error) {
        console.warn(`Performance measure failed: ${name}`, error)
        return 0
      }
    }
    return 0
  }

  // Get all metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear()
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.clearMarks()
      performance.clearMeasures()
    }
  }
}

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const startTime = useRef<number>(0)

  useEffect(() => {
    startTime.current = performance.now()
    const monitor = PerformanceMonitor.getInstance()
    monitor.mark(`${componentName}-start`)

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime.current
      monitor.mark(`${componentName}-end`)
      monitor.measure(`${componentName}-duration`, `${componentName}-start`, `${componentName}-end`)
      
      console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`)
    }
  }, [componentName])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return { isLoaded }
}

// Hook for intersection observer (lazy loading)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options, hasIntersected])

  return { ref, isIntersecting, hasIntersected }
}

// Hook for lazy loading components
export function useLazyLoad<T>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  deps: any[] = []
) {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadComponent = async () => {
    if (Component || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const module = await importFn()
      setComponent(() => module.default)
    } catch (err) {
      setError(err as Error)
      console.error('Lazy load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadComponent()
  }, deps)

  return { Component, isLoading, error, reload: loadComponent }
}

// Debounce hook for performance
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook for performance
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef<number>(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

// Memory usage monitoring
export function useMemoryUsage() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000)

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Bundle size analyzer
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return null

  const scripts = Array.from(document.querySelectorAll('script[src]'))
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
  
  const scriptSizes = scripts.map(script => {
    const src = script.getAttribute('src')
    return { type: 'script', src, size: 'unknown' }
  })

  const styleSizes = styles.map(style => {
    const href = style.getAttribute('href')
    return { type: 'style', href, size: 'unknown' }
  })

  return {
    scripts: scriptSizes,
    styles: styleSizes,
    total: scriptSizes.length + styleSizes.length
  }
}

// Performance budget checker
export function checkPerformanceBudget() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  
  if (!navigation) return null

  const metrics = {
    // Core Web Vitals
    FCP: 0, // First Contentful Paint
    LCP: 0, // Largest Contentful Paint
    FID: 0, // First Input Delay
    CLS: 0, // Cumulative Layout Shift
    TTFB: navigation.responseStart - navigation.requestStart, // Time to First Byte
    
    // Additional metrics
    DOMContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
    LoadComplete: navigation.loadEventEnd - navigation.navigationStart,
    ResourceLoadTime: navigation.loadEventEnd - navigation.responseEnd
  }

  // Performance budgets (in milliseconds)
  const budgets = {
    TTFB: 600,
    FCP: 1800,
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    DOMContentLoaded: 2000,
    LoadComplete: 3000
  }

  const violations = Object.entries(metrics).filter(([key, value]) => {
    const budget = budgets[key as keyof typeof budgets]
    return budget && value > budget
  })

  return {
    metrics,
    budgets,
    violations,
    score: Math.max(0, 100 - (violations.length * 20))
  }
}

// Export performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance()
