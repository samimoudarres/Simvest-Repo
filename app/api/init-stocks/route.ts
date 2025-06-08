import { NextResponse } from "next/server"
import { initializeStockData, testSingleStock } from "@/lib/stock-initialization"

export async function POST() {
  try {
    console.log("🚀 Starting stock system initialization...")

    const initResult = await initializeStockData()

    // Test a few key stocks
    const testSymbols = ["AAPL", "NVDA", "TSLA"]
    const testResults = await Promise.all(testSymbols.map((symbol) => testSingleStock(symbol)))

    return NextResponse.json({
      success: true,
      initialization: initResult,
      tests: testResults.reduce(
        (acc, result, index) => {
          acc[testSymbols[index]] = result
          return acc
        },
        {} as Record<string, any>,
      ),
      message: `Stock system initialized: ${initResult.stocksLoaded} stocks loaded`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Stock initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Quick status check
    const testResults = await Promise.all([testSingleStock("AAPL"), testSingleStock("NVDA"), testSingleStock("TSLA")])

    return NextResponse.json({
      success: true,
      status: "Stock system operational",
      tests: {
        AAPL: testResults[0],
        NVDA: testResults[1],
        TSLA: testResults[2],
      },
      timestamp: new Date().toISOString(),
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
