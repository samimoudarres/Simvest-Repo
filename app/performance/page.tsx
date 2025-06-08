"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { topGainers, topLosers, performanceData } from "@/lib/performance-data"
import SwipeableCard from "@/components/performance/swipeable-card"
import BottomNavigation from "@/components/bottom-navigation"

export default function PerformancePage() {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [activeCard, setActiveCard] = useState<"gainers" | "losers">("gainers")
  const [timeframe, setTimeframe] = useState("1D")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Handle back button - return to original home screen
  const handleBack = () => {
    router.push("/")
  }

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

  // Mock data for different timeframes
  const getChartPath = () => {
    switch (timeframe) {
      case "1D":
        return "M40,180 Q90,120 140,100 T240,60 T340,20"
      case "1W":
        return "M40,180 Q90,150 140,80 T240,120 T340,40"
      case "1M":
        return "M40,180 Q90,100 140,140 T240,60 T340,90"
      case "3M":
        return "M40,180 Q90,160 140,120 T240,100 T340,60"
      case "1Y":
        return "M40,180 Q90,140 140,160 T240,40 T340,20"
      case "ALL":
        return "M40,180 Q90,170 140,100 T240,80 T340,10"
      default:
        return "M40,180 Q90,120 140,100 T240,60 T340,20"
    }
  }

  // Handle stock click
  const handleStockClick = (symbol: string) => {
    router.push(`/stock/${symbol}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#f7b104] to-[#d48f03] p-5 pb-8">
          <div className="flex justify-between items-center mb-3">
            <button className="text-white p-2 transition-transform duration-100 active:scale-95" onClick={handleBack}>
              <ArrowLeft size={28} />
            </button>
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
            <button className="bg-white text-[#d48f03] font-bold px-4 py-1.5 rounded-full shadow-md transition-transform duration-100 active:scale-95">
              + Invite
            </button>
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
                    <ArrowLeft size={12} className="text-white transform rotate-90" />
                  </div>
                  <p className="text-[#0fae37] font-bold text-lg">+24.31%</p>
                </div>
                <p className="text-gray-500 text-sm">Up $15,235.65</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Today's Return</p>
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-[#0fae37] flex items-center justify-center mr-1">
                    <ArrowLeft size={12} className="text-white transform rotate-90" />
                  </div>
                  <p className="text-[#0fae37] font-bold text-lg">+7.91%</p>
                </div>
                <p className="text-gray-500 text-sm">Up $2,764.98 today</p>
              </div>
            </div>

            <div className="bg-[#FFF3E0] text-[#FF9800] px-3 py-2 rounded-lg text-sm flex items-center mb-4">
              <span>🔥 You're ranked 5th out of 35 competitors - 2nd day with this rank</span>
            </div>

            <div className="flex justify-between space-x-2">
              {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    timeframe === period ? "bg-[#0fae37] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setTimeframe(period)}
                >
                  {period}
                </button>
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
                  <button
                    key={index}
                    className="flex items-center justify-between py-2 border-b last:border-b-0 hover:bg-gray-50 transition-colors rounded-md w-full text-left"
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
                  </button>
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
                  <button
                    key={index}
                    className="flex items-center justify-between py-2 border-b last:border-b-0 hover:bg-gray-50 transition-colors rounded-md w-full text-left"
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
                  </button>
                ))}
              </div>
            </SwipeableCard>
          )}
        </div>

        {/* Compare Performance Section */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Compare Performance</h3>
            <button className="flex items-center text-gray-500 text-sm transition-transform duration-100 active:scale-95">
              <Plus size={16} className="mr-1" />
              Add
            </button>
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
                <path d={getChartPath()} fill="none" stroke="#9C27B0" strokeWidth="3" />
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
                <span className="text-sm">Mike Rose</span>
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

      {/* Fixed Bottom Navigation - Always visible */}
      <BottomNavigation />
    </div>
  )
}
