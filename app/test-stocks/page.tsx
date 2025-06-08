"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StockPriceDisplay } from "@/components/stock-price-display"
import { Loader2, RefreshCw } from "lucide-react"

export default function TestStocksPage() {
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(false)
  const [stockSymbol, setStockSymbol] = useState("AAPL")
  const [stockData, setStockData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const initializeCache = async () => {
    try {
      setInitLoading(true)
      setError(null)

      const response = await fetch("/api/stocks/init", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        alert("Stock cache initialized successfully!")
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to initialize cache")
      console.error("Error:", err)
    } finally {
      setInitLoading(false)
    }
  }

  const fetchStock = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/stocks/${stockSymbol}`)
      const result = await response.json()

      if (result.success) {
        setStockData(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to fetch stock data")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alpha Vantage Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={initializeCache} disabled={initLoading} variant="outline">
              {initLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Initialize Stock Cache
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              value={stockSymbol}
              onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
              placeholder="Enter stock symbol (e.g., AAPL)"
              className="max-w-xs"
            />
            <Button onClick={fetchStock} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Fetch Stock Data
            </Button>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

          {stockData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: stockData.logoBackground }}
                  >
                    {stockData.logoEmoji || stockData.logoText}
                  </div>
                  {stockData.name} ({stockData.symbol})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Price</p>
                    <p className="text-2xl font-bold">${stockData.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Change</p>
                    <p className={`text-lg font-semibold ${stockData.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stockData.change >= 0 ? "+" : ""}
                      {stockData.change.toFixed(2)}({stockData.change >= 0 ? "+" : ""}
                      {stockData.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Volume</p>
                    <p className="text-lg">{stockData.volume.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Market Cap</p>
                    <p className="text-lg">${(stockData.marketCap / 1000000000).toFixed(1)}B</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sector</p>
                    <p className="text-lg">{stockData.sector}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">P/E Ratio</p>
                    <p className="text-lg">{stockData.peRatio.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-sm">{stockData.description}</p>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-sm">{new Date(stockData.lastUpdated).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Stock Price Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Popular Stocks</p>
            <div className="space-y-2">
              <StockPriceDisplay symbol="AAPL" />
              <StockPriceDisplay symbol="MSFT" />
              <StockPriceDisplay symbol="GOOGL" />
              <StockPriceDisplay symbol="TSLA" />
              <StockPriceDisplay symbol="NVDA" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
