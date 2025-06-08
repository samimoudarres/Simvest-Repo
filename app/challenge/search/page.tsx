"use client"

import { StockSearch } from "@/components/stock-search"
import { getMultipleStocks } from "@/lib/get-stocks"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SearchPage() {
  const router = useRouter()
  const [popularStocks, setPopularStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPopularStocks = async () => {
      try {
        const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META"]
        const stocks = await getMultipleStocks(symbols)
        setPopularStocks(stocks)
      } catch (error) {
        console.error("Error fetching popular stocks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularStocks()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Search Stocks</h1>

      <StockSearch
        onStockSelect={(symbol) => router.push(`/challenge/stock/${symbol}`)}
        placeholder="Search for stocks, ETFs, crypto..."
        className="mb-6"
      />

      <h2 className="text-xl font-semibold mb-2">Popular Stocks</h2>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-md animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {popularStocks.map((stock) => (
            <button
              key={stock.symbol}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-left"
              onClick={() => router.push(`/challenge/stock/${stock.symbol}`)}
            >
              <div className="flex items-center mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-2 text-white text-xs font-bold"
                  style={{ backgroundColor: stock.logoBackground }}
                >
                  {stock.logoEmoji || stock.logoText}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{stock.symbol}</h4>
                </div>
              </div>
              <p className="font-bold text-lg">${stock.price.toFixed(2)}</p>
              <p className={`text-xs ${stock.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stock.changePercent >= 0 ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
