"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdminAuth } from "@/lib/admin-auth-context"
import { Button } from "@/components/ui/button"
import {
  Home,
  Users,
  LogOut,
  User,
  Menu,
  X,
  Shield,
  Activity,
  Bell,
  Settings,
  ShoppingCart,
  Tag,
  BarChart,
} from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"

export function AdminNavigation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { admin, logout } = useAdminAuth()

  const navigationItems = [
    { name: "Dashboard", href: "/adminbilla", icon: Home },
    { name: "User Management", href: "/adminbilla/users", icon: Users },
    { name: "Orders", href: "/adminbilla/orders", icon: ShoppingCart },
    { name: "Coupons", href: "/adminbilla/coupons", icon: Tag },
    { name: "Coupon Analytics", href: "/adminbilla/coupon-analytics", icon: BarChart },
    { name: "Notifications", href: "/adminbilla/notifications", icon: Bell },
    { name: "API Monitoring", href: "/adminbilla/api-monitoring", icon: Activity },
    { name: "API Limits", href: "/adminbilla/api-limits", icon: Shield },
    { name: "Global Limits", href: "/adminbilla/global-limits", icon: Settings },
  ]

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLogout = () => {
    console.log("[v0] Logout button clicked")
    logout()
  }

  const isActive = (href: string) => {
    if (href === "/adminbilla") {
      return pathname === "/adminbilla"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "var(--backdrop-blur)",
          borderRight: "1px solid hsl(var(--border))",
        }}
      >
        <div className="flex flex-col h-full relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-40 right-8 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>

          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-white/10 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <img src="/ugenpro-logo.svg" alt="UGen Pro Logo" className="w-full h-full rounded-xl relative z-10" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
            <ThemeToggle />
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto relative">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 mb-4">
                Navigation
              </div>
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                const itemIsActive = isActive(item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${
                      itemIsActive
                        ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-600 dark:text-emerald-400 shadow-lg border border-emerald-500/30"
                        : "text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                    }`}
                    style={{
                      background: itemIsActive ? "var(--glass-bg)" : undefined,
                      backdropFilter: itemIsActive ? "var(--backdrop-blur)" : undefined,
                    }}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {itemIsActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                    )}

                    <IconComponent
                      className={`w-5 h-5 relative z-10 ${
                        itemIsActive
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-500 dark:text-slate-400 group-hover:text-red-500"
                      }`}
                    />
                    <div className="flex-1 relative z-10">
                      <div className="text-sm">{item.name}</div>
                    </div>
                    {itemIsActive && <div className="w-2 h-2 rounded-full bg-red-500/60 relative z-10" />}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Bottom Section - Admin Info & Logout */}
          <div className="px-4 py-6 border-t border-white/10 relative">
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Admin Info */}
            <div
              className="flex items-center mb-4 p-3 rounded-xl"
              style={{
                background: "var(--glass-bg)",
                backdropFilter: "var(--backdrop-blur)",
                border: "1px solid hsl(var(--border))",
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{admin?.full_name}</div>
                <div className="text-xs text-muted-foreground">@{admin?.username}</div>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "var(--backdrop-blur)",
          border: "1px solid hsl(var(--border))",
        }}
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600 dark:text-slate-400" />
        ) : (
          <Menu className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600 dark:text-slate-400" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-xl transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}
