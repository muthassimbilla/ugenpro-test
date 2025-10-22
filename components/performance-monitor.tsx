"use client"

import { useEffect, useState, useCallback } from "react"

interface PerformanceMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  loadTime?: number // Page Load Time
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
  enableLogging?: boolean
}

export function PerformanceMonitor({ 
  onMetricsUpdate, 
  enableLogging = false 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})

  const logMetric = useCallback((name: string, value: number) => {
    if (enableLogging) {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`)
    }
  }, [enableLogging])

  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => {
      const updated = { ...prev, ...newMetrics }
      onMetricsUpdate?.(updated)
      return updated
    })
  }, [onMetricsUpdate])

  useEffect(() => {
    // Measure page load time
    const measureLoadTime = () => {
      if (typeof window !== "undefined" && window.performance) {
        const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart
          updateMetrics({ loadTime })
          logMetric('Page Load Time', loadTime)
        }
      }
    }

    // Measure Core Web Vitals
    const measureWebVitals = () => {
      if (typeof window !== "undefined" && 'PerformanceObserver' in window) {
        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcp = entries[entries.length - 1]?.startTime
          if (fcp) {
            updateMetrics({ fcp })
            logMetric('First Contentful Paint', fcp)
          }
        })
        fcpObserver.observe({ entryTypes: ['paint'] })

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lcp = entries[entries.length - 1]?.startTime
          if (lcp) {
            updateMetrics({ lcp })
            logMetric('Largest Contentful Paint', lcp)
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            const fid = entry.processingStart - entry.startTime
            updateMetrics({ fid })
            logMetric('First Input Delay', fid)
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              updateMetrics({ cls: clsValue })
              logMetric('Cumulative Layout Shift', clsValue)
            }
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // Time to First Byte
        const ttfbObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const ttfb = entries[0]?.responseStart - entries[0]?.requestStart
          if (ttfb) {
            updateMetrics({ ttfb })
            logMetric('Time to First Byte', ttfb)
          }
        })
        ttfbObserver.observe({ entryTypes: ['navigation'] })

        // Cleanup observers
        return () => {
          fcpObserver.disconnect()
          lcpObserver.disconnect()
          fidObserver.disconnect()
          clsObserver.disconnect()
          ttfbObserver.disconnect()
        }
      }
    }

    // Measure performance after page load
    if (document.readyState === 'complete') {
      measureLoadTime()
      const cleanup = measureWebVitals()
      return cleanup
    } else {
      window.addEventListener('load', () => {
        measureLoadTime()
        measureWebVitals()
      })
    }
  }, [updateMetrics, logMetric])

  // Performance optimization suggestions
  const getPerformanceScore = useCallback(() => {
    const { fcp, lcp, fid, cls } = metrics
    
    let score = 100
    
    // FCP scoring (Good: <1.8s, Needs Improvement: 1.8-3s, Poor: >3s)
    if (fcp) {
      if (fcp > 3000) score -= 30
      else if (fcp > 1800) score -= 15
    }
    
    // LCP scoring (Good: <2.5s, Needs Improvement: 2.5-4s, Poor: >4s)
    if (lcp) {
      if (lcp > 4000) score -= 30
      else if (lcp > 2500) score -= 15
    }
    
    // FID scoring (Good: <100ms, Needs Improvement: 100-300ms, Poor: >300ms)
    if (fid) {
      if (fid > 300) score -= 20
      else if (fid > 100) score -= 10
    }
    
    // CLS scoring (Good: <0.1, Needs Improvement: 0.1-0.25, Poor: >0.25)
    if (cls) {
      if (cls > 0.25) score -= 20
      else if (cls > 0.1) score -= 10
    }
    
    return Math.max(0, score)
  }, [metrics])

  const getPerformanceGrade = useCallback(() => {
    const score = getPerformanceScore()
    if (score >= 90) return { grade: 'A', color: 'text-green-500' }
    if (score >= 80) return { grade: 'B', color: 'text-yellow-500' }
    if (score >= 70) return { grade: 'C', color: 'text-orange-500' }
    return { grade: 'D', color: 'text-red-500' }
  }, [getPerformanceScore])

  return {
    metrics,
    score: getPerformanceScore(),
    grade: getPerformanceGrade(),
  }
}

// Hook for using performance metrics
export function usePerformanceMetrics(enableLogging = false) {
  return PerformanceMonitor({ enableLogging })
}

// Performance optimization utilities
export const performanceUtils = {
  // Preload critical resources
  preloadResource: (href: string, as: string) => {
    if (typeof window !== "undefined") {
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = href
      link.as = as
      document.head.appendChild(link)
    }
  },

  // Defer non-critical JavaScript
  deferScript: (src: string) => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script")
      script.src = src
      script.defer = true
      document.head.appendChild(script)
    }
  },

  // Optimize images
  optimizeImage: (src: string, width: number, height: number) => {
    // Add image optimization parameters
    const url = new URL(src, window.location.origin)
    url.searchParams.set('w', width.toString())
    url.searchParams.set('h', height.toString())
    url.searchParams.set('q', '85')
    url.searchParams.set('f', 'webp')
    return url.toString()
  },

  // Lazy load components
  lazyLoadComponent: (importFn: () => Promise<any>) => {
    return importFn().then(module => module.default)
  }
}
