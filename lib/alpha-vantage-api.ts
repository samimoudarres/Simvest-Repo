// Alpha Vantage API Integration Service with NEW API KEY
const API_KEY = "M37A3RMKQ3GJJCQ6"
const BASE_URL = "https://www.alphavantage.co/query"

console.log(`🔑 Alpha Vantage API Key Status: CONFIGURED (Length: ${API_KEY.length})`)

// Enhanced rate limiting for better performance
class RateLimiter {
  private calls: number[] = []
  private readonly maxCalls = 25 // Increased for premium key
  private readonly timeWindow = 60000 // 1 minute

  canMakeCall(): boolean {
    const now = Date.now()
    this.calls = this.calls.filter((time) => now - time < this.timeWindow)
    return this.calls.length < this.maxCalls
  }

  recordCall(): void {
    this.calls.push(Date.now())
  }

  getWaitTime(): number {
    if (this.calls.length === 0) return 0
    const oldestCall = Math.min(...this.calls)
    return Math.max(0, this.timeWindow - (Date.now() - oldestCall))
  }
}

const rateLimiter = new RateLimiter()

// Types for API responses
export type GlobalQuote = {
  symbol: string
  open: number
  high: number
  low: number
  price: number
  volume: number
  latestTradingDay: string
  previousClose: number
  change: number
  changePercent: string
}

export type CompanyOverview = {
  symbol: string
  name: string
  description: string
  sector: string
  industry: string
  marketCapitalization: number
  peRatio: number
  dividendYield: number
  eps: number
  beta: number
  week52High: number
  week52Low: number
}

export type TimeSeriesData = {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type SearchResult = {
  symbol: string
  name: string
  type: string
  region: string
  marketOpen: string
  marketClose: string
  timezone: string
  currency: string
  matchScore: number
}

// Enhanced API call with aggressive optimization
async function makeAPICall<T>(url: string, retries = 2): Promise<T> {
  // Check rate limit
  if (!rateLimiter.canMakeCall()) {
    const waitTime = rateLimiter.getWaitTime()
    console.log(`⏳ Rate limit reached, waiting ${waitTime}ms`)
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 API Call attempt ${attempt}: ${url}`)
      rateLimiter.recordCall()

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // Reduced to 5 seconds

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "StockTradingApp/1.0",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Check for API error responses
      if (data["Error Message"]) {
        throw new Error(`API Error: ${data["Error Message"]}`)
      }

      if (data["Note"]) {
        console.warn(`API Note: ${data["Note"]}`)
        throw new Error("RATE_LIMIT_EXCEEDED")
      }

      if (data["Information"]) {
        throw new Error(`API Information: ${data["Information"]}`)
      }

      console.log(`✅ API Call successful on attempt ${attempt}`)
      return data as T
    } catch (error) {
      console.error(`❌ API Call attempt ${attempt} failed:`, error)

      if (attempt === retries) {
        throw error
      }

      // Reduced retry delay for faster performance
      const delay = Math.pow(1.5, attempt) * 500
      console.log(`⏳ Retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("API call failed")
}

// Get real-time stock quote with enhanced performance
export async function getGlobalQuote(symbol: string): Promise<GlobalQuote> {
  try {
    console.log(`📊 Fetching global quote for ${symbol}`)

    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    const response = await makeAPICall<any>(url)

    // Check for different possible response formats
    let quote = response["Global Quote"]

    if (!quote) {
      // Try alternative response format
      quote = response["01. symbol"] ? response : null
    }

    if (!quote) {
      console.error(`No quote data in response for ${symbol}:`, response)
      throw new Error(`No quote data received for ${symbol}`)
    }

    // Parse the quote data with fallbacks
    const result: GlobalQuote = {
      symbol: quote["01. symbol"] || quote["symbol"] || symbol,
      open: Number.parseFloat(quote["02. open"] || quote["open"] || "0") || 0,
      high: Number.parseFloat(quote["03. high"] || quote["high"] || "0") || 0,
      low: Number.parseFloat(quote["04. low"] || quote["low"] || "0") || 0,
      price: Number.parseFloat(quote["05. price"] || quote["price"] || "0") || 0,
      volume: Number.parseInt(quote["06. volume"] || quote["volume"] || "0") || 0,
      latestTradingDay: quote["07. latest trading day"] || quote["latestTradingDay"] || "",
      previousClose: Number.parseFloat(quote["08. previous close"] || quote["previousClose"] || "0") || 0,
      change: Number.parseFloat(quote["09. change"] || quote["change"] || "0") || 0,
      changePercent: quote["10. change percent"] || quote["changePercent"] || "0%",
    }

    console.log(`✅ Global quote parsed for ${symbol}: $${result.price}`)
    return result
  } catch (error) {
    console.error(`💥 Error fetching global quote for ${symbol}:`, error)
    throw error
  }
}

// Batch quote fetching for multiple symbols
export async function getBatchQuotes(symbols: string[]): Promise<Map<string, GlobalQuote>> {
  const quotes = new Map<string, GlobalQuote>()
  const batchSize = 5 // Process in smaller batches for speed

  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize)
    const promises = batch.map((symbol) => getGlobalQuote(symbol))

    const results = await Promise.allSettled(promises)

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        quotes.set(batch[index], result.value)
      } else {
        console.error(`Failed to fetch quote for ${batch[index]}:`, result.reason)
      }
    })

    // Small delay between batches
    if (i + batchSize < symbols.length) {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  return quotes
}

// Get company overview
export async function getCompanyOverview(symbol: string): Promise<CompanyOverview> {
  try {
    console.log(`🏢 Fetching company overview for ${symbol}`)

    const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    const response = await makeAPICall<any>(url)

    const result: CompanyOverview = {
      symbol: response["Symbol"] || symbol,
      name: response["Name"] || "Unknown Company",
      description: response["Description"] || "No description available",
      sector: response["Sector"] || "Unknown",
      industry: response["Industry"] || "Unknown",
      marketCapitalization: Number.parseInt(response["MarketCapitalization"]) || 0,
      peRatio: Number.parseFloat(response["PERatio"]) || 0,
      dividendYield: Number.parseFloat(response["DividendYield"]) || 0,
      eps: Number.parseFloat(response["EPS"]) || 0,
      beta: Number.parseFloat(response["Beta"]) || 0,
      week52High: Number.parseFloat(response["52WeekHigh"]) || 0,
      week52Low: Number.parseFloat(response["52WeekLow"]) || 0,
    }

    console.log(`✅ Company overview fetched for ${symbol}`)
    return result
  } catch (error) {
    console.error(`💥 Error fetching company overview for ${symbol}:`, error)
    throw error
  }
}

// Get historical daily data
export async function getDailyTimeSeries(symbol: string): Promise<TimeSeriesData[]> {
  try {
    console.log(`📈 Fetching daily time series for ${symbol}`)

    const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
    const response = await makeAPICall<any>(url)

    const timeSeries = response["Time Series (Daily)"]
    if (!timeSeries) {
      throw new Error("No time series data received")
    }

    const result: TimeSeriesData[] = Object.entries(timeSeries)
      .map(([date, data]: [string, any]) => ({
        date,
        open: Number.parseFloat(data["1. open"]) || 0,
        high: Number.parseFloat(data["2. high"]) || 0,
        low: Number.parseFloat(data["3. low"]) || 0,
        close: Number.parseFloat(data["4. close"]) || 0,
        volume: Number.parseInt(data["5. volume"]) || 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    console.log(`✅ Daily time series fetched for ${symbol}: ${result.length} data points`)
    return result
  } catch (error) {
    console.error(`💥 Error fetching daily time series for ${symbol}:`, error)
    throw error
  }
}

// Search for stocks
export async function searchSymbols(keywords: string): Promise<SearchResult[]> {
  try {
    console.log(`🔍 Searching for symbols: ${keywords}`)

    const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${API_KEY}`
    const response = await makeAPICall<any>(url)

    const matches = response["bestMatches"]
    if (!matches || !Array.isArray(matches)) {
      return []
    }

    const result: SearchResult[] = matches.map((match: any) => ({
      symbol: match["1. symbol"] || "",
      name: match["2. name"] || "",
      type: match["3. type"] || "",
      region: match["4. region"] || "",
      marketOpen: match["5. marketOpen"] || "",
      marketClose: match["6. marketClose"] || "",
      timezone: match["7. timezone"] || "",
      currency: match["8. currency"] || "",
      matchScore: Number.parseFloat(match["9. matchScore"]) || 0,
    }))

    console.log(`✅ Symbol search completed: ${result.length} results`)
    return result
  } catch (error) {
    console.error(`💥 Error searching symbols for ${keywords}:`, error)
    throw error
  }
}

// Utility function to check if market is open
export function isMarketOpen(): boolean {
  const now = new Date()
  const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
  const day = easternTime.getDay()
  const hour = easternTime.getHours()
  const minute = easternTime.getMinutes()
  const timeInMinutes = hour * 60 + minute

  // Market is closed on weekends
  if (day === 0 || day === 6) return false

  // Market hours: 9:30 AM - 4:00 PM EST
  const marketOpen = 9 * 60 + 30 // 9:30 AM
  const marketClose = 16 * 60 // 4:00 PM

  return timeInMinutes >= marketOpen && timeInMinutes < marketClose
}

// Get appropriate time series based on timeframe
export async function getTimeSeriesForTimeframe(symbol: string, timeframe: string): Promise<TimeSeriesData[]> {
  try {
    switch (timeframe) {
      case "1D":
        const daily = await getDailyTimeSeries(symbol)
        return daily.slice(-1) // Last day only

      case "1W":
        const weekly = await getDailyTimeSeries(symbol)
        return weekly.slice(-7) // Last 7 days

      case "1M":
        const monthly = await getDailyTimeSeries(symbol)
        return monthly.slice(-30) // Last 30 days

      case "3M":
        const quarterly = await getDailyTimeSeries(symbol)
        return quarterly.slice(-90) // Last 90 days

      case "6M":
        const halfYear = await getDailyTimeSeries(symbol)
        return halfYear.slice(-180) // Last 180 days

      case "1Y":
      case "YTD":
        const yearly = await getDailyTimeSeries(symbol)
        return yearly.slice(-365) // Last 365 days

      case "MAX":
        return await getDailyTimeSeries(symbol) // All available data

      default:
        return await getDailyTimeSeries(symbol)
    }
  } catch (error) {
    console.error(`Error getting time series for ${symbol} (${timeframe}):`, error)
    throw error
  }
}

// Check API status
export function getAPIStatus(): { hasKey: boolean; keyLength: number } {
  return {
    hasKey: Boolean(API_KEY && API_KEY.length > 0),
    keyLength: API_KEY ? API_KEY.length : 0,
  }
}
