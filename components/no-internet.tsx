"use client"

import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NoInternetProps {
  onRetry?: () => void
  isReconnecting?: boolean
}

export default function NoInternet({ onRetry, isReconnecting = false }: NoInternetProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Animated orbs */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-red-200/30 dark:bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-200/30 dark:bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-red-400/60 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-bounce" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-32 left-16 w-2.5 h-2.5 bg-red-400/60 rounded-full animate-bounce" style={{ animationDelay: "2.5s" }} />
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-orange-400/60 rounded-full animate-bounce" style={{ animationDelay: "3s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 rounded-3xl shadow-2xl border-0 backdrop-blur-xl bg-white/10 dark:bg-gray-900/10 text-center">
          {/* Icon */}
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden ${
            isReconnecting 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
              : 'bg-gradient-to-br from-red-500 to-orange-600'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            {isReconnecting ? (
              <RefreshCw className="w-10 h-10 text-white relative z-10 animate-spin" />
            ) : (
              <WifiOff className="w-10 h-10 text-white relative z-10" />
            )}
            <div className="absolute -top-1 -right-1">
              <AlertTriangle className={`w-4 h-4 animate-pulse ${
                isReconnecting ? 'text-green-400' : 'text-yellow-400'
              }`} />
            </div>
          </div>

          {/* Title */}
          <h1 className={`text-3xl font-bold bg-clip-text text-transparent mb-4 ${
            isReconnecting 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
              : 'bg-gradient-to-r from-red-600 to-orange-600'
          }`}>
            {isReconnecting ? 'Reconnecting...' : 'No Internet Connection'}
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mb-8">
            {isReconnecting 
              ? 'Internet connection restored! Reloading page...' 
              : 'Please check your internet connection and try again. Make sure you\'re connected to a stable network.'
            }
          </p>

          {/* Status Indicators */}
          <div className="space-y-4 mb-8">
            {isReconnecting ? (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-50/50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50">
                <RefreshCw className="w-5 h-5 text-green-500 animate-spin" />
                <span className="text-green-600 dark:text-green-400 font-medium">Reconnecting...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50">
                  <WifiOff className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 dark:text-red-400 font-medium">Connection Lost</span>
                </div>
                
                <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-orange-50/50 dark:bg-orange-900/20 border border-orange-200/50 dark:border-orange-800/50">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400 font-medium">Unable to reach server</span>
                </div>
              </>
            )}
          </div>

          {/* Retry Button */}
          {!isReconnecting && (
            <Button
              onClick={onRetry}
              className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Try Again
              </div>
            </Button>
          )}

          {/* Tips */}
          <div className="mt-8 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Troubleshooting Tips:</h3>
            <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1 text-left">
              <li>• Check your WiFi or mobile data connection</li>
              <li>• Try refreshing the page</li>
              <li>• Restart your router if using WiFi</li>
              <li>• Check if other websites are working</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">© 2025 User Agent Generator. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
