"use client"
import ThemeToggle from "./theme-toggle"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { LogOut, User, ChevronDown, ShoppingBag } from "lucide-react"
import { Button } from "./ui/button"
import { useState, useEffect } from "react"

export default function SimpleHeader() {
  const { user, logout } = useAuth()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".profile-dropdown")) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/95 backdrop-blur-2xl border-b border-white/40 dark:border-slate-700/50 shadow-xl">
      <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <Image
              src="/ugenpro-logo.svg"
              alt="UGen Pro Logo"
              width={24}
              height={24}
              className="rounded-lg relative z-10 object-contain w-full h-full"
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#2B7FFF] to-[#4a9fff] bg-clip-text text-transparent">
            UGen Pro
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop User Info */}
          {user && (
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/30 dark:to-blue-950/30 border border-blue-200/50 dark:border-blue-800/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2B7FFF] to-[#4a9fff] flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.full_name}</span>
            </div>
          )}

          {/* Desktop Orders link button */}
          {user && (
            <Button
              onClick={() => (window.location.href = "/premium-tools/orders")}
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-800/50 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="font-semibold">My Orders</span>
            </Button>
          )}

          {/* Desktop Theme Toggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Desktop Logout Button */}
          {user && (
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200/50 dark:border-red-800/50 hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/40 dark:hover:to-orange-900/40 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-semibold">Log out</span>
            </Button>
          )}

          {/* Mobile Profile Dropdown */}
          {user && (
            <div className="relative profile-dropdown md:hidden">
              <Button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/30 dark:to-blue-950/30 border border-blue-200/50 dark:border-blue-800/50 hover:from-blue-100 hover:to-blue-100 dark:hover:from-blue-900/40 dark:hover:to-blue-900/40 text-slate-700 dark:text-slate-200 transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2B7FFF] to-[#4a9fff] flex items-center justify-center shadow-lg">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-semibold">{user.full_name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
              </Button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <a
                    href="/premium-tools/orders"
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="font-semibold">My Orders</span>
                  </a>

                  {/* Theme Toggle in Mobile Dropdown */}
                  <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>

                  {/* Logout Button in Mobile Dropdown */}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsProfileDropdownOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-200 dark:border-gray-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-semibold">Log out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
