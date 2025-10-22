// Domain configuration utility for multi-domain support

export interface DomainConfig {
  name: string
  url: string
  isProduction: boolean
  supabaseConfig: {
    url: string
    anonKey: string
  }
}

// Supported domains configuration
export const DOMAIN_CONFIGS: Record<string, DomainConfig> = {
  'localhost:3000': {
    name: 'Local Development',
    url: 'http://localhost:3000',
    isProduction: false,
    supabaseConfig: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    }
  },
  'localhost:3001': {
    name: 'Local Development (Alt)',
    url: 'http://localhost:3001',
    isProduction: false,
    supabaseConfig: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    }
  },
  // Production domain
  'ugenpro.site': {
    name: 'UGen Pro Production',
    url: 'https://ugenpro.site',
    isProduction: true,
    supabaseConfig: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    }
  },
  'www.ugenpro.site': {
    name: 'UGen Pro Production (WWW)',
    url: 'https://www.ugenpro.site',
    isProduction: true,
    supabaseConfig: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    }
  }
}

// Get current domain configuration
export function getCurrentDomainConfig(): DomainConfig | null {
  if (typeof window === 'undefined') {
    return null
  }

  const hostname = window.location.hostname
  const port = window.location.port
  const domain = port ? `${hostname}:${port}` : hostname

  // Find exact match first
  if (DOMAIN_CONFIGS[domain]) {
    return DOMAIN_CONFIGS[domain]
  }

  // Find partial match for subdomains
  for (const [configDomain, config] of Object.entries(DOMAIN_CONFIGS)) {
    if (domain.includes(configDomain) || configDomain.includes(domain)) {
      return config
    }
  }

  // Fallback to default configuration
  return {
    name: 'Unknown Domain',
    url: window.location.origin,
    isProduction: !hostname.includes('localhost'),
    supabaseConfig: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    }
  }
}

// Check if current domain is supported
export function isDomainSupported(): boolean {
  const config = getCurrentDomainConfig()
  return config !== null && !!config.supabaseConfig.url
}

// Get Supabase configuration for current domain
export function getSupabaseConfig() {
  const config = getCurrentDomainConfig()
  if (!config) {
    throw new Error('Domain not supported')
  }
  return config.supabaseConfig
}

// Debug function to log domain information
export function debugDomainInfo() {
  if (typeof window === 'undefined') {
    console.log('[Domain] Running on server')
    return
  }

  const config = getCurrentDomainConfig()
  console.log('[Domain] Current domain info:', {
    hostname: window.location.hostname,
    port: window.location.port,
    origin: window.location.origin,
    config: config?.name || 'Unknown',
    isSupported: isDomainSupported(),
    isProduction: config?.isProduction || false
  })
}

// Validate environment variables
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get allowed origins for CORS
export function getAllowedOrigins(): string[] {
  return Object.values(DOMAIN_CONFIGS).map(config => config.url)
}

// Check if origin is allowed
export function isOriginAllowed(origin: string): boolean {
  const allowedOrigins = getAllowedOrigins()
  return allowedOrigins.some(allowed => 
    origin === allowed || 
    origin.includes(allowed.replace(/^https?:\/\//, ''))
  )
}
