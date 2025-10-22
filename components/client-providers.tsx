"use client"

import type React from "react"
import { AuthProvider } from "@/lib/auth-context"
import { StatusNotificationProvider } from "@/components/status-notification-provider"
import { NetworkProvider } from "@/contexts/network-context"
import { QueryProvider } from "@/components/query-provider"
import ConditionalLayout from "@/components/conditional-layout"
// import { ServiceWorkerRegistration } from "@/components/service-worker-registration"

interface ClientProvidersProps {
  children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <QueryProvider>
      <NetworkProvider>
        <StatusNotificationProvider>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            {/* <ServiceWorkerRegistration /> */}
          </AuthProvider>
        </StatusNotificationProvider>
      </NetworkProvider>
    </QueryProvider>
  )
}
