"use client"

import { useState, useEffect } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { chartDataService, type ChartDataPoint } from "@/lib/chart-data-service"

interface InteractiveStockChartProps {
  symbol: string
  initialTimeframe?: string
  onTimeframeChange?: (timeframe: string) => void
  className?: string
  height?: number
}

const TIMEFRAMES = [
  { key: "1D", label: "1D" },
  { key: "1W", label: "1W" },
  { key: "1M", label: "1M" },
  { key: "3M", label: "3M" },
  { key: "6M", label: "6M" },
  { key: "1Y", label: "1Y" },
  { key: "MAX", label: "MAX" },
]

export function InteractiveStockChart({
  symbol,
  initialTimeframe = "1D",
  onTimeframeChange,
  className = "",
  height = 400,
}: InteractiveStockChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState(initialTimeframe)
  const [priceChange, setPriceChange] = useState({ change: 0, changePercent: 0 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChartData()
  }, [symbol, timeframe])

  const fetchChartData = async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)

    try {
      console.log(`📈 Fetching chart data for ${symbol} (${timeframe})`)
      const data = await chartDataService.getChartData(symbol, timeframe)

      // Transform data for Recharts
      const transformedData = data.map((point) => ({
        ...point,
        date: point.date.getTime(), // Convert to timestamp for Recharts
        dateString: point.date.toISOString(),
      }))

      setChartData(transformedData)

      // Calculate price change
      const change = chartDataService.calculatePriceChange(data)
      setPriceChange(change)

      console.log(`✅ Chart data loaded: ${data.length} points`)
    } catch (error) {
      console.error("Chart data error:", error)
      setError(error instanceof Error ? error.message : "Failed to load chart data")
      setChartData([])
    } finally {
      setLoading(false)
    }
  }

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe)
    if (onTimeframeChange) {
      onTimeframeChange(newTimeframe)
    }
  }

  const formatTooltipValue = (value: any, name: string) => {
    if (name === "close") return [`$${Number(value).toFixed(2)}`, "Price"]
    if (name === "volume") return [Number(value).toLocaleString(), "Volume"]
    return [value, name]
  }

  const formatXAxisTick = (tickItem: any) => {
    const date = new Date(tickItem)

    switch (timeframe) {
      case "1D":
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      case "1W":
      case "1M":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      default:
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        })
    }
  }

  const formatTooltipLabel = (label: any) => {
    const date = new Date(label)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: timeframe === "1D" ? "numeric" : undefined,
      minute: timeframe === "1D" ? "2-digit" : undefined,
      hour12: timeframe === "1D",
    })
  }

  const isPositive = priceChange.changePercent >= 0
  const lineColor = isPositive ? "#10b981" : "#ef4444" // green-500 : red-500
  const areaColor = isPositive ? "#10b98120" : "#ef444420" // green with opacity

  return (
    <div className={`bg-white rounded-lg ${className}`}>
      {/* Header with price change */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{symbol}</h3>
            {!loading && !error && (
              <div className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? "+" : ""}${priceChange.change.toFixed(2)} ({isPositive ? "+" : ""}
                {priceChange.changePercent.toFixed(2)}%)
                <span className="text-gray-500 ml-2">({timeframe})</span>
              </div>
            )}
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.key}
              onClick={() => handleTimeframeChange(tf.key)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                timeframe === tf.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-4" style={{ height: height }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-500 mb-2">Failed to load chart</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={fetchChartData}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No chart data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatXAxisTick}
                stroke="#9ca3af"
                fontSize={12}
                tickCount={6}
              />
              <YAxis
                domain={["dataMin - 1", "dataMax + 1"]}
                tickFormatter={(value) => `$${Number(value).toFixed(2)}`}
                stroke="#9ca3af"
                fontSize={12}
                width={60}
              />
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#colorPrice)"
                dot={false}
                activeDot={{ r: 4, fill: lineColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default InteractiveStockChart
