import { type NextRequest, NextResponse } from "next/server"
import { getGlobalQuote } from "@/lib/alpha-vantage-api"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol") || "AAPL"

  try {
    console.log(`Testing Alpha Vantage API for symbol: ${symbol}`)

    // Check if API key is configured
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Alpha Vantage API key not configured",
          details: "Please set ALPHA_VANTAGE_API_KEY environment variable",
        },
        { status: 500 },
      )
    }

    console.log(`API Key configured: ${apiKey.substring(0, 8)}...`)

    // Test the API call
    const quote = await getGlobalQuote(symbol)

    return NextResponse.json({
      success: true,
      symbol,
      quote,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Alpha Vantage test failed:", error)

    return NextResponse.json(
      {
        error: "Alpha Vantage API test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        symbol,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
