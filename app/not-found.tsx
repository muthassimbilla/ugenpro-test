"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="text-center">
        {/* 404 Number */}
        <div className="text-9xl font-black text-slate-900 dark:text-slate-100 mb-4">404</div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-8">Oops! Page Not Found</h1>

        {/* Back Button */}
        <Button
          onClick={handleGoBack}
          variant="outline"
          size="lg"
          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  )
}
