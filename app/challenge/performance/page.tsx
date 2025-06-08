"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Plus, ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { topGainers, topLosers, performanceData } from "@/lib/performance-data"
import SwipeableCard from "@/components/performance/swipeable-card"
import TouchFeedback from "@/components/touch-feedback"

// Mock data for different timeframes
const timeframeData = {
  "1D": {
    path: "M40,180 Q90,120 140,100 T240,60 T340,20",
    points: [
      { x: 40, y: 180, value: 97200 },
      { x: 90, y: 120, value: 101500 },
      { x: 140, y: 100, value: 104800 },
      { x: 190, y: 80, value: 107300 },
      { x: 240, y: 60, value: 109800 },
      { x: 290, y: 40, value: 111200 },
      { x: 340, y: 20, value: 112435 },
    ],
    change: "+7.91%",
    changeValue: "+$2,764.98",
  },
  "1W": {
    path: "M40,180 Q90,150 140,80 T240,120 T340,40",
    points: [
      { x: 40, y: 180, value: 95100 },
      { x: 90, y: 150, value: 96800 },
      { x: 140, y: 80, value: 105200 },
      { x: 190, y: 100, value: 103400 },
      { x: 240, y: 120, value: 101600 },
      { x: 290, y: 80, value: 106300 },
      { x: 340, y: 40, value: 112435 },
    ],
    change: "+12.45%",
    changeValue: "+$4,235.12",
  },
  "1M": {
    path: "M40,180 Q90,100 140,140 T240,60 T340,90",
    points: [
      { x: 40, y: 180, value: 92300 },
      { x: 90, y: 100, value: 103500 },
      { x: 140, y: 140, value: 98700 },
      { x: 190, y: 100, value: 103400 },
      { x: 240, y: 60, value: 108900 },
      { x: 290, y: 75, value: 106800 },
      { x: 340, y: 90, value: 112435 },
    ],
    change: "+15.32%",
    changeValue: "+$6,135.87",
  },
  "3M": {
    path: "M40,180 Q90,160 140,120 T240,100 T340,60",
    points: [
      { x: 40, y: 180, value: 89500 },
      { x: 90, y: 160, value: 92100 },
      { x: 140, y: 120, value: 97800 },
      { x: 190, y: 110, value: 99200 },
      { x: 240, y: 100, value: 100600 },
      { x: 290, y: 80, value: 103400 },
      { x: 340, y: 60, value: 112435 },
    ],
    change: "+18.76%",
    changeValue: "+$8,935.00",
  },
  "1Y": {
    path: "M40,180 Q90,140 140,160 T240,40 T340,20",
    points: [
      { x: 40, y: 180, value: 82400 },
      { x: 90, y: 140, value: 87600 },
      { x: 140, y: 160, value: 85100 },
      { x: 190, y: 100, value: 93400 },
      { x: 240, y: 40, value: 101800 },
      { x: 290, y: 30, value: 103200 },
      { x: 340, y: 20, value: 112435 },
    ],
    change: "+24.31%",
    changeValue: "+$15,235.65",
  },
  ALL: {
    path: "M40,180 Q90,170 140,100 T240,80 T340,10",
    points: [
      { x: 40, y: 180, value: 75000 },
      { x: 90, y: 170, value: 76500 },
      { x: 140, y: 100, value: 86300 },
      { x: 190, y: 90, value: 87800 },
      { x: 240, y: 80, value: 89200 },
      { x: 290, y: 45, value: 94600 },
      { x: 340, y: 10, value: 112435 },
    ],
    change: "+33.25%",
    changeValue: "+$37,435.00",
  },
}

export default function PerformancePage() {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [activeCard, setActiveCard] = useState<"gainers" | "losers">("gainers")
  const [timeframe, setTimeframe] = useState("1D")
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipData, setTooltipData] = useState({ x: 0, y: 0, value: 0 })
  const scrollRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<SVGSVGElement>(null)

  // Track scroll position to determine when to expand detailed view
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setScrollPosition(scrollRef.current.scrollTop)
        if (scrollRef.current.scrollTop > 100 && !expanded) {
          setExpanded(true)
        } else if (scrollRef.current.scrollTop < 50 && expanded) {
          setExpanded(false)
        }
      }
    }

    const currentRef = scrollRef.current
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll)
      }
    }
  }, [expanded])

  // Handle stock click
  const handleStockClick = (symbol: string) => {
    router.push(`/challenge/stock/${symbol}`)
  }

  // Handle chart point hover
  const handlePointHover = (point: { x: number; y: number; value: number }) => {
    setTooltipData(point)
    setTooltipVisible(true)
  }

  // Handle chart mouse leave
  const handleChartMouseLeave = () => {
    setTooltipVisible(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-20">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#f7b104] to-[#d48f03] p-5 pb-8 sticky top-0 z-10">
          <div className="flex justify-between items-center mb-3">
            <TouchFeedback className="text-white p-2" onClick={() => router.push("/challenge")}>
              <ArrowLeft size={28} />
            </TouchFeedback>
            <div className="w-10"></div>
          </div>

          <h1 className="text-white text-center text-3xl font-bold mb-2">Nov. 2024 Stock Challenge</h1>
          <h2 className="text-white text-center text-lg font-medium mb-4">Hosted by John Smith</h2>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
                  >
                    <span className="text-sm">👤</span>
                  </div>
                ))}
              </div>
            </div>
            <TouchFeedback className="bg-white text-[#d48f03] font-bold px-4 py-1.5 rounded-full shadow-md">
              + Invite
            </TouchFeedback>
          </div>

          <p className="text-white text-sm mb-4 truncate">
            Charlie Brown, Marley Woodson, Devin Michaels, and 32 others
          </p>
        </div>

        {/* Performance Summary Card */}
        <div className="px-4 -mt-4">
          <div className="bg-white rounded-xl p-5 shadow-lg mb-6">
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Net Worth</p>
              <h3 className="text-4xl font-bold">$112,435</h3>
            </div>

            <div className="flex justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm">Total Return</p>
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-[#0fae37] flex items-center justify-center mr-1">
                    <ArrowUpRight size={12} className="text-white" />
                  </div>
                  <p className="text-[#0fae37] font-bold text-lg">+24.31%</p>
                </div>
                <p className="text-gray-500 text-sm">Up $15,235.65</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Today's Return</p>
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-[#0fae37] flex items-center justify-center mr-1">
                    <ArrowUpRight size={12} className="text-white" />
                  </div>
                  <p className="text-[#0fae37] font-bold text-lg">+7.91%</p>
                </div>
                <p className="text-gray-500 text-sm">Up $2,764.98 today</p>
              </div>
            </div>

            <div className="bg-[#FFF3E0] text-[#FF9800] px-3 py-2 rounded-lg text-sm flex items-center mb-4">
              <span>🔥 You're ranked 5th out of 35 competitors - 2nd day with this rank</span>
            </div>

            {/* Interactive Chart */}
            <div className="relative h-64 mb-4 mt-6">
              <svg ref={chartRef} viewBox="0 0 400 200" className="w-full h-full" onMouseLeave={handleChartMouseLeave}>
                {/* Y-axis labels */}
                <text x="10" y="20" fontSize="10" textAnchor="start" fill="#888">
                  $115k
                </text>
                <text x="10" y="80" fontSize="10" textAnchor="start" fill="#888">
                  $105k
                </text>
                <text x="10" y="140" fontSize="10" textAnchor="start" fill="#888">
                  $95k
                </text>
                <text x="10" y="195" fontSize="10" textAnchor="start" fill="#888">
                  $85k
                </text>

                {/* Grid lines */}
                <line x1="40" y1="20" x2="390" y2="20" stroke="#eee" strokeWidth="1" />
                <line x1="40" y1="80" x2="390" y2="80" stroke="#eee" strokeWidth="1" />
                <line x1="40" y1="140" x2="390" y2="140" stroke="#eee" strokeWidth="1" />
                <line x1="40" y1="195" x2="390" y2="195" stroke="#eee" strokeWidth="1" />

                {/* Performance line */}
                <path
                  d={timeframeData[timeframe as keyof typeof timeframeData].path}
                  fill="none"
                  stroke="#0fae37"
                  strokeWidth="3"
                  className="transition-all duration-500 ease-in-out"
                />

                {/* Data points */}
                {timeframeData[timeframe as keyof typeof timeframeData].points.map((point, index) => (
                  <g key={index} onMouseEnter={() => handlePointHover(point)}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="#0fae37"
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-6 transition-all duration-200"
                    />
                  </g>
                ))}

                {/* Tooltip */}
                {tooltipVisible && (
                  <g>
                    <rect
                      x={tooltipData.x - 40}
                      y={tooltipData.y - 40}
                      width="80"
                      height="30"
                      rx="4"
                      fill="white"
                      stroke="#ddd"
                      strokeWidth="1"
                    />
                    <text
                      x={tooltipData.x}
                      y={tooltipData.y - 20}
                      fontSize="12"
                      textAnchor="middle"
                      fill="#333"
                      fontWeight="bold"
                    >
                      ${tooltipData.value.toLocaleString()}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <div className="flex justify-between space-x-2">
              {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period) => (
                <TouchFeedback
                  key={period}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    timeframe === period ? "bg-[#0fae37] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setTimeframe(period)}
                >
                  {period}
                </TouchFeedback>
              ))}
            </div>
          </div>
        </div>

        {/* Swipeable Cards */}
        <div className="px-4 mb-6 relative">
          {/* Card Navigation Dots */}
          <div className="flex justify-center mb-2">
            <button
              className={`w-2 h-2 rounded-full mx-1 ${activeCard === "gainers" ? "bg-[#0fae37]" : "bg-gray-300"}`}
              onClick={() => setActiveCard("gainers")}
            />
            <button
              className={`w-2 h-2 rounded-full mx-1 ${activeCard === "losers" ? "bg-[#d93025]" : "bg-gray-300"}`}
              onClick={() => setActiveCard("losers")}
            />
          </div>

          {/* Top Gainers Card */}
          {activeCard === "gainers" && (
            <SwipeableCard onSwipeLeft={() => setActiveCard("losers")}>
              <div className="bg-white rounded-xl p-4 shadow-md border-2 border-[#0fae37]">
                <h3 className="text-lg font-bold mb-3">Your top gainers</h3>

                {topGainers.map((stock, index) => (
                  <TouchFeedback
                    key={index}
                    className="flex items-center justify-between py-2 border-b last:border-b-0 hover:bg-gray-50 transition-colors rounded-md"
                    onClick={() => handleStockClick(stock.symbol)}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                        style={{ backgroundColor: stock.logoBackground }}
                      >
                        <span className="text-white font-bold text-xs">{stock.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{stock.symbol}</p>
                        <p className="text-gray-500 text-xs">{stock.name}</p>
                      </div>
                    </div>

                    <div className="flex-1 mx-2">
                      <svg viewBox="0 0 100 20" className="w-full h-5">
                        <path d="M0,10 Q20,5 40,2 T60,5 T80,2 L100,5" fill="none" stroke="#0fae37" strokeWidth="1.5" />
                      </svg>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-sm">${stock.price}</p>
                      <p className="text-[#0fae37] font-medium text-xs">+{stock.changePercent}%</p>
                    </div>
                  </TouchFeedback>
                ))}
              </div>
            </SwipeableCard>
          )}

          {/* Top Losers Card */}
          {activeCard === "losers" && (
            <SwipeableCard onSwipeRight={() => setActiveCard("gainers")}>
              <div className="bg-white rounded-xl p-4 shadow-md border-2 border-[#d93025]">
                <h3 className="text-lg font-bold mb-3">Your top losers</h3>

                {topLosers.map((stock, index) => (
                  <TouchFeedback
                    key={index}
                    className="flex items-center justify-between py-2 border-b last:border-b-0 hover:bg-gray-50 transition-colors rounded-md"
                    onClick={() => handleStockClick(stock.symbol)}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                        style={{ backgroundColor: stock.logoBackground }}
                      >
                        <span className="text-white font-bold text-xs">{stock.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{stock.symbol}</p>
                        <p className="text-gray-500 text-xs">{stock.name}</p>
                      </div>
                    </div>

                    <div className="flex-1 mx-2">
                      <svg viewBox="0 0 100 20" className="w-full h-5">
                        <path
                          d="M0,5 Q20,8 40,12 T60,8 T80,15 L100,10"
                          fill="none"
                          stroke="#d93025"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-sm">${stock.price}</p>
                      <p className="text-[#d93025] font-medium text-xs">{stock.changePercent}%</p>
                    </div>
                  </TouchFeedback>
                ))}
              </div>
            </SwipeableCard>
          )}
        </div>

        {/* Compare Performance Section */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Compare Performance</h3>
            <TouchFeedback className="flex items-center text-gray-500 text-sm">
              <Plus size={16} className="mr-1" />
              Add
            </TouchFeedback>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="h-64 mb-4">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                {/* Y-axis labels */}
                <text x="10" y="20" fontSize="10" textAnchor="start" fill="#888">
                  $150k
                </text>
                <text x="10" y="80" fontSize="10" textAnchor="start" fill="#888">
                  $100k
                </text>
                <text x="10" y="140" fontSize="10" textAnchor="start" fill="#888">
                  $50k
                </text>
                <text x="10" y="195" fontSize="10" textAnchor="start" fill="#888">
                  $0
                </text>

                {/* Grid lines */}
                <line x1="40" y1="20" x2="390" y2="20" stroke="#eee" strokeWidth="1" />
                <line x1="40" y1="80" x2="390" y2="80" stroke="#eee" strokeWidth="1" />
                <line x1="40" y1="140" x2="390" y2="140" stroke="#eee" strokeWidth="1" />
                <line x1="40" y1="195" x2="390" y2="195" stroke="#eee" strokeWidth="1" />

                {/* Performance lines */}
                <path
                  d={timeframeData[timeframe as keyof typeof timeframeData].path}
                  fill="none"
                  stroke="#9C27B0"
                  strokeWidth="3"
                />
                <path d="M40,180 Q90,150 140,140 T240,110 T340,90" fill="none" stroke="#0fae37" strokeWidth="3" />
                <path d="M40,180 Q90,170 140,160 T240,140 T340,120" fill="none" stroke="#2196F3" strokeWidth="3" />
                <path d="M40,180 Q90,175 140,170 T240,160 T340,150" fill="none" stroke="#FF9800" strokeWidth="3" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#9C27B0] mr-2"></div>
                <span className="text-sm">You</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#0fae37] mr-2"></div>
                <span className="text-sm">Mike Ross</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#2196F3] mr-2"></div>
                <span className="text-sm">Game Average</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#FF9800] mr-2"></div>
                <span className="text-sm">S&P 500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Statistics (shown when scrolled down) */}
        <div className={`p-4 ${expanded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-bold mb-3">Your Statistics</h2>

            <div className="grid grid-cols-2 gap-y-4">
              {performanceData.map((item, index) => (
                <div key={index}>
                  <p className="text-gray-500 text-sm">{item.name}</p>
                  <p className={`font-bold ${item.value.startsWith("+") ? "text-[#0fae37]" : ""}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
