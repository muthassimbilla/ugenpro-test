import { createClient } from "./client"

// Dynamic domain configuration for Supabase
export function createDynamicClient() {
  return createClient()
}

// Fallback client for server-side rendering
export function createServerDynamicClient() {
  return createClient()
}

// Domain validation helper
export function isValidDomain(domain: string): boolean {
  const allowedDomains = [
    "localhost:3000",
    "localhost:3001",
    "127.0.0.1:3000",
    // Add your production domains here
    "your-domain.com",
    "your-domain.netlify.app",
    "your-domain.vercel.app",
  ]

  return allowedDomains.some((allowed) => domain.includes(allowed))
}

// Get current domain info
export function getCurrentDomainInfo() {
  if (typeof window === "undefined") {
    return {
      domain: "server",
      isValid: true,
      protocol: "https",
    }
  }

  const domain = window.location.hostname
  const protocol = window.location.protocol
  const port = window.location.port
  const fullDomain = port ? `${domain}:${port}` : domain

  return {
    domain: fullDomain,
    isValid: isValidDomain(fullDomain),
    protocol,
    fullUrl: window.location.origin,
  }
}
