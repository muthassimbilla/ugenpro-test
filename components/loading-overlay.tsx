import { Loader2, Sparkles } from "lucide-react"

interface LoadingOverlayProps {
  message?: string
  fullScreen?: boolean
}

export default function LoadingOverlay({ message = "Loading...", fullScreen = false }: LoadingOverlayProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-slate-50/95 to-slate-100/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated Spinner Container */}
          <div className="relative">
            {/* Outer Ring */}
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>

            {/* Inner Ring */}
            <div
              className="absolute inset-2 w-16 h-16 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin border-t-purple-600 dark:border-t-purple-400"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>

            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>

            {/* Sparkle Effects */}
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" style={{ animationDelay: "0.5s" }} />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <Sparkles className="w-3 h-3 text-pink-500 animate-pulse" style={{ animationDelay: "1s" }} />
            </div>
          </div>

          {/* Loading Text */}
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{message}</p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{message}</p>
      </div>
    </div>
  )
}
