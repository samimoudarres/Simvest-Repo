"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { getMultipleStocks, POPULAR_STOCKS, type EnhancedStock } from "@/lib/stock-data-service"

export default function StockSectionEnhanced() {
  const router = useRouter()
  const [stocks, setStocks] = useState<EnhancedStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        console.log("📊 Fetching popular stocks...")
        setLoading(true)
        setError(null)

        // Fetch top 8 popular stocks
        const popularSymbols = POPULAR_STOCKS.slice(0, 8)
        const stockData = await getMultipleStocks(popularSymbols)

        setStocks(stockData)
        console.log("✅ Stocks loaded:", stockData.length)
      } catch (err) {
        console.error("❌ Error fetching stocks:", err)
        setError("Failed to load stock data")
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
  }, [])

  const handleStockClick = (symbol: string) => {
    router.push(`/stock/${symbol}`)
  }

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Popular Stocks</h2>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-md animate-pulse">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Popular Stocks</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Stocks</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 active:scale-95"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Popular Stocks</h2>
        <button
          className="text-[#f7b104] text-sm font-medium hover:underline transition-all duration-200 active:scale-95"
          onClick={() => router.push("/category/popular")}
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stocks.map((stock) => (
          <button
            key={stock.symbol}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 text-left"
            onClick={() => handleStockClick(stock.symbol)}
          >
            <div className="flex items-center mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white font-bold text-sm"
                style={{ backgroundColor: stock.logoBackground }}
              >
                {stock.logoEmoji || stock.logoText}
              </div>
              <div>
                <p className="font-bold text-sm">{stock.symbol}</p>
                <p className="text-gray-500 text-xs truncate">{stock.name}</p>
              </div>
            </div>

            <p className="font-bold text-lg mb-1">${stock.price.toFixed(2)}</p>
            <div className="flex items-center">
              {stock.changePercent >= 0 ? (
                <TrendingUp size={14} className="text-green-500 mr-1" />
              ) : (
                <TrendingDown size={14} className="text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${stock.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stock.changePercent >= 0 ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
