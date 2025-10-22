"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { memo, useCallback } from "react"

export const HeroSection = memo(function HeroSection() {
  const router = useRouter()

  const handleGetStarted = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "cta_click", {
        event_category: "engagement",
        event_label: "hero_get_started",
      })
    }
    router.push("/signup")
  }, [router])

  const handleExploreTools = useCallback(() => {
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-0 sm:pt-24 sm:pb-0"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(43,127,255,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(43,127,255,0.03),transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto text-center">
          <div className="space-y-6 sm:space-y-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border border-primary/10">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Next-Gen AI Tools
              </span>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                <span className="block text-balance">Advanced Generator Tools For</span>
                <span className="block text-balance gradient-text">CPA Self Signup</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto text-balance px-4 sm:px-0">
                Professional generator tools for CPA self signup. Generate user agents, addresses, and transform emails
                into names with AI-powered precision.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0 pt-2">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-glow hover:shadow-glow-accent transition-all duration-300 group hover:scale-105"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleExploreTools}
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 glass hover:glass-strong border-border/50 hover:border-primary/30 rounded-xl font-semibold hover:scale-105 transition-all duration-300 bg-transparent"
              >
                Explore Tools
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center pt-4 sm:pt-6">
              <div className="group flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl glass hover:glass-strong transition-all duration-300 hover:scale-105 hover:shadow-medium">
                <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">10x</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Faster</div>
                </div>
              </div>

              <div className="group flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl glass hover:glass-strong transition-all duration-300 hover:scale-105 hover:shadow-medium">
                <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">10K+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})
