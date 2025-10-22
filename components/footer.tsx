"use client"

import Link from "next/link"
import { ArrowUp, MessageCircle, Youtube, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative bg-muted/50 border-t border-border overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-6">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="w-12 h-12 rounded-2xl bg-primary p-0.5 transition-all duration-300 group-hover:scale-110">
                <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                  <img src="/ugenpro-logo.svg" alt="UGen Pro Logo" className="w-10 h-10 rounded-xl" />
                </div>
              </div>
              <span className="font-bold text-2xl text-primary">UGen Pro</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Professional AI-powered tools for developers and teams. Fast, reliable, and built for scale.
            </p>

            <div className="flex gap-4">
              <a
                href="https://t.me/+DS9l9qeSDfgxODI9"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 group"
              >
                <MessageCircle className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://youtube.com/@UGenPro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 group"
              >
                <Youtube className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
            <h3 className="font-bold text-lg mb-4 text-primary">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-all font-medium block py-2 px-3 rounded-xl hover:bg-primary/10 group"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="#tools"
                  className="text-sm text-muted-foreground hover:text-primary transition-all font-medium block py-2 px-3 rounded-xl hover:bg-primary/10 group"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    Tools
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-sm text-muted-foreground hover:text-primary transition-all font-medium block py-2 px-3 rounded-xl hover:bg-primary/10 group"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    Pricing
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-all font-medium block py-2 px-3 rounded-xl hover:bg-primary/10 group"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    Contact
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
            <h3 className="font-bold text-lg mb-4 text-primary">Support</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://t.me/+DS9l9qeSDfgxODI9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-all font-medium block py-2 px-3 rounded-xl hover:bg-primary/10 group"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    Community
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/ugenpro_admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-all font-medium block py-2 px-3 rounded-xl hover:bg-primary/10 group"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    Admin
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 max-w-6xl mx-auto border border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="text-center md:text-left">
              © {new Date().getFullYear()} <span className="font-semibold text-primary">UGen Pro</span>. All rights
              reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl interactive-scale group"
        >
          <ArrowUp className="h-6 w-6 group-hover:animate-bounce" />
        </Button>
      )}
    </footer>
  )
}
