"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useSmoothTheme } from "@/hooks/use-smooth-theme"

export default function AuthThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, toggleTheme } = useSmoothTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-gray-900/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 animate-pulse" />
    )
  }

  const getIcon = () => {
    if (resolvedTheme === "dark") {
      return <Sun className="w-5 h-5 text-yellow-500 transition-transform duration-200" />
    } else {
      return <Moon className="w-5 h-5 text-slate-600 transition-transform duration-200" />
    }
  }

  const getLabel = () => {
    if (resolvedTheme === "dark") {
      return "Switch to light mode"
    } else {
      return "Switch to dark mode"
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-gray-900/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-800/30 hover:border-white/30 dark:hover:border-gray-600/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group relative overflow-hidden"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-yellow-500/10 dark:to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Icon with enhanced animation */}
      <div className="relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200">
        {getIcon()}
      </div>

      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-2xl bg-white/20 dark:bg-gray-100/20 scale-0 group-active:scale-100 transition-transform duration-150" />
    </button>
  )
}
