import type React from "react"
import { Inter } from "next/font/google"
import { AdminAuthProvider } from "@/lib/admin-auth-context"
import { AdminConditionalLayout } from "@/components/admin-conditional-layout"

const inter = Inter({ subsets: ["latin"] })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <div className={`${inter.className} min-h-screen bg-background`}>
        <AdminConditionalLayout>{children}</AdminConditionalLayout>
      </div>
    </AdminAuthProvider>
  )
}
