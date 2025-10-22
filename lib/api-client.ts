import { useAuth } from "@/lib/auth-context"

interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
}

export function useApiClient() {
  const { user } = useAuth()

  const apiCall = async (url: string, options: ApiCallOptions = {}) => {
    const {
      method = 'GET',
      body,
      headers: customHeaders = {}
    } = options

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    }

    // Add user data header if user is authenticated
    if (user) {
      headers['x-user-data'] = JSON.stringify({
        id: user.id,
        email: user.email,
        full_name: user.full_name
      })
    }

    const config: RequestInit = {
      method,
      headers,
    }

    if (body && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(body)
    }

    return fetch(url, config)
  }

  return { apiCall }
}

// Static version for use outside of React components
export async function makeApiCall(
  url: string, 
  options: ApiCallOptions = {},
  userData?: { id: string; email: string; full_name?: string }
) {
  const {
    method = 'GET',
    body,
    headers: customHeaders = {}
  } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  }

  // Add user data header if provided
  if (userData) {
    headers['x-user-data'] = JSON.stringify(userData)
  }

  const config: RequestInit = {
    method,
    headers,
  }

  if (body && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(body)
  }

  return fetch(url, config)
}
