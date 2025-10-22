import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Check if GROQ_API_KEY is available
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        status: "error",
        message: "GROQ_API_KEY not configured",
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }, { status: 500 })
    }

    // Test API with a simple request
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
              content: "Test API connection. Reply with 'OK' only.",
            },
          ],
          temperature: 0.1,
          max_tokens: 10,
        }),
      },
    )

    const responseTime = Date.now() - startTime

    if (!testResponse.ok) {
      const errorData = await testResponse.json()
      return NextResponse.json({
        status: "error",
        message: "Groq API error",
        error: errorData,
        responseTime,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    const data = await testResponse.json()
    const generatedText = data.choices?.[0]?.message?.content

    return NextResponse.json({
      status: "healthy",
      message: "Email2Name API is working",
      apiResponse: generatedText,
      responseTime,
      timestamp: new Date().toISOString(),
      apiKeyConfigured: true
    })

  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - Date.now()
    }, { status: 500 })
  }
}
