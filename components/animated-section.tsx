"use client"
import { ReactNode } from "react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "fade" | "scale" | "rotate" | "bounce" | "slide-in-left" | "slide-in-right" | "zoom-in" | "flip"
  duration?: number
  threshold?: number
  triggerOnce?: boolean
  distance?: number
  easing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "cubic-bezier"
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 600,
  threshold = 0.1,
  triggerOnce = true,
  distance = 30,
  easing = "ease-out",
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation({
    threshold,
    triggerOnce,
    delay,
  })

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case "up":
          return `translateY(${distance}px)`
        case "down":
          return `translateY(-${distance}px)`
        case "left":
          return `translateX(${distance}px)`
        case "right":
          return `translateX(-${distance}px)`
        case "fade":
          return "translateY(0) translateX(0)"
        case "scale":
          return "scale(0.8)"
        case "rotate":
          return "rotate(-5deg) scale(0.9)"
        case "bounce":
          return `translateY(${distance * 2}px)`
        case "slide-in-left":
          return `translateX(-${distance * 2}px)`
        case "slide-in-right":
          return `translateX(${distance * 2}px)`
        case "zoom-in":
          return "scale(0.5) translateY(20px)"
        case "flip":
          return "rotateY(90deg) scale(0.8)"
        default:
          return `translateY(${distance}px)`
      }
    }
    return "translateY(0) translateX(0) scale(1) rotate(0deg) rotateY(0deg)"
  }

  const getEasing = () => {
    switch (easing) {
      case "ease":
        return "ease"
      case "ease-in":
        return "ease-in"
      case "ease-out":
        return "ease-out"
      case "ease-in-out":
        return "ease-in-out"
      case "cubic-bezier":
        return "cubic-bezier(0.4, 0, 0.2, 1)"
      default:
        return "ease-out"
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `all ${duration}ms ${getEasing()}`,
      }}
    >
      {children}
    </div>
  )
}
