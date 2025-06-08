import { type NextRequest, NextResponse } from "next/server"
import { getStockChartData } from "@/lib/stock-data-service"

export async function GET(request: NextRequest, { params }: { params: { symbol: string } }) {
  try {
    const symbol = params.symbol.toUpperCase()
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "1D"

    console.log(`📈 API request for chart data: ${symbol} (${timeframe})`)

    const chartData = await getStockChartData(symbol, timeframe)

    return NextResponse.json({
      success: true,
      data: chartData,
    })
  } catch (error) {
    console.error("Chart API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
