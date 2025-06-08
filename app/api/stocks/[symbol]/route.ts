import { type NextRequest, NextResponse } from "next/server"
import { getStockData } from "@/lib/stock-data-service"

export async function GET(request: NextRequest, { params }: { params: { symbol: string } }) {
  try {
    const symbol = params.symbol.toUpperCase()
    console.log(`📡 API request for stock: ${symbol}`)

    const stockData = await getStockData(symbol)

    return NextResponse.json({
      success: true,
      data: stockData,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
