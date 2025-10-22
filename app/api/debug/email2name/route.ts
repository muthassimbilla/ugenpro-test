import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email') || 'test@example.com'
    
    console.log(`[DEBUG] Testing Email2Name API with email: ${testEmail}`)
    
    // Check environment variables
    const apiKey = process.env.GROQ_API_KEY
    const hasApiKey = !!apiKey
    const apiKeyPreview = apiKey ? `${apiKey.substring(0, 8)}...` : 'Not set'
    
    // Test the actual API call
    let apiTestResult = null
    let apiError = null
    
    if (hasApiKey) {
      try {
        const response = await fetch(
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
                  content: `Generate a name for this email: ${testEmail}. Reply with: Full Name: John Doe, First Name: John, Last Name: Doe, Gender: male, Country: US, Type: Personal`,
                },
              ],
              temperature: 0.7,
              max_tokens: 200,
            }),
          },
        )

        if (response.ok) {
          const data = await response.json()
          apiTestResult = {
            success: true,
            response: data,
            status: response.status,
            statusText: response.statusText
          }
        } else {
          const errorData = await response.json()
          apiError = {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          }
        }
      } catch (error) {
        apiError = {
          type: 'network_error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    const responseTime = Date.now() - startTime
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      environment: {
        hasApiKey,
        apiKeyPreview,
        nodeEnv: process.env.NODE_ENV
      },
      testEmail,
      apiTest: apiTestResult,
      apiError,
      recommendations: []
    }
    
    // Add recommendations based on results
    if (!hasApiKey) {
      debugInfo.recommendations.push("Set LONGCAT_API_KEY in your environment variables")
    }
    
    if (apiError) {
      if (apiError.status === 429) {
        debugInfo.recommendations.push("API quota exceeded - check your Longcat API limits")
      } else if (apiError.status === 403) {
        debugInfo.recommendations.push("API key invalid or permissions issue")
      } else if (apiError.type === 'network_error') {
        debugInfo.recommendations.push("Network connectivity issue")
      }
    }
    
    if (apiTestResult) {
      debugInfo.recommendations.push("API is working correctly")
    }
    
    return NextResponse.json({
      status: "success",
      debug: debugInfo
    })
    
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
