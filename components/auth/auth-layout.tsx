"use client"

import type React from "react"
import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"
import AuthThemeToggle from "@/components/auth-theme-toggle"

interface AuthLayoutProps {
  children: React.ReactNode
  variant?: "login" | "signup"
}

export default function AuthLayout({ children, variant = "login" }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-slate-900">
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between z-20">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-card border border-border text-foreground hover:bg-accent hover:border-primary/50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="হোম পেজে ফিরুন"
          title="হোম পেজে ফিরুন"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <Home className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="text-xs sm:text-sm font-semibold">Back to Home</span>
        </Link>
        <AuthThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10 bg-card border border-border rounded-2xl shadow-lg p-6 sm:p-8">
        {children}
      </div>
    </div>
  )
}
