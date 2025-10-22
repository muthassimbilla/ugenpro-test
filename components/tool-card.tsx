"use client"

import type { Tool } from "@/lib/tools-config"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Play } from "lucide-react"

interface ToolCardProps {
  tool: Tool
  onClick: () => void
  featured?: boolean
}

export function ToolCard({ tool, onClick, featured = false }: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "tool_card_click", {
        tool_id: tool.id,
        tool_name: tool.name,
      })
    }
    onClick()
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300",
        "rounded-2xl bg-card border border-border/50 shadow-soft",
        "hover:shadow-glow hover:border-primary/30 hover:-translate-y-2",
        "h-full",
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6 sm:p-8 space-y-5 sm:space-y-6 h-full flex flex-col relative z-10">
        <div className="flex items-center justify-start">
          <div className="p-3 sm:p-4 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300 shadow-soft">
            <tool.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 flex-1">
          <h3 className="text-xl sm:text-2xl font-bold transition-colors duration-300 group-hover:text-primary leading-tight">
            {tool.name}
          </h3>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{tool.description}</p>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs sm:text-sm font-semibold text-primary/80">Key Features:</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {tool.features.slice(0, 3).map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center pt-4">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/15 border border-primary/20 hover:border-primary/30 rounded-xl text-sm font-semibold text-primary hover:scale-105 transition-all duration-300 cursor-pointer shadow-soft">
            <Play className="h-4 w-4" />
            <span>Watch Demo</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
