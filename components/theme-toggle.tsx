"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useSmoothTheme } from "@/hooks/use-smooth-theme"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, toggleTheme } = useSmoothTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
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
      className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  )
}

export default ThemeToggle
