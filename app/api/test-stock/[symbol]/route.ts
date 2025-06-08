import { type NextRequest, NextResponse } from "next/server"
import { getStockData } from "@/lib/stock-data-service"
import { getGlobalQuote } from "@/lib/alpha-vantage-api"

export async function GET(request: NextRequest, { params }: { params: { symbol: string } }) {
  try {
    const symbol = params.symbol.toUpperCase()

    console.log(`🧪 Testing stock data fetch for ${symbol}`)

    // Test both direct API call and service call
    const [directAPIResult, serviceResult] = await Promise.allSettled([getGlobalQuote(symbol), getStockData(symbol)])

    const response = {
      symbol,
      timestamp: new Date().toISOString(),
      directAPI: {
        status: directAPIResult.status,
        data: directAPIResult.status === "fulfilled" ? directAPIResult.value : null,
        error: directAPIResult.status === "rejected" ? directAPIResult.reason?.message : null,
      },
      service: {
        status: serviceResult.status,
        data: serviceResult.status === "fulfilled" ? serviceResult.value : null,
        error: serviceResult.status === "rejected" ? serviceResult.reason?.message : null,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Test endpoint error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        symbol: params.symbol,
      },
      { status: 500 },
    )
  }
}
