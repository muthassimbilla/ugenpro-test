import { NextResponse } from "next/server"

// API endpoint to check current version
export async function GET() {
  const version = process.env.VERCEL_GIT_COMMIT_SHA || process.env.npm_package_version || Date.now().toString()

  const buildTime = process.env.VERCEL_GIT_COMMIT_DATE || new Date().toISOString()

  return NextResponse.json({
    version,
    buildTime,
    timestamp: Date.now(),
  })
}
