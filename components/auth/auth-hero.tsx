"use client"

import { Sparkles, UserPlus } from "lucide-react"

interface AuthHeroProps {
  variant: "login" | "signup"
}

export default function AuthHero({ variant }: AuthHeroProps) {
  const isLogin = variant === "login"

  return (
    <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2B7FFF] to-[#4a9fff] mb-4 shadow-lg">
        {isLogin ? <Sparkles className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
      </div>

      <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2B7FFF] to-[#4a9fff] bg-clip-text text-transparent mb-2">
        {isLogin ? "Welcome back" : "Create account"}
      </h1>

      <p className="text-muted-foreground text-sm">
        {isLogin ? "Sign in to continue to your dashboard" : "Get started with your new account"}
      </p>
    </div>
  )
}
