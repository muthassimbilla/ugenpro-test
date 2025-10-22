import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const isConfigured = !!(
      supabaseUrl &&
      supabaseUrl !== "https://your-project.supabase.co" &&
      supabaseKey &&
      supabaseKey !== "your-anon-key"
    )

    return NextResponse.json({
      success: true,
      data: {
        isConfigured,
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "Not set",
        keyPreview: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : "Not set",
        environment: process.env.NODE_ENV,
        platform: process.env.VERCEL ? "Vercel" : "Local",
      },
    })
  } catch (error: any) {
    console.error("Environment check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check environment variables",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
