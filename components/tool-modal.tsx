"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { Tool } from "@/lib/tools-config"
import { useEffect, useState } from "react"
import { DemoVideoPlayer } from "@/components/demo-video-player"
import { X } from "lucide-react"

interface ToolModalProps {
  tool: Tool | null
  isOpen: boolean
  onClose: () => void
}

export function ToolModal({ tool, isOpen, onClose }: ToolModalProps) {
  const [isVideoReady, setIsVideoReady] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
        if (typeof window !== "undefined" && (window as any).gtag) {
          ;(window as any).gtag("event", "modal_close", {
            method: "keyboard",
            tool_id: tool?.id,
          })
        }
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose, tool?.id])

  useEffect(() => {
    if (isOpen && tool && typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "modal_open", {
        tool_id: tool.id,
        tool_name: tool.name,
      })
    }
    setIsVideoReady(isOpen)
  }, [isOpen, tool])

  if (!tool) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[1200px] h-[80vh] max-h-[675px] p-0 border-0 bg-transparent shadow-none mx-auto">
        <DialogTitle className="sr-only">{tool.name} Demo Video</DialogTitle>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 rounded-full p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all hover:scale-110 group"
          aria-label="Close video"
        >
          <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <div className="relative w-full h-full">
          {tool.demoVideo && isVideoReady && (
            <DemoVideoPlayer src={tool.demoVideo} title={`${tool.name} Demo`} className="w-full h-full" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ToolModal
