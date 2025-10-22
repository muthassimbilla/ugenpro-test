"use client"
import { useState, useEffect } from "react"

interface CounterAnimationProps {
  target: number
  duration?: number
  suffix?: string
  className?: string
}

export default function CounterAnimation({
  target,
  duration = 2000,
  suffix = "",
  className = "",
}: CounterAnimationProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(easeOutQuart * target)
      
      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    // Start animation after a small delay
    const timeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate)
    }, 500)

    return () => {
      clearTimeout(timeout)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [target, duration])

  return (
    <span className={className}>
      {count}{suffix}
    </span>
  )
}
