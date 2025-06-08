// Robust Alpha Vantage API Service
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY
const BASE_URL = "https://www.alphavantage.co/query"

// Rate limiting class
class RateLimiter {
  private calls: number[] = []
  private readonly maxCalls = 5
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

export class AlphaVantageService {
  private rateLimiter = new RateLimiter()

  // Make API call with retry logic and rate limiting
  private async makeAPICall<T>(url: string, retries = 3): Promise<T> {
    // Check rate limit
    if (!this.rateLimiter.canMakeCall()) {
      const waitTime = this.rateLimiter.getWaitTime()
      console.log(`⏳ Rate limit reached, waiting ${waitTime}ms`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`📡 Alpha Vantage API call attempt ${attempt}: ${url}`)
        this.rateLimiter.recordCall()

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
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
          throw new Error(`API Limit: ${data["Note"]}`)
        }

        console.log(`✅ Alpha Vantage API call successful on attempt ${attempt}`)
        return data as T
      } catch (error) {
        console.error(`❌ Alpha Vantage API call attempt ${attempt} failed:`, error)

        if (attempt === retries) {
          throw new Error(
            `Alpha Vantage API call failed after ${retries} attempts: ${error instanceof Error ? error.message : "Unknown error"}`,
          )
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        console.log(`⏳ Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw new Error("Alpha Vantage API call failed")
  }

  // Real-time quote
  async getQuote(symbol: string): Promise<{
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    volume: number
    open: number
    high: number
    low: number
    previousClose: number
  }> {
    try {
      console.log(`📊 Fetching quote for ${symbol}`)

      const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      const response = await this.makeAPICall<any>(url)

      const quote = response["Global Quote"]
      if (!quote) {
        throw new Error("No quote data received")
      }

      const result = {
        symbol: quote["01. symbol"] || symbol,
        name: quote["01. symbol"] || symbol, // We'll get the full name from overview
        price: Number.parseFloat(quote["05. price"]) || 0,
        change: Number.parseFloat(quote["09. change"]) || 0,
        changePercent: Number.parseFloat(quote["10. change percent"]?.replace("%", "")) || 0,
        volume: Number.parseInt(quote["06. volume"]) || 0,
        open: Number.parseFloat(quote["02. open"]) || 0,
        high: Number.parseFloat(quote["03. high"]) || 0,
        low: Number.parseFloat(quote["04. low"]) || 0,
        previousClose: Number.parseFloat(quote["08. previous close"]) || 0,
      }

      console.log(`✅ Quote fetched for ${symbol}:`, result)
      return result
    } catch (error) {
      console.error(`💥 Error fetching quote for ${symbol}:`, error)
      throw error
    }
  }

  // Company overview
  async getCompanyOverview(symbol: string): Promise<{
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
  }> {
    try {
      console.log(`🏢 Fetching company overview for ${symbol}`)

      const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      const response = await this.makeAPICall<any>(url)

      const result = {
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

  // Intraday data for charts
  async getIntradayData(
    symbol: string,
    interval: "1min" | "5min" | "15min" | "30min" | "60min" = "5min",
  ): Promise<
    Array<{
      date: string
      open: number
      high: number
      low: number
      close: number
      volume: number
    }>
  > {
    try {
      console.log(`📈 Fetching intraday data for ${symbol} (${interval})`)

      const url = `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${ALPHA_VANTAGE_API_KEY}`
      const response = await this.makeAPICall<any>(url)

      const timeSeries = response[`Time Series (${interval})`]
      if (!timeSeries) {
        throw new Error("No intraday data received")
      }

      const result = Object.entries(timeSeries)
        .map(([date, data]: [string, any]) => ({
          date,
          open: Number.parseFloat(data["1. open"]) || 0,
          high: Number.parseFloat(data["2. high"]) || 0,
          low: Number.parseFloat(data["3. low"]) || 0,
          close: Number.parseFloat(data["4. close"]) || 0,
          volume: Number.parseInt(data["5. volume"]) || 0,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      console.log(`✅ Intraday data fetched for ${symbol}: ${result.length} data points`)
      return result
    } catch (error) {
      console.error(`💥 Error fetching intraday data for ${symbol}:`, error)
      throw error
    }
  }

  // Daily time series
  async getDailyData(symbol: string): Promise<
    Array<{
      date: string
      open: number
      high: number
      low: number
      close: number
      volume: number
    }>
  > {
    try {
      console.log(`📈 Fetching daily data for ${symbol}`)

      const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      const response = await this.makeAPICall<any>(url)

      const timeSeries = response["Time Series (Daily)"]
      if (!timeSeries) {
        throw new Error("No daily data received")
      }

      const result = Object.entries(timeSeries)
        .map(([date, data]: [string, any]) => ({
          date,
          open: Number.parseFloat(data["1. open"]) || 0,
          high: Number.parseFloat(data["2. high"]) || 0,
          low: Number.parseFloat(data["3. low"]) || 0,
          close: Number.parseFloat(data["4. close"]) || 0,
          volume: Number.parseInt(data["5. volume"]) || 0,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      console.log(`✅ Daily data fetched for ${symbol}: ${result.length} data points`)
      return result
    } catch (error) {
      console.error(`💥 Error fetching daily data for ${symbol}:`, error)
      throw error
    }
  }

  // Search symbols
  async searchSymbols(keywords: string): Promise<
    Array<{
      symbol: string
      name: string
      type: string
      region: string
      marketOpen: string
      marketClose: string
      timezone: string
      currency: string
      matchScore: number
    }>
  > {
    try {
      console.log(`🔍 Searching symbols for: ${keywords}`)

      const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${ALPHA_VANTAGE_API_KEY}`
      const response = await this.makeAPICall<any>(url)

      const matches = response["bestMatches"]
      if (!matches || !Array.isArray(matches)) {
        return []
      }

      const result = matches.map((match: any) => ({
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

  // Parse and normalize API responses
  parseQuoteData(data: any) {
    const quote = data["Global Quote"]
    if (!quote) return null

    return {
      symbol: quote["01. symbol"],
      price: Number.parseFloat(quote["05. price"]),
      change: Number.parseFloat(quote["09. change"]),
      changePercent: Number.parseFloat(quote["10. change percent"]?.replace("%", "")),
      volume: Number.parseInt(quote["06. volume"]),
      open: Number.parseFloat(quote["02. open"]),
      high: Number.parseFloat(quote["03. high"]),
      low: Number.parseFloat(quote["04. low"]),
      previousClose: Number.parseFloat(quote["08. previous close"]),
    }
  }

  // Utility function to check if market is open
  isMarketOpen(): boolean {
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

  // Get appropriate data based on timeframe
  async getTimeSeriesForTimeframe(symbol: string, timeframe: string) {
    try {
      switch (timeframe) {
        case "1D":
          if (this.isMarketOpen()) {
            return await this.getIntradayData(symbol, "5min")
          } else {
            const daily = await this.getDailyData(symbol)
            return daily.slice(-1) // Last day only
          }

        case "1W":
          const weekly = await this.getDailyData(symbol)
          return weekly.slice(-7) // Last 7 days

        case "1M":
          const monthly = await this.getDailyData(symbol)
          return monthly.slice(-30) // Last 30 days

        case "3M":
          const quarterly = await this.getDailyData(symbol)
          return quarterly.slice(-90) // Last 90 days

        case "6M":
          const halfYear = await this.getDailyData(symbol)
          return halfYear.slice(-180) // Last 180 days

        case "1Y":
        case "YTD":
          const yearly = await this.getDailyData(symbol)
          return yearly.slice(-365) // Last 365 days

        case "MAX":
          return await this.getDailyData(symbol) // All available data

        default:
          return await this.getDailyData(symbol)
      }
    } catch (error) {
      console.error(`Error getting time series for ${symbol} (${timeframe}):`, error)
      throw error
    }
  }
}

// Export singleton instance
export const alphaVantageService = new AlphaVantageService()
