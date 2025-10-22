import { type NextRequest, NextResponse } from "next/server"
import { ApiRateLimiter } from "@/lib/api-rate-limiter"
import { getAuthenticatedUser } from "@/lib/api-auth-helper"

const MAPBOX_TOKEN =
  process.env.MAPBOX_TOKEN ||
  "sk.eyJ1IjoibXV0aGFzc2ltNCIsImEiOiJjbWcyaW5zOTgxMTRyMmtzOTQydDNjbzN1In0.GzRk_OFR53CrS2r6cspn-w"
const BASE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places"

// Fallback coordinates for common ZIP codes
function getFallbackCoordinates(zipCode: string): { lon: number; lat: number } | null {
  const fallbackCoords: { [key: string]: { lon: number; lat: number } } = {
    "10001": { lon: -74.006, lat: 40.7128 }, // New York, NY
    "10002": { lon: -73.986, lat: 40.7158 }, // New York, NY
    "10003": { lon: -73.99, lat: 40.7328 }, // New York, NY
    "10004": { lon: -74.013, lat: 40.6892 }, // New York, NY
    "10005": { lon: -74.009, lat: 40.7074 }, // New York, NY
    "90210": { lon: -118.406, lat: 34.0901 }, // Beverly Hills, CA
    "90211": { lon: -118.38, lat: 34.0505 }, // Beverly Hills, CA
    "90212": { lon: -118.38, lat: 34.0505 }, // Beverly Hills, CA
    "60601": { lon: -87.6298, lat: 41.8781 }, // Chicago, IL
    "60602": { lon: -87.6298, lat: 41.8781 }, // Chicago, IL
    "60603": { lon: -87.6298, lat: 41.8781 }, // Chicago, IL
    "33101": { lon: -80.1918, lat: 25.7617 }, // Miami, FL
    "33102": { lon: -80.1918, lat: 25.7617 }, // Miami, FL
    "33103": { lon: -80.1918, lat: 25.7617 }, // Miami, FL
    "75201": { lon: -96.797, lat: 32.7767 }, // Dallas, TX
    "75202": { lon: -96.797, lat: 32.7767 }, // Dallas, TX
    "75203": { lon: -96.797, lat: 32.7767 }, // Dallas, TX
    "98101": { lon: -122.3321, lat: 47.6062 }, // Seattle, WA
    "98102": { lon: -122.3321, lat: 47.6062 }, // Seattle, WA
    "98103": { lon: -122.3321, lat: 47.6062 }, // Seattle, WA
    "02101": { lon: -71.0589, lat: 42.3601 }, // Boston, MA
    "02102": { lon: -71.0589, lat: 42.3601 }, // Boston, MA
    "02103": { lon: -71.0589, lat: 42.3601 }, // Boston, MA
  }

  return fallbackCoords[zipCode] || null
}

// ZIP কোড থেকে bounding box পাওয়ার ফাংশন
async function zipToBoundingBox(
  zipCode: string,
): Promise<{ minx: number; miny: number; maxx: number; maxy: number } | null> {
  try {
    // Mapbox geocoding API for ZIP codes - use search instead of direct lookup
    const url = `${BASE_URL}/${zipCode}.json`
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      country: "US",
      types: "postcode",
      limit: "1",
    })

    const response = await fetch(`${url}?${params}`, {
      method: "GET",
      headers: {
        "User-Agent": "AddressGenerator/1.0",
      },
    })

    if (!response.ok) {
      // Try alternative approach with search
      return await zipToBoundingBoxAlternative(zipCode)
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]

      // Check for bbox in the feature
      const bbox = feature.bbox || feature.geometry?.bbox
      if (bbox && bbox.length === 4) {
        return {
          minx: bbox[0],
          miny: bbox[1],
          maxx: bbox[2],
          maxy: bbox[3],
        }
      }

      // If no bbox, try to get center coordinates and create a small bounding box
      if (feature.center && feature.center.length === 2) {
        const [lon, lat] = feature.center
        const offset = 0.01 // Small offset to create bounding box
        return {
          minx: lon - offset,
          miny: lat - offset,
          maxx: lon + offset,
          maxy: lat + offset,
        }
      }
    }

    return await zipToBoundingBoxAlternative(zipCode)
  } catch (error) {
    console.error("ZIP to bounding box error:", error)
    return await zipToBoundingBoxAlternative(zipCode)
  }
}

// Alternative approach using search
async function zipToBoundingBoxAlternative(
  zipCode: string,
): Promise<{ minx: number; miny: number; maxx: number; maxy: number } | null> {
  try {
    // Use search endpoint instead
    const searchUrl = `${BASE_URL}/search.json`
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      query: zipCode,
      country: "US",
      types: "postcode",
      limit: "1",
    })

    const response = await fetch(`${searchUrl}?${params}`, {
      method: "GET",
      headers: {
        "User-Agent": "AddressGenerator/1.0",
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]

      // Check for bbox in the feature
      const bbox = feature.bbox || feature.geometry?.bbox
      if (bbox && bbox.length === 4) {
        return {
          minx: bbox[0],
          miny: bbox[1],
          maxx: bbox[2],
          maxy: bbox[3],
        }
      }

      // If no bbox, try to get center coordinates and create a small bounding box
      if (feature.center && feature.center.length === 2) {
        const [lon, lat] = feature.center
        const offset = 0.01 // Small offset to create bounding box
        return {
          minx: lon - offset,
          miny: lat - offset,
          maxx: lon + offset,
          maxy: lat + offset,
        }
      }
    }

    return null
  } catch (error) {
    console.error("ZIP search error:", error)
    return null
  }
}

// Random coordinates generate করার ফাংশন
function generateRandomCoords(bbox: { minx: number; miny: number; maxx: number; maxy: number }): {
  lon: number
  lat: number
} {
  const lon = Math.random() * (bbox.maxx - bbox.minx) + bbox.minx
  const lat = Math.random() * (bbox.maxy - bbox.miny) + bbox.miny
  return { lon, lat }
}

// Coordinates থেকে addresses পাওয়ার ফাংশন
async function coordsToAddresses(lon: number, lat: number, limit = 5): Promise<string[]> {
  try {
    const url = `${BASE_URL}/${lon},${lat}.json`
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      types: "address",
      limit: limit.toString(),
    })

    const response = await fetch(`${url}?${params}`, {
      method: "GET",
      headers: {
        "User-Agent": "AddressGenerator/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`)
    }

    const data = await response.json()

    const addresses: string[] = []

    if (data.features) {
      for (const feature of data.features) {
        if (feature.place_name) {
          addresses.push(feature.place_name)
        }
      }
    }

    return addresses
  } catch (error) {
    console.error("Coords to addresses error:", error)
    return []
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    // Get authenticated user
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required. Please login first.",
        auth_required: true 
      }, { status: 401 })
    }
    
    const user = authResult.user

    // Check rate limit before processing
    const rateLimiter = new ApiRateLimiter()
    const rateLimitResult = await rateLimiter.checkAndIncrementUsage(user.id, 'address_generator')
    
    if (!rateLimitResult.success) {
      return NextResponse.json({
        success: false,
        error: rateLimitResult.error === 'Daily limit exceeded' 
          ? `Your daily limit (${rateLimitResult.daily_limit}) has been reached. Please try again tomorrow.`
          : 'Rate limit check failed',
        rate_limit: {
          daily_count: rateLimitResult.daily_count,
          daily_limit: rateLimitResult.daily_limit,
          remaining: rateLimitResult.remaining,
          unlimited: rateLimitResult.unlimited
        }
      }, { status: 429 })
    }
    
    const { zip } = await request.json()

    if (!zip || typeof zip !== "string") {
      return NextResponse.json({ success: false, error: "ZIP কোড প্রয়োজন" }, { status: 400 })
    }

    // ZIP validation (numeric only)
    if (!/^\d+$/.test(zip)) {
      return NextResponse.json({ success: false, error: "ZIP কোড শুধুমাত্র সংখ্যা হতে পারে" }, { status: 400 })
    }

    // ZIP কোড থেকে bounding box পাওয়া
    let bbox = await zipToBoundingBox(zip)

    if (!bbox) {
      // Fallback: Use known coordinates for common ZIP codes
      const fallbackCoords = getFallbackCoordinates(zip)
      if (fallbackCoords) {
        const offset = 0.01 // Small offset to create bounding box
        bbox = {
          minx: fallbackCoords.lon - offset,
          miny: fallbackCoords.lat - offset,
          maxx: fallbackCoords.lon + offset,
          maxy: fallbackCoords.lat + offset,
        }
      } else {
        return NextResponse.json({ success: false, error: "ZIP কোড রেজলভ করতে পারছি না" }, { status: 400 })
      }
    }

    // Multiple random coordinates generate করা
    const allAddresses: string[] = []
    const attempts = 10 // বেশি addresses পাওয়ার জন্য একাধিক attempt

    for (let i = 0; i < attempts; i++) {
      const coords = generateRandomCoords(bbox)
      const addresses = await coordsToAddresses(coords.lon, coords.lat, 1)

      if (addresses.length > 0) {
        allAddresses.push(addresses[0])
      }

      // যদি 5টি addresses পেয়ে যাই তাহলে break
      if (allAddresses.length >= 5) {
        break
      }
    }

    // Duplicate addresses remove করা
    const uniqueAddresses = [...new Set(allAddresses)]

    if (uniqueAddresses.length === 0) {
      // Log failed request
      await rateLimiter.logApiRequest(
        user.id,
        'address_generator',
        { zip },
        { error: 'No addresses found' },
        false,
        'কোনো এড্রেস পাওয়া যায়নি',
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || 'unknown',
        Date.now() - startTime
      )
      
      return NextResponse.json({ success: false, error: "কোনো এড্রেস পাওয়া যায়নি" }, { status: 400 })
    }

    // Log successful request
    await rateLimiter.logApiRequest(
      user.id,
      'address_generator',
      { zip },
      { addresses: uniqueAddresses, boundingBox: bbox, count: uniqueAddresses.length },
      true,
      undefined,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      Date.now() - startTime
    )

    return NextResponse.json({
      success: true,
      addresses: uniqueAddresses,
      boundingBox: bbox,
      count: uniqueAddresses.length,
      rate_limit: {
        daily_count: rateLimitResult.daily_count,
        daily_limit: rateLimitResult.daily_limit,
        remaining: rateLimitResult.remaining,
        unlimited: rateLimitResult.unlimited
      }
    })
  } catch (error) {
    console.error(`[${requestId}] ZIP address generator error:`, error)
    return NextResponse.json({ success: false, error: "সার্ভার এরর" }, { status: 500 })
  }
}
