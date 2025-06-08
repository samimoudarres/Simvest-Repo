"use client"

import { useState, useEffect } from "react"
import { getMultipleStocks, POPULAR_STOCKS } from "@/lib/stock-data-service"
import type { EnhancedStock } from "@/lib/stock-data-service"

interface StockSectionProps {
  title: string
  category: "popular" | "crypto" | "etf"
  onStockClick?: (symbol: string) => void
}

export default function StockSectionReal({ title, category, onStockClick }: StockSectionProps) {
  const [stocks, setStocks] = useState<EnhancedStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Define stock symbols by category
  const stocksByCategory = {
    popular: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX"],
    crypto: ["BTC-USD", "ETH-USD", "SOL-USD", "ADA-USD"],
    etf: ["SPY", "QQQ", "VTI", "ARKK"],
  }

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true)
        setError(null)

        const symbols = stocksByCategory[category] || POPULAR_STOCKS.slice(0, 8)
        const stockData = await getMultipleStocks(symbols)

        setStocks(stockData)
      } catch (err) {
        console.error("Error fetching stocks:", err)
        setError("Failed to load stocks")
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
  }, [category])

  const handleStockClick = (symbol: string) => {
    if (onStockClick) {
      onStockClick(symbol)
    }
  }

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3 ml-1">
          <h2 className="text-lg font-bold">{title}</h2>
          <button className="text-[#0052cc] text-sm font-medium">See All</button>
        </div>
        <div className="flex overflow-x-auto -mx-4 px-4 pb-4 scrollbar-hidden">
          <div className="flex space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-md w-40 flex-shrink-0 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3 ml-1">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3 ml-1">
        <h2 className="text-lg font-bold">{title}</h2>
        <button className="text-[#0052cc] text-sm font-medium transition-transform duration-100 active:scale-95">
          See All
        </button>
      </div>

      <div className="flex overflow-x-auto -mx-4 px-4 pb-4 scrollbar-hidden">
        <div className="flex space-x-3">
          {stocks.map((stock) => {
            const isPositive = stock.changePercent >= 0

            return (
              <button
                key={stock.symbol}
                className="bg-white rounded-xl p-4 shadow-md w-40 flex-shrink-0 hover:shadow-lg transition-shadow text-left"
                onClick={() => handleStockClick(stock.symbol)}
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

                <div className="mb-1">
                  <p className="font-bold text-lg">${stock.price.toFixed(2)}</p>
                </div>

                <div className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {isPositive ? "+" : ""}
                  {stock.changePercent.toFixed(2)}%
                </div>

                <div className="mt-2 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <div className="text-xs text-gray-500">Vol: {(stock.volume / 1000000).toFixed(1)}M</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
