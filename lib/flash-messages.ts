export type FlashMessageType = 'success' | 'error' | 'warning' | 'info'

export interface FlashMessage {
  type: FlashMessageType
  message: string
  id: string
}

// Client-side functions
export function setClientFlashMessage(type: FlashMessageType, message: string) {
  if (typeof window === 'undefined') return
  
  const flashMessage: FlashMessage = {
    type,
    message,
    id: Date.now().toString()
  }
  
  // Store in sessionStorage for immediate access
  sessionStorage.setItem('flash_message', JSON.stringify(flashMessage))
  
  // Also set cookie for server-side access
  document.cookie = `flash_message=${JSON.stringify(flashMessage)}; path=/; max-age=300; samesite=lax`
}

export function getClientFlashMessage(): FlashMessage | null {
  if (typeof window === 'undefined') return null
  
  try {
    const flashData = sessionStorage.getItem('flash_message')
    if (!flashData) return null
    
    const flashMessage = JSON.parse(flashData) as FlashMessage
    return flashMessage
  } catch {
    return null
  }
}

export function clearClientFlashMessage() {
  if (typeof window === 'undefined') return
  
  sessionStorage.removeItem('flash_message')
  document.cookie = 'flash_message=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}
