import { type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/auth-server"

export interface AuthResult {
  user: any | null
  error: string | null
  isAuthenticated: boolean
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
  try {
    // Method 1: Try Supabase server-side authentication
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: supabaseError } = await supabase.auth.getUser()
    
    if (user && !supabaseError) {
      return {
        user,
        error: null,
        isAuthenticated: true
      }
    }

    // Method 2: Check for manual authentication header/token
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // This could be used for API keys or custom tokens if needed
      const token = authHeader.substring(7)
      // For now, we'll skip this as we're using Supabase auth
    }

    // Method 3: Check for user session in localStorage (via custom header)
    // Client can send user info in a custom header for API requests
    const userDataHeader = request.headers.get('x-user-data')
    if (userDataHeader) {
      try {
        const userData = JSON.parse(userDataHeader)
        if (userData.id && userData.email) {
          // Validate this user exists in our database
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userData.id)
            .eq('email', userData.email)
            .single()
          
          if (profile) {
            return {
              user: {
                id: userData.id,
                email: userData.email,
                ...profile
              },
              error: null,
              isAuthenticated: true
            }
          }
        }
      } catch (error) {
        console.error('Error parsing user data header:', error)
      }
    }

    return {
      user: null,
      error: 'Not authenticated',
      isAuthenticated: false
    }

  } catch (error) {
    console.error('Authentication error:', error)
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Authentication failed',
      isAuthenticated: false
    }
  }
}

// Helper function to handle authentication for API routes
export async function withAuth<T>(
  request: NextRequest,
  handler: (user: any, request: NextRequest) => Promise<T>
): Promise<T | Response> {
  const authResult = await getAuthenticatedUser(request)
  
  if (!authResult.isAuthenticated) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Authentication required. Please login first.",
        auth_required: true
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  return handler(authResult.user, request)
}
