import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory cache (in production, use Redis or similar)
let healthCache: {
  status: string
  timestamp: number
  responseTime: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const now = Date.now()
    
    // Check if we have a valid cached result
    if (healthCache && (now - healthCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        status: "cached",
        message: "Using cached health check result",
        cachedResult: healthCache,
        timestamp: new Date().toISOString()
      })
    }
    
    // Perform actual health check
    const startTime = Date.now()
    
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      const errorResult = {
        status: "error",
        message: "GROQ_API_KEY not configured",
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }
      
      // Cache the error result too
      healthCache = {
        status: "error",
        timestamp: now,
        responseTime: Date.now() - startTime
      }
      
      return NextResponse.json(errorResult, { status: 500 })
    }

    // Test API with minimal request
    const testResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: "OK", // Minimal request
            },
          ],
          temperature: 0.1,
          max_tokens: 1, // Just 1 token
        }),
      },
    )

    const responseTime = Date.now() - startTime

    if (!testResponse.ok) {
      const errorData = await testResponse.json()
      const errorResult = {
        status: "error",
        message: "Groq API error",
        error: errorData,
        responseTime,
        timestamp: new Date().toISOString()
      }
      
      // Cache error result
      healthCache = {
        status: "error",
        timestamp: now,
        responseTime
      }
      
      return NextResponse.json(errorResult, { status: 500 })
    }

    const data = await testResponse.json()
    const generatedText = data.choices?.[0]?.message?.content

    const successResult = {
      status: "healthy",
      message: "Email2Name API is working",
      apiResponse: generatedText,
      responseTime,
      timestamp: new Date().toISOString(),
      apiKeyConfigured: true
    }
    
    // Cache success result
    healthCache = {
      status: "healthy",
      timestamp: now,
      responseTime
    }

    return NextResponse.json(successResult)

  } catch (error) {
    const errorResult = {
      status: "error",
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - Date.now()
    }
    
    // Cache error result
    healthCache = {
      status: "error",
      timestamp: Date.now(),
      responseTime: 0
    }
    
    return NextResponse.json(errorResult, { status: 500 })
  }
}
