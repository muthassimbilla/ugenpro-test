"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Layers, ChevronDown, Smartphone, MapPin, Mail, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Home", href: "/tool", icon: Home, count: null },
  { name: "Tools", href: "/tool", icon: Layers, count: 3, hasDropdown: true },
]

const toolsSubmenu = [
  { name: "User Agent Generator", href: "/tool/user-agent-generator", icon: Smartphone },
  { name: "Address Generator", href: "/tool/address-generator", icon: MapPin },
  { name: "Email2Name", href: "/tool/email2name", icon: Mail },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>(["Tools"])

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-lg">
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-700 px-4 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-slate-800 dark:to-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2B7FFF] via-[#4a9fff] to-[#2B7FFF] shadow-md">
          <img src="/ugenpro-logo.svg" alt="UGen Pro Logo" className="w-full h-full rounded-xl" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">UGen Pro</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Creative Suite</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.name === "Tools" && pathname.startsWith("/tool")) ||
            (item.name === "Orders" && pathname.startsWith("/dashboard/orders"))
          const isExpanded = expandedItems.includes(item.name)

          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
                onClick={(e) => {
                  if (item.hasDropdown) {
                    e.preventDefault()
                    toggleExpand(item.name)
                  }
                }}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.count !== null && (
                  <Badge
                    className={cn(
                      "h-5 min-w-5 px-1.5 text-xs",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
                    )}
                  >
                    {item.count}
                  </Badge>
                )}
                {item.hasDropdown && (
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                )}
              </Link>

              {/* Submenu */}
              {item.name === "Tools" && isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                  {toolsSubmenu.map((subItem) => {
                    const isSubActive = pathname === subItem.href
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                          isSubActive
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                        )}
                      >
                        <subItem.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{subItem.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-2">
        {/* Account Status */}
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">Account Active</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Expires on:</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {user?.expiryDate
              ? new Date(user.expiryDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Dec 31, 2024"}
          </p>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}
