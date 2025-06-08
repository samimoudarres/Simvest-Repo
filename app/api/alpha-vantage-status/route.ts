import { NextResponse } from "next/server"
import { getAPIStatus } from "@/lib/alpha-vantage-api"

export async function GET() {
  try {
    const status = getAPIStatus()

    return NextResponse.json({
      success: true,
      hasAPIKey: status.hasKey,
      keyLength: status.keyLength,
      message: status.hasKey
        ? "Alpha Vantage API key is configured"
        : "Alpha Vantage API key is missing - using mock data",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
