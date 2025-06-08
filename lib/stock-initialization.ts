import { getStockData, POPULAR_STOCKS } from "./stock-data-service"
import { getAPIStatus } from "./alpha-vantage-api"

export async function initializeStockData(): Promise<{
  success: boolean
  apiStatus: { hasKey: boolean; keyLength: number }
  stocksLoaded: number
  errors: string[]
}> {
  console.log("🚀 Starting comprehensive stock data initialization...")

  const apiStatus = getAPIStatus()
  const errors: string[] = []
  let stocksLoaded = 0

  console.log(`📊 API Status: ${apiStatus.hasKey ? "CONFIGURED" : "MISSING"} (${apiStatus.keyLength} chars)`)

  // Load popular stocks in batches
  const batchSize = 3
  const totalBatches = Math.ceil(POPULAR_STOCKS.length / batchSize)

  for (let i = 0; i < POPULAR_STOCKS.length; i += batchSize) {
    const batch = POPULAR_STOCKS.slice(i, i + batchSize)
    const batchNumber = Math.floor(i / batchSize) + 1

    console.log(`📦 Processing batch ${batchNumber}/${totalBatches}: ${batch.join(", ")}`)

    const batchResults = await Promise.allSettled(
      batch.map(async (symbol) => {
        try {
          const stockData = await getStockData(symbol)
          console.log(`✅ Loaded ${symbol}: $${stockData.price.toFixed(2)}`)
          return stockData
        } catch (error) {
          const errorMsg = `Failed to load ${symbol}: ${error instanceof Error ? error.message : "Unknown error"}`
          console.error(`❌ ${errorMsg}`)
          errors.push(errorMsg)
          throw error
        }
      }),
    )

    // Count successful loads
    stocksLoaded += batchResults.filter((result) => result.status === "fulfilled").length

    // Wait between batches to respect rate limits
    if (i + batchSize < POPULAR_STOCKS.length) {
      console.log("⏳ Waiting 2 seconds before next batch...")
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  const result = {
    success: stocksLoaded > 0,
    apiStatus,
    stocksLoaded,
    errors,
  }

  console.log(`🎯 Initialization complete: ${stocksLoaded}/${POPULAR_STOCKS.length} stocks loaded`)
  if (errors.length > 0) {
    console.warn(`⚠️ ${errors.length} errors occurred during initialization`)
  }

  return result
}

// Quick test function for a single stock
export async function testSingleStock(symbol: string): Promise<{
  success: boolean
  data: any
  source: "api" | "cache" | "mock"
  error?: string
}> {
  try {
    console.log(`🧪 Testing single stock: ${symbol}`)
    const stockData = await getStockData(symbol)

    // Determine data source based on timestamp and other factors
    const now = new Date()
    const dataAge = now.getTime() - new Date(stockData.lastUpdated).getTime()
    const isRecent = dataAge < 5 * 60 * 1000 // Less than 5 minutes old

    let source: "api" | "cache" | "mock" = "mock"
    if (isRecent && stockData.volume > 0) {
      source = "api"
    } else if (dataAge < 60 * 60 * 1000) {
      // Less than 1 hour old
      source = "cache"
    }

    return {
      success: true,
      data: stockData,
      source,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      source: "mock",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
