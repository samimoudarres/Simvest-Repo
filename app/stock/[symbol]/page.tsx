"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react"
import MobileContainer from "@/components/mobile-container"
import BottomNavigation from "@/components/bottom-navigation"
import { getStockData, getStockChartData, type EnhancedStock } from "@/lib/stock-data-service"
import type { TimeSeriesData } from "@/lib/alpha-vantage-api"

export default function StockDetailPage({ params }: { params: { symbol: string } }) {
  const router = useRouter()
  const [stock, setStock] = useState<EnhancedStock | null>(null)
  const [chartData, setChartData] = useState<TimeSeriesData[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D")
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const timeframes = ["1D", "1W", "1M", "3M", "6M", "1Y"]

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        console.log("📊 Fetching stock data for:", params.symbol)
        setLoading(true)
        setError(null)

        const [stockData, initialChartData] = await Promise.all([
          getStockData(params.symbol),
          getStockChartData(params.symbol, "1D"),
        ])

        setStock(stockData)
        setChartData(initialChartData)
        console.log("✅ Stock data loaded:", stockData)
      } catch (err) {
        console.error("❌ Error fetching stock data:", err)
        setError("Failed to load stock data")
      } finally {
        setLoading(false)
      }
    }

    fetchStockData()
  }, [params.symbol])

  const handleTimeframeChange = async (timeframe: string) => {
    if (timeframe === selectedTimeframe || !stock) return

    try {
      setChartLoading(true)
      setSelectedTimeframe(timeframe)

      const newChartData = await getStockChartData(stock.symbol, timeframe)
      setChartData(newChartData)
    } catch (err) {
      console.error("❌ Error fetching chart data:", err)
    } finally {
      setChartLoading(false)
    }
  }

  const handleTrade = (action: "buy" | "sell") => {
    if (!stock) return
    router.push(`/challenge/stock/${stock.symbol}/trade?action=${action}`)
  }

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex flex-col min-h-screen bg-white pb-20">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={48} className="animate-spin text-[#f7b104] mx-auto mb-4" />
              <p className="text-gray-600">Loading stock data...</p>
            </div>
          </div>
          <BottomNavigation />
        </div>
      </MobileContainer>
    )
  }

  if (error || !stock) {
    return (
      <MobileContainer>
        <div className="flex flex-col min-h-screen bg-white pb-20">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Stock Not Found</h2>
              <p className="text-gray-600 mb-4">{error || `Unable to load data for ${params.symbol}`}</p>
              <button
                onClick={() => router.back()}
                className="bg-[#f7b104] text-white px-6 py-2 rounded-lg transition-all duration-200 active:scale-95"
              >
                Go Back
              </button>
            </div>
          </div>
          <BottomNavigation />
        </div>
      </MobileContainer>
    )
  }

  // Simple chart visualization
  const renderChart = () => {
    if (chartLoading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#f7b104]" />
        </div>
      )
    }

    if (chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No chart data available</p>
        </div>
      )
    }

    const maxPrice = Math.max(...chartData.map((d) => d.high))
    const minPrice = Math.min(...chartData.map((d) => d.low))
    const priceRange = maxPrice - minPrice

    return (
      <div className="h-64 relative">
        <svg width="100%" height="100%" className="overflow-visible">
          <polyline
            fill="none"
            stroke="#f7b104"
            strokeWidth="2"
            points={chartData
              .map((data, index) => {
                const x = (index / (chartData.length - 1)) * 100
                const y = ((maxPrice - data.close) / priceRange) * 100
                return `${x},${y}`
              })
              .join(" ")}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    )
  }

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen bg-white pb-20">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 active:scale-95"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
          </div>

          <div className="flex items-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mr-4 text-white font-bold text-xl"
              style={{ backgroundColor: stock.logoBackground }}
            >
              {stock.logoEmoji || stock.logoText}
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">{stock.symbol}</h1>
              <p className="text-white/90 text-lg">{stock.name}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-white text-4xl font-bold mb-2">${stock.price.toFixed(2)}</p>
            <div className="flex items-center justify-center mb-2">
              {stock.changePercent >= 0 ? (
                <TrendingUp size={20} className="text-white mr-2" />
              ) : (
                <TrendingDown size={20} className="text-white mr-2" />
              )}
              <span className="text-white text-lg">
                {stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)} ({stock.changePercent >= 0 ? "+" : ""}
                {stock.changePercent.toFixed(2)}%)
              </span>
            </div>
            <p className="text-white/80 text-sm">Last updated: {new Date(stock.lastUpdated).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="p-5">
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Price Chart</h3>
              <div className="flex space-x-1">
                {timeframes.map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => handleTimeframeChange(timeframe)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                      selectedTimeframe === timeframe
                        ? "bg-[#f7b104] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
            {renderChart()}
          </div>

          {/* Stock Info */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <h3 className="font-bold text-lg mb-4">Stock Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Market Cap</p>
                <p className="font-bold">{stock.marketCap > 0 ? `$${(stock.marketCap / 1e9).toFixed(1)}B` : "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">P/E Ratio</p>
                <p className="font-bold">{stock.peRatio > 0 ? stock.peRatio.toFixed(2) : "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">52W High</p>
                <p className="font-bold">${stock.week52High > 0 ? stock.week52High.toFixed(2) : "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">52W Low</p>
                <p className="font-bold">${stock.week52Low > 0 ? stock.week52Low.toFixed(2) : "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Sector</p>
                <p className="font-bold">{stock.sector}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Volume</p>
                <p className="font-bold">{stock.volume.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Company Description */}
          {stock.description && stock.description !== "No description available" && (
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <h3 className="font-bold text-lg mb-4">About {stock.name}</h3>
              <p className="text-gray-700 leading-relaxed">{stock.description}</p>
            </div>
          )}

          {/* Trade Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTrade("buy")}
              className="bg-green-500 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 active:scale-95 hover:bg-green-600"
            >
              BUY
            </button>
            <button
              onClick={() => handleTrade("sell")}
              className="bg-red-500 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 active:scale-95 hover:bg-red-600"
            >
              SELL
            </button>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </MobileContainer>
  )
}
