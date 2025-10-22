"use client"

import { useEffect, useRef, useState } from "react"

interface PerformanceOptimizerProps {
  children: React.ReactNode
  threshold?: number
}

export function PerformanceOptimizer({ children, threshold = 0.1 }: PerformanceOptimizerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Use Intersection Observer to optimize animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add a class to trigger animations when visible
            entry.target.classList.add('animate-in')
          } else {
            // Remove animation class when not visible to save resources
            entry.target.classList.remove('animate-in')
          }
        })
      },
      {
        threshold,
        rootMargin: '50px 0px 50px 0px'
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold])

  return (
    <div ref={ref} className="performance-optimized">
      {children}
    </div>
  )
}

// Hook for optimizing scroll performance
export function useOptimizedScroll() {
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Scroll handling logic here
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
}

// Hook for reducing animation frequency on low-end devices
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

export function useMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}
