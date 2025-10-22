import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.warn("Failed to set cookie:", name, error)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            console.warn("Failed to remove cookie:", name, error)
          }
        },
      },
    },
  )
}

export async function getServerUser() {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get profile data from profiles table
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    return {
      id: user.id,
      email: user.email!,
      full_name: profile?.full_name || "",
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
    }
  } catch (error) {
    console.error("Server user validation error:", error)
    return null
  }
}
