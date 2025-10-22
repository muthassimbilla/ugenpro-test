"use client"

import { useTheme } from "next-themes"
import { useCallback } from "react"

export function useSmoothTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    
    // Add transitioning class to prevent flicker
    document.documentElement.classList.add('theme-transitioning')
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setTheme(newTheme)
      
      // Remove transitioning class after theme change
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning')
      }, 300)
    })
  }, [resolvedTheme, setTheme])

  return {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme
  }
}
