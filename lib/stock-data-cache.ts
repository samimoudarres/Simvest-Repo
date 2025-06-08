// Aggressive caching system for instant loading
class StockDataCache {
  private cache = new Map<string, any>()
  private cacheExpiry = new Map<string, number>()
  private readonly CACHE_DURATION = 30000 // 30 seconds for real-time data
  private readonly BACKGROUND_REFRESH_THRESHOLD = 15000 // 15 seconds

  set(key: string, data: any): void {
    this.cache.set(key, data)
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION)
  }

  get(key: string): any | null {
    if (this.isExpired(key)) {
      this.cache.delete(key)
      this.cacheExpiry.delete(key)
      return null
    }
    return this.cache.get(key)
  }

  isExpired(key: string): boolean {
    const expiry = this.cacheExpiry.get(key)
    return !expiry || Date.now() > expiry
  }

  needsBackgroundRefresh(key: string): boolean {
    const expiry = this.cacheExpiry.get(key)
    if (!expiry) return true
    return Date.now() > expiry - this.BACKGROUND_REFRESH_THRESHOLD
  }

  clear(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  size(): number {
    return this.cache.size
  }

  // Get all cached symbols for pre-loading
  getCachedSymbols(): string[] {
    const symbols: string[] = []
    for (const key of this.cache.keys()) {
      if (key.startsWith("quote_")) {
        symbols.push(key.replace("quote_", ""))
      }
    }
    return symbols
  }
}

export const stockDataCache = new StockDataCache()

// Background refresh manager
class BackgroundRefreshManager {
  private refreshQueue = new Set<string>()
  private isProcessing = false

  addToQueue(symbol: string): void {
    this.refreshQueue.add(symbol)
    this.processQueue()
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.refreshQueue.size === 0) return

    this.isProcessing = true

    try {
      const symbols = Array.from(this.refreshQueue)
      this.refreshQueue.clear()

      // Process in batches to respect rate limits
      const batchSize = 3
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize)
        await Promise.allSettled(batch.map((symbol) => this.refreshSymbol(symbol)))

        // Wait between batches
        if (i + batchSize < symbols.length) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }
    } finally {
      this.isProcessing = false
    }
  }

  private async refreshSymbol(symbol: string): Promise<void> {
    try {
      const { alphaVantageService } = await import("./alpha-vantage-service")
      const fresh = await alphaVantageService.getQuote(symbol)
      stockDataCache.set(`quote_${symbol}`, fresh)

      // Emit event for UI updates
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("stockDataUpdated", {
            detail: { symbol, data: fresh },
          }),
        )
      }
    } catch (error) {
      console.warn(`Background refresh failed for ${symbol}:`, error)
    }
  }
}

export const backgroundRefreshManager = new BackgroundRefreshManager()
