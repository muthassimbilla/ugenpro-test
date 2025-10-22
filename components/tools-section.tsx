"use client"

import { toolsData } from "@/lib/tools-config"
import { ToolCard } from "@/components/tool-card"
import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import type { Tool } from "@/lib/tools-config"
import { Wrench } from "lucide-react"

const LazyToolModal = dynamic(() => import("@/components/tool-modal").then((mod) => mod.ToolModal), {
  loading: () => null,
  ssr: false,
})

export function ToolsSection() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedTool(null), 300)
  }

  const firstThreeTools = useMemo(() => toolsData.slice(0, 3), [])

  return (
    <section id="tools" className="relative pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/[0.02] to-background" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border border-primary/10">
            <Wrench className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Our Tools
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            <span className="block text-balance">Professional Generator</span>
            <span className="block text-balance gradient-text">Tools</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance">
            Fast, secure, and reliable tools for CPA campaigns and lead generation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {firstThreeTools.map((tool, index) => (
            <div key={tool.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <ToolCard tool={tool} onClick={() => handleToolClick(tool)} />
            </div>
          ))}
        </div>
      </div>

      <LazyToolModal tool={selectedTool} isOpen={isModalOpen} onClose={handleCloseModal} />
    </section>
  )
}
