import { type NextRequest, NextResponse } from "next/server"
import { searchStocks } from "@/lib/stock-data-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Query must be at least 2 characters long",
        },
        { status: 400 },
      )
    }

    console.log(`🔍 API search request: ${query}`)

    const results = await searchStocks(query)

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error("Error searching stocks:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      },
      { status: 500 },
    )
  }
}
