"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MoreVertical, ChevronDown } from "lucide-react"
import { getStockData, getStockChartData } from "@/lib/stock-data-service"
import type { StockData, ChartDataPoint } from "@/lib/stock-data-service"

export default function ChallengeStockDetailPage({ params }: { params: { symbol: string } }) {
  const router = useRouter()
  const [stock, setStock] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("1D")
  const [showStats, setShowStats] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true)
      try {
        const stockData = await getStockData(params.symbol)
        setStock(stockData)
      } catch (error) {
        console.error("Error fetching stock data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStock()
  }, [params.symbol])

  const fetchChartData = async (timeframe: string) => {
    setChartLoading(true)
    try {
      const data = await getStockChartData(params.symbol, timeframe)
      setChartData(data)
    } catch (error) {
      console.error("Error fetching chart data:", error)
    } finally {
      setChartLoading(false)
    }
  }

  useEffect(() => {
    if (stock) {
      fetchChartData(timeframe)
    }
  }, [stock, timeframe])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="transition-all duration-200 active:scale-95">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">NOV. 2024 STOCK CHALLENGE</h1>
          <button className="transition-all duration-200 active:scale-95">
            <MoreVertical size={24} className="text-white" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f7b104] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading stock data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="flex flex-col min-h-screen bg-white p-5">
        <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="transition-all duration-200 active:scale-95">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">NOV. 2024 STOCK CHALLENGE</h1>
          <button className="transition-all duration-200 active:scale-95">
            <MoreVertical size={24} className="text-white" />
          </button>
        </div>
        <div className="p-5">
          <h2 className="text-2xl font-bold mb-3">Stock Not Found</h2>
          <p>The stock you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const isPositive = stock.changePercent > 0
  const color = isPositive ? "#0fae37" : "#d93025"

  // Convert chart data to display format
  const displayChartData =
    chartData.length > 0
      ? chartData.map((point, index) => ({
          time:
            timeframe === "1D"
              ? new Date(point.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
              : new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          price: point.close,
        }))
      : [
          { time: "9:30", price: stock.price * 0.98 },
          { time: "10:30", price: stock.price * 0.99 },
          { time: "11:30", price: stock.price * 0.97 },
          { time: "12:30", price: stock.price * 0.98 },
          { time: "13:30", price: stock.price * 1.01 },
          { time: "14:30", price: stock.price * 1.02 },
          { time: "15:30", price: stock.price * 1.03 },
          { time: "16:00", price: stock.price },
        ]

  // Find min and max values for chart scaling
  const priceValues = displayChartData.map((point) => point.price)
  const minPrice = Math.min(...priceValues) * 0.99
  const maxPrice = Math.max(...priceValues) * 1.01
  const priceRange = maxPrice - minPrice || 1

  // Generate path for SVG chart
  const generateChartPath = () => {
    const width = 400
    const height = 200
    const padding = 20
    const xStep = (width - padding * 2) / (displayChartData.length - 1)

    return displayChartData
      .map((point, i) => {
        const x = padding + i * xStep
        const normalizedPrice = (point.price - minPrice) / priceRange
        const y = height - padding - normalizedPrice * (height - padding * 2)
        return `${i === 0 ? "M" : "L"} ${x},${y}`
      })
      .join(" ")
  }

  const handleBuyClick = () => {
    console.log("🛒 Buy button clicked for:", stock.symbol)
    router.push(`/challenge/stock/${params.symbol}/trade`)
  }

  const handleTimeframeChange = (period: string) => {
    setTimeframe(period)
    fetchChartData(period)
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="transition-all duration-200 active:scale-95">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-white text-xl font-bold">NOV. 2024 STOCK CHALLENGE</h1>
        <button className="transition-all duration-200 active:scale-95">
          <MoreVertical size={24} className="text-white" />
        </button>
      </div>

      {/* Stock Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mr-3 overflow-hidden"
            style={{ backgroundColor: stock.logoBackground }}
          >
            {stock.logoType === "text" ? (
              <span className="text-white font-bold text-xl">{stock.logoText}</span>
            ) : (
              <span className="text-white text-xl">{stock.logoEmoji}</span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold">{stock.symbol}</h2>
            <h3 className="text-2xl font-bold">{stock.name}</h3>
          </div>
          <div className="ml-auto">
            <h2 className="text-4xl font-bold text-right">${stock.price.toFixed(2)}</h2>
          </div>
        </div>
        <div className="flex items-center">
          <div className={`flex items-center ${isPositive ? "text-[#0fae37]" : "text-[#d93025]"}`}>
            <span className="text-lg">{isPositive ? "▲" : "▼"}</span>
            <span className="font-bold ml-1">${Math.abs(stock.change).toFixed(2)}</span>
            <span className="ml-1">
              ({isPositive ? "+" : ""}
              {stock.changePercent.toFixed(2)}%)
            </span>
          </div>
          <span className="ml-2 text-gray-500">Today</span>
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="p-4 border-b border-gray-200">
        <div className="h-64 w-full mb-4 relative">
          {chartLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f7b104]"></div>
            </div>
          ) : (
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Chart path */}
              <path d={generateChartPath()} fill="none" stroke={color} strokeWidth="3" />

              {/* Fill area under the path */}
              <path
                d={`${generateChartPath()} L ${400 - 20},${200 - 20} L ${20},${200 - 20} Z`}
                fill="url(#chartGradient)"
              />

              {/* Chart markers */}
              {displayChartData.map((point, index) => {
                const xStep = (400 - 40) / (displayChartData.length - 1)
                const x = 20 + index * xStep
                const normalizedPrice = (point.price - minPrice) / priceRange
                const y = 200 - 20 - normalizedPrice * (200 - 40)

                return (
                  <g key={index}>
                    <circle cx={x} cy={y} r="4" fill={color} />
                    {index % 2 === 0 && (
                      <text x={x} y={190} textAnchor="middle" fill="#666" fontSize="10">
                        {point.time}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
          )}
        </div>

        {/* Time period selector */}
        <div className="flex justify-between">
          {["1D", "1W", "1M", "3M", "YTD", "1Y", "MAX"].map((period) => (
            <button
              key={period}
              className={`px-4 py-2 rounded-full transition-all duration-200 active:scale-95 ${
                timeframe === period ? "bg-[#00688B] text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => handleTimeframeChange(period)}
              disabled={chartLoading}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex space-x-4 border-b border-gray-200">
        <button
          className="flex-1 py-3 border-2 border-[#00688B] rounded-full text-[#00688B] font-bold text-center transition-all duration-200 active:scale-95"
          onClick={() => setIsFollowing(!isFollowing)}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
        <button
          className="flex-1 py-3 bg-[#00688B] rounded-full text-white font-bold text-center transition-all duration-200 active:scale-95"
          onClick={handleBuyClick}
        >
          BUY
        </button>
      </div>

      {/* Stats Section */}
      <div className="p-4 border-b border-gray-200">
        <button
          className="flex justify-between items-center w-full transition-all duration-200 active:scale-95"
          onClick={() => setShowStats(!showStats)}
        >
          <h3 className="text-lg font-bold">Key Stats</h3>
          <ChevronDown size={20} className={`text-gray-500 transition-transform ${showStats ? "rotate-180" : ""}`} />
        </button>

        {showStats && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <p className="text-gray-500 text-sm">Volume</p>
              <p className="font-medium">{(stock.volume / 1000000).toFixed(2)}M</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Market Cap</p>
              <p className="font-medium">${(stock.marketCap / 1000000000).toFixed(2)}B</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">P/E Ratio</p>
              <p className="font-medium">{stock.peRatio.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Sector</p>
              <p className="font-medium">{stock.sector}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">52W High</p>
              <p className="font-medium">${stock.week52High.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">52W Low</p>
              <p className="font-medium">${stock.week52Low.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold mb-3">About</h2>
        <p className="text-gray-700 leading-relaxed">{stock.description}</p>
      </div>
    </div>
  )
}
