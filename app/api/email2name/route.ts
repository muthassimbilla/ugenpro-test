import { type NextRequest, NextResponse } from "next/server"
import { addApiRequest } from "../admin/api-stats/route"
import { ApiRateLimiter } from "@/lib/api-rate-limiter"
import { getAuthenticatedUser } from "@/lib/api-auth-helper"

const SYSTEM_PROMPT = `Generate a realistic US first and last name and gender using ONLY the email. Use email letters for initials, no middle names, short and realistic. 

Return format:
Full Name: [first last]
Gender: [male/female]

Example:
Full Name: John Smith
Gender: male`

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    // Get authenticated user
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.isAuthenticated) {
      addApiRequest(false, Date.now() - startTime, "Authentication required", "", requestId)
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required. Please login first.",
        auth_required: true 
      }, { status: 401 })
    }
    
    const user = authResult.user

    // Check rate limit before processing
    const rateLimiter = new ApiRateLimiter()
    const rateLimitResult = await rateLimiter.checkAndIncrementUsage(user.id, 'email2name')
    
    if (!rateLimitResult.success) {
      addApiRequest(false, Date.now() - startTime, "Rate limit exceeded", "", requestId)
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
    
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      addApiRequest(false, Date.now() - startTime, "Invalid email address", email, requestId)
      // Log to our new system as well
      await rateLimiter.logApiRequest(
        user.id,
        'email2name',
        { email },
        { error: 'Invalid email address' },
        false,
        'Invalid email address',
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || 'unknown',
        Date.now() - startTime
      )
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 })
    }

    // Log usage for monitoring
    console.log(`[${requestId}] Email2Name API called for: ${email}`)
    
    // Log request details
    console.log(`[${requestId}] Request details:`, {
      email: email,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })

    // Check if GROQ_API_KEY is available
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      addApiRequest(false, Date.now() - startTime, "GROQ_API_KEY not configured", email, requestId)
      return NextResponse.json(
        { success: false, error: "GROQ_API_KEY not configured. Please add it to your environment variables." },
        { status: 500 },
      )
    }

    // Call Groq API (OpenAI-compatible)
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Email: ${email}` },
          ],
          temperature: 0.2,
          max_tokens: 40,
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`[${requestId}] Groq API error:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        email: email,
        timestamp: new Date().toISOString()
      })
      
      // Check for quota exceeded error
      if (errorData.error?.message?.includes("quota") || errorData.error?.message?.includes("limit")) {
        console.error(`[${requestId}] GROQ QUOTA EXCEEDED for email: ${email}`)
        addApiRequest(false, Date.now() - startTime, "API quota exceeded", email, requestId)
        return NextResponse.json(
          { 
            success: false, 
            error: "Groq API quota exceeded. Please check your API key limits or upgrade your plan.",
            requestId: requestId,
            timestamp: new Date().toISOString()
          },
          { status: 429 },
        )
      }
      
      addApiRequest(false, Date.now() - startTime, errorData.error?.message || "Unknown error", email, requestId)
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to generate name from email using Groq: ${errorData.error?.message || "Unknown error"}`,
          requestId: requestId,
          timestamp: new Date().toISOString()
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    const generatedText = data.choices?.[0]?.message?.content

    if (!generatedText) {
      addApiRequest(false, Date.now() - startTime, "No response from AI", email, requestId)
      return NextResponse.json({ success: false, error: "No response from AI" }, { status: 500 })
    }

    // Parse the response with improved logic
    const result = {
      fullName: "",
      firstName: "",
      lastName: "",
      gender: "",
      country: "US", // Always set to US
      type: "Personal", // Default type
    }

    // Clean the response text
    const cleanText = generatedText.trim()
    
    // Try to parse different response formats
    const lines = cleanText.split(/[\n,]/)
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Look for "Full Name:" pattern
      if (trimmedLine.toLowerCase().includes("full name")) {
        const match = trimmedLine.match(/full name:\s*(.+)/i)
        if (match) {
          const fullName = match[1].trim().replace(/[,;:]+$/, "")
          result.fullName = fullName
          
          // Split full name into first and last name
          const nameParts = fullName.split(" ")
          if (nameParts.length >= 2) {
            result.firstName = nameParts[0]
            result.lastName = nameParts.slice(1).join(" ")
          } else if (nameParts.length === 1) {
            result.firstName = nameParts[0]
            result.lastName = ""
          }
        }
      }
      
      // Look for "Gender:" pattern
      if (trimmedLine.toLowerCase().includes("gender")) {
        const match = trimmedLine.match(/gender:\s*(.+)/i)
        if (match) {
          result.gender = match[1].trim().toLowerCase()
        }
      }
    }
    
    // Fallback: if no structured format found, try to extract from single line
    if (!result.fullName && !result.gender) {
      // Try to parse format like "John Doe, male" or "John Doe, Gender: male"
      const fallbackMatch = cleanText.match(/^([^,]+?)(?:,\s*(?:gender:\s*)?(male|female))?$/i)
      if (fallbackMatch) {
        const fullName = fallbackMatch[1].trim()
        result.fullName = fullName
        
        // Split full name
        const nameParts = fullName.split(" ")
        if (nameParts.length >= 2) {
          result.firstName = nameParts[0]
          result.lastName = nameParts.slice(1).join(" ")
        } else if (nameParts.length === 1) {
          result.firstName = nameParts[0]
          result.lastName = ""
        }
        
        // Extract gender if present
        if (fallbackMatch[2]) {
          result.gender = fallbackMatch[2].toLowerCase()
        }
      }
    }

    const responseTime = Date.now() - startTime
    
    // Log to both old and new systems
    addApiRequest(true, responseTime)
    await rateLimiter.logApiRequest(
      user.id,
      'email2name',
      { email },
      { 
        result: result,
        responseTime: responseTime
      },
      true,
      undefined,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      responseTime
    )
    
    console.log(`[${requestId}] Successfully generated name for: ${email}`, {
      result: result,
      responseTime: responseTime,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      data: result,
      requestId: requestId,
      timestamp: new Date().toISOString(),
      rate_limit: {
        daily_count: rateLimitResult.daily_count,
        daily_limit: rateLimitResult.daily_limit,
        remaining: rateLimitResult.remaining,
        unlimited: rateLimitResult.unlimited
      }
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    const email = (await request.json().catch(() => ({}))).email || 'unknown'
    addApiRequest(false, responseTime, error instanceof Error ? error.message : "Unknown error", email, requestId)
    
    console.error(`[${requestId}] Email2Name API error:`, {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      email: email,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error",
      requestId: requestId,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
