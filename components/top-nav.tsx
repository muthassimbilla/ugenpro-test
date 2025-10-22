"use client"

import { Menu, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Link from "next/link"
import { NotificationDropdown } from "@/components/notification-dropdown"

interface TopNavProps {
  title: string
  onMenuClick?: () => void
}

export function TopNav({ title, onMenuClick }: TopNavProps) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <div className="relative flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 sm:px-6 shadow-sm">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2B7FFF]/5 via-[#4a9fff]/5 to-[#2B7FFF]/5 opacity-50"></div>

      <div className="relative flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </Button>

        <h1 className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200 truncate">
          {user?.full_name || title}
        </h1>
      </div>

      <div className="relative flex items-center gap-1 sm:gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          disabled={!mounted}
          aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
        >
          {mounted ? (
            resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-blue-500" />
            )
          ) : (
            <div className="h-5 w-5 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
          )}
        </Button>

        <NotificationDropdown />

        {/* Profile Avatar */}
        <Link href="/profile" className="ml-1">
          <div className="group relative">
            <Avatar className="h-9 w-9 cursor-pointer transition-all duration-200 hover:scale-105 ring-2 ring-transparent hover:ring-[#2B7FFF]/50 dark:hover:ring-[#4a9fff]/50">
              <AvatarFallback className="bg-[#2B7FFF] text-white text-sm font-bold">
                {user?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "MU"}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
          </div>
        </Link>
      </div>
    </div>
  )
}
