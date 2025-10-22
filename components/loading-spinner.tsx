"use client"

import { Spinner } from "@/components/ui/spinner"

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-8 text-purple-600 dark:text-purple-400" />
        <p className="text-slate-600 dark:text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}
