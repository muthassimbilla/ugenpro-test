"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavigationProps {
  activeSection?: string
}

export function Navigation({ activeSection = "hero" }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Improve UX: lock body scroll when drawer is open and close on ESC
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileMenuOpen(false)
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        document.body.style.overflow = originalOverflow
        window.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [mobileMenuOpen])

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    setMobileMenuOpen(false)
  }

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "tools", label: "Tools" },
    { id: "pricing", label: "Pricing" },
    { id: "contact", label: "Contact" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-black/10 dark:shadow-black/20 transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl transition-transform group-hover:scale-110 shadow-glow">
            <img src="/ugenpro-logo.svg" alt="UGen Pro Logo" className="w-full h-full rounded-xl" />
          </div>
          <span className="font-bold text-lg sm:text-xl gradient-text">UGen Pro</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleSmoothScroll(e, item.id)}
              className={`px-5 py-2.5 text-sm font-semibold transition-all rounded-xl relative overflow-hidden group ${
                activeSection === item.id
                  ? "text-primary bg-primary/10 shadow-glow border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50 hover:shadow-sm border border-transparent hover:border-border/50"
              }`}
            >
              <span className="relative z-10">{item.label}</span>
              {activeSection === item.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-50 rounded-xl" />
              )}
            </a>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Link href="/login" className="hidden md:block">
            <Button
              variant="outline"
              size="sm"
              className="font-semibold rounded-xl border-2 border-[#2B7FFF]/30 hover:border-[#2B7FFF]/50 bg-gradient-to-r from-[#2B7FFF]/5 to-[#4a9fff]/5 hover:from-[#2B7FFF]/10 hover:to-[#4a9fff]/10 text-foreground hover:text-[#2B7FFF] dark:hover:text-[#4a9fff] transition-all shadow-sm hover:shadow-glow"
            >
              Sign In
            </Button>
          </Link>
          {/* Hide Get Started on mobile; show on md+ with current brand color (non-gradient) */}
          <Link href="/signup" className="hidden md:block">
            <Button
              size="sm"
              className="bg-[#2B7FFF] hover:bg-[#1a6bff] text-white font-semibold shadow-glow hover:shadow-glow-accent transition-all interactive-scale rounded-xl px-6 border-2 border-white/10"
            >
              Get Started
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-card/50 rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu (slides in from right) */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200/50 dark:border-gray-800/50 transform transition-transform duration-300 ease-out translate-x-0">
            <div className="px-4 py-4 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
              <span className="font-bold">Menu</span>
              {/* Three-lines button inside drawer to close on click */}
              <button
                aria-label="Close menu"
                className="rounded-xl p-2 hover:bg-card/60"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleSmoothScroll(e, item.id)}
                  className={`block px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary border border-primary/30 shadow-glow"
                      : "text-muted-foreground hover:bg-card/50 hover:text-foreground border border-transparent hover:border-border/50"
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <Link href="/login" className="block">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-2 border-border/50 hover:border-primary/50 font-semibold bg-transparent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Button>
                </Link>
                {/* Add Get Started inside mobile drawer with current solid brand color */}
                <Link href="/signup" className="block">
                  <Button
                    className="w-full bg-[#2B7FFF] hover:bg-[#1a6bff] text-white font-semibold shadow-glow hover:shadow-glow-accent transition-all interactive-scale rounded-xl px-6 border-2 border-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
