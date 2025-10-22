"use client"

import type React from "react"

import { useState } from "react"
import { SidebarNav } from "./sidebar-nav"
import { TopNav } from "./top-nav"

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export function DashboardLayout({ children, title = "UGen Pro Creative" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block lg:flex-shrink-0">
        <SidebarNav />
      </aside>

      {/* Sidebar - Mobile (only shows when sidebarOpen is true AND on mobile) */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 lg:hidden animate-in slide-in-from-left duration-300">
            <SidebarNav />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopNav title={title} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">{children}</main>
      </div>
    </div>
  )
}
