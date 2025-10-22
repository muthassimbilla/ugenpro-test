"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Maximize, Volume2, VolumeX, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DemoVideoPlayerProps {
  src: string
  title: string
  className?: string
}

export function DemoVideoPlayer({ src, title, className }: DemoVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    const attemptAutoplay = async () => {
      try {
        setIsLoading(true)
        video.muted = false
        await video.play()
        setIsPlaying(true)
        setIsMuted(false)
        setIsLoading(false)
      } catch (error) {
        try {
          video.muted = true
          setIsMuted(true)
          await video.play()
          setIsPlaying(true)
          setIsLoading(false)
        } catch (mutedError) {
          setIsPlaying(false)
          setIsLoading(false)
        }
      }
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setHasError(false)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleLoadedData = () => {
      setIsLoading(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      attemptAutoplay()
    }

    const handleError = (e: Event) => {
      setHasError(true)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const bufferedPercent = (bufferedEnd / video.duration) * 100
        setBuffered(bufferedPercent)
      }
    }

    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("loadeddata", handleLoadedData)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("error", handleError)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("progress", handleProgress)

    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        video.load()
      })
    } else {
      setTimeout(() => {
        video.load()
      }, 100)
    }

    return () => {
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("loadeddata", handleLoadedData)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("progress", handleProgress)
    }
  }, [src])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)

      if (isCurrentlyFullscreen && window.screen?.orientation?.lock) {
        window.screen.orientation.lock("landscape").catch(() => {})
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    setShowControls(true)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  const togglePlay = async () => {
    if (!videoRef.current) return

    try {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        await videoRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Play/pause error:", error)
    }
    resetControlsTimeout()
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
    resetControlsTimeout()
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen()
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          await (containerRef.current as any).mozRequestFullScreen()
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
      }
    } catch (error) {
      console.error("Fullscreen error:", error)
    }
    resetControlsTimeout()
  }

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
    resetControlsTimeout()
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleVideoClick = () => {
    if (!isLoading && !hasError) {
      togglePlay()
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full bg-black rounded-lg overflow-hidden group", className)}
      onMouseMove={resetControlsTimeout}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
        onClick={handleVideoClick}
        onPlay={() => {
          setIsPlaying(true)
          setIsLoading(false)
          resetControlsTimeout()
        }}
        onPause={() => {
          setIsPlaying(false)
          setShowControls(true)
        }}
        onEnded={() => {
          setIsPlaying(false)
          setShowControls(true)
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
      >
        <source src={src} type="video/mp4" />
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>

      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <p className="text-white text-base font-medium">Loading video...</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center px-6 max-w-md">
            <p className="text-white text-xl font-semibold mb-3">Unable to load video</p>
            <p className="text-white/80 text-sm mb-4">Please check your connection and try again</p>
            <p className="text-white/50 text-xs font-mono break-all">Path: {src}</p>
            <button
              onClick={() => {
                setHasError(false)
                setIsLoading(true)
                videoRef.current?.load()
              }}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!isPlaying && !isLoading && !hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors hover:scale-110">
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="mb-3">
          <div
            ref={progressBarRef}
            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress hover:h-2 transition-all"
            onClick={handleProgressBarClick}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white/30 rounded-full transition-all"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>
          <div className="flex justify-between items-center mt-1.5 text-xs text-white/80">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={isLoading || hasError}
            className="text-white hover:text-primary transition-colors p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleMute}
            disabled={isLoading || hasError}
            className="text-white hover:text-primary transition-colors p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>

          <div className="flex-1" />

          <button
            onClick={toggleFullscreen}
            disabled={isLoading || hasError}
            className="text-white hover:text-primary transition-colors p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Toggle fullscreen"
          >
            <Maximize className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0",
        )}
      >
        <h3 className="text-white font-semibold text-sm md:text-base">{title}</h3>
      </div>
    </div>
  )
}
