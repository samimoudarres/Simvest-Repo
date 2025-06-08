"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StockPriceDisplayProps {
  symbol: string
  initialPrice?: number
  initialChange?: number
  initialChangePercent?: number
  showSymbol?: boolean
  size?: "sm" | "md" | "lg"
  refreshInterval?: number
}

export function StockPriceDisplay({
  symbol,
  initialPrice = 0,
  initialChange = 0,
  initialChangePercent = 0,
  showSymbol = true,
  size = "md",
  refreshInterval = 60000, // 1 minute
}: StockPriceDisplayProps) {
  const [price, setPrice] = useState(initialPrice)
  const [change, setChange] = useState(initialChange)
  const [changePercent, setChangePercent] = useState(initialChangePercent)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPositive = change >= 0
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  const fetchStockData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/stocks/${symbol}`)
      const result = await response.json()

      if (result.success) {
        setPrice(result.data.price)
        setChange(result.data.change)
        setChangePercent(result.data.changePercent)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to fetch stock data")
      console.error("Error fetching stock data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch if we don't have initial data
    if (initialPrice === 0) {
      fetchStockData()
    }

    // Set up refresh interval
    const interval = setInterval(fetchStockData, refreshInterval)

    return () => clearInterval(interval)
  }, [symbol, refreshInterval])

  if (error) {
    return <div className={`text-gray-500 ${sizeClasses[size]}`}>Error loading price</div>
  }

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      {showSymbol && <span className="font-medium text-gray-900">{symbol}</span>}

      <span className="font-semibold">${price.toFixed(2)}</span>

      <div className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="text-xs">
          {isPositive ? "+" : ""}
          {change.toFixed(2)} ({isPositive ? "+" : ""}
          {changePercent.toFixed(2)}%)
        </span>
      </div>

      {loading && <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
    </div>
  )
}
