"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getMultipleStocks, POPULAR_STOCKS } from "@/lib/stock-data-service"

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  logoBackground: string
  logoType: string
  logoColor: string
  logoText: string
  logoEmoji: string
}

interface RealTimeStockDataProps {
  symbols?: string[]
  onDataLoaded?: (stocks: StockData[]) => void
  children: (data: { stocks: StockData[]; loading: boolean; error: string | null }) => React.ReactNode
}

export default function RealTimeStockData({
  symbols = POPULAR_STOCKS.slice(0, 8),
  onDataLoaded,
  children,
}: RealTimeStockDataProps) {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true)
        setError(null)

        const stockData = await getMultipleStocks(symbols)

        const formattedStocks = stockData.map((stock) => ({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          logoBackground: stock.logoBackground,
          logoType: stock.logoType,
          logoColor: stock.logoColor,
          logoText: stock.logoText,
          logoEmoji: stock.logoEmoji,
        }))

        setStocks(formattedStocks)
        onDataLoaded?.(formattedStocks)
      } catch (err) {
        console.error("Error fetching stock data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch stock data")
      } finally {
        setLoading(false)
      }
    }

    fetchStockData()

    // Refresh data every 5 minutes during market hours
    const interval = setInterval(fetchStockData, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [symbols, onDataLoaded])

  return <>{children({ stocks, loading, error })}</>
}
