import { type NextRequest, NextResponse } from "next/server"
import { initializeStockCache } from "@/lib/stock-data-service"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting stock cache initialization...")

    await initializeStockCache()

    return NextResponse.json({
      success: true,
      message: "Stock cache initialized successfully",
    })
  } catch (error) {
    console.error("Error initializing stock cache:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Stock cache initialization endpoint",
    usage: "POST to this endpoint to initialize the stock data cache",
  })
}
