type CacheEntry<T> = {
  data: T
  timestamp: number
}

class APICache {
  private static instance: APICache
  private cache: Map<string, CacheEntry<any>>
  private maxAge: number // in milliseconds
  private maxSize: number // maximum number of entries

  private constructor() {
    this.cache = new Map()
    this.maxAge = 5 * 60 * 1000 // 5 minutes
    this.maxSize = 100 // maximum 100 entries
  }

  public static getInstance(): APICache {
    if (!APICache.instance) {
      APICache.instance = new APICache()
    }
    return APICache.instance
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  public set<T>(key: string, data: T): void {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  public clear(): void {
    this.cache.clear()
  }

  public remove(key: string): void {
    this.cache.delete(key)
  }

  public setMaxAge(maxAge: number): void {
    this.maxAge = maxAge
  }

  public setMaxSize(maxSize: number): void {
    this.maxSize = maxSize
    // If new size is smaller than current cache size, remove oldest entries
    while (this.cache.size > maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }

  public async fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      maxAge?: number // override default maxAge for this request
      forceRefresh?: boolean // ignore cache and fetch fresh data
    }
  ): Promise<T> {
    const maxAge = options?.maxAge || this.maxAge

    // Check cache first (unless forceRefresh is true)
    if (!options?.forceRefresh) {
      const cached = this.get<T>(key)
      if (cached) return cached
    }

    // Fetch fresh data
    const data = await fetcher()
    
    // Cache the result
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })

    return data
  }
}

export const apiCache = APICache.getInstance()
