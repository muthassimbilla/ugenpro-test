import { createBrowserClient } from "@supabase/ssr"

// Global singleton instance
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Only create client on client side
  if (typeof window === "undefined") {
    return null
  }

  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[v0] Missing Supabase environment variables")
      return null
    }

    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  
  return supabaseClient
}
