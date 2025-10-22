import { createClient } from "@supabase/supabase-js"

/**
 * Create a Supabase client with service role key
 * This bypasses Row Level Security (RLS) and should only be used in secure server-side contexts
 * Use this for admin operations that need to bypass RLS policies
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase service role credentials")
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
