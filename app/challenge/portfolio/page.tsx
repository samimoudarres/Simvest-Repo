"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ArrowUpRight, X, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import TouchFeedback from "@/components/touch-feedback"

type SortOption = "totalPercentReturn" | "totalDollarReturn" | "todayReturn" | "percentOfAccount"

// Mock portfolio data
const portfolioData = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corp",
    shares: 10,
    currentPrice: 271.3,
    changePercent: 2.45,
    logoBackground: "#76B900",
    totalValue: 2713.0,
    percentOfAccount: 28,
    category: "Technology",
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    shares: 8,
    currentPrice: 145.87,
    changePercent: -0.53,
    logoBackground: "#0668E1",
    totalValue: 1166.96,
    percentOfAccount: 12,
    category: "Technology",
  },
  {
    symbol: "APPL",
    name: "Apple Inc",
    shares: 12,
    currentPrice: 81.25,
    changePercent: 1.45,
    logoBackground: "#000000",
    totalValue: 975.0,
    percentOfAccount: 10,
    category: "Technology",
  },
  {
    symbol: "SPOT",
    name: "Spotify Technology",
    shares: 9,
    currentPrice: 107.6,
    changePercent: 3.98,
    logoBackground: "#1DB954",
    totalValue: 968.4,
    percentOfAccount: 10,
    category: "Technology",
  },
  {
    symbol: "SHOP",
    name: "Shopify Inc",
    shares: 7,
    currentPrice: 101.32,
    changePercent: 1.12,
    logoBackground: "#95BF47",
    totalValue: 709.24,
    percentOfAccount: 7.3,
    category: "E-commerce",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc",
    shares: 3,
    currentPrice: 217.56,
    changePercent: 2.06,
    logoBackground: "#d93025",
    totalValue: 652.68,
    percentOfAccount: 6.7,
    category: "Automotive",
  },
  {
    symbol: "HSY",
    name: "Hershey Co",
    shares: 10,
    currentPrice: 64.2,
    changePercent: 0.65,
    logoBackground: "#8B4513",
    totalValue: 642.0,
    percentOfAccount: 6.6,
    category: "Consumer Goods",
  },
  {
    symbol: "GE",
    name: "General Electric",
    shares: 20,
    currentPrice: 28.15,
    changePercent: 0.75,
    logoBackground: "#3277B6",
    totalValue: 563.0,
    percentOfAccount: 5.8,
    category: "Industrial",
  },
  {
    symbol: "DELL",
    name: "Dell Technologies",
    shares: 15,
    currentPrice: 35.12,
    changePercent: -1.23,
    logoBackground: "#007DB8",
    totalValue: 526.8,
    percentOfAccount: 5.4,
    category: "Technology",
  },
  {
    symbol: "PFE",
    name: "Pfizer Inc.",
    shares: 15,
    currentPrice: 26.74,
    changePercent: 0.18,
    logoBackground: "#0072b2",
    totalValue: 401.1,
    percentOfAccount: 4.2,
    category: "Healthcare",
  },
  {
    symbol: "SSNLF",
    name: "Samsung Electronics",
    shares: 8,
    currentPrice: 25.67,
    changePercent: 0.87,
    logoBackground: "#1428A0",
    totalValue: 205.36,
    percentOfAccount: 2.1,
    category: "Technology",
  },
  {
    symbol: "SONY",
    name: "Sony Group Corp",
    shares: 5,
    currentPrice: 37.45,
    changePercent: -0.32,
    logoBackground: "#000000",
    totalValue: 187.25,
    percentOfAccount: 1.9,
    category: "Technology",
  },
]

export default function PortfolioPage() {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<SortOption>("totalPercentReturn")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCategoryDetails, setShowCategoryDetails] = useState(false)
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null)

  // Sort options
  const sortOptions = [
    { id: "totalPercentReturn", label: "Total % return" },
    { id: "totalDollarReturn", label: "Total $ return" },
    { id: "todayReturn", label: "Today's $ return" },
    { id: "percentOfAccount", label: "% of account" },
  ]

  // Handle sort selection
  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(option)
      setSortDirection("desc")
    }
    setShowSortOptions(false)
  }

  // Track scroll position to determine when to expand detailed view
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef) {
        if (scrollRef.scrollTop > 100 && !expanded) {
          setExpanded(true)
        } else if (scrollRef.scrollTop < 50 && expanded) {
          setExpanded(false)
        }
      }
    }

    if (scrollRef) {
      scrollRef.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (scrollRef) {
        scrollRef.removeEventListener("scroll", handleScroll)
      }
    }
  }, [expanded, scrollRef])

  // Calculate total portfolio value
  const totalValue = portfolioData.reduce((sum, stock) => sum + stock.totalValue, 0)

  // Group portfolio by category
  const portfolioByCategory = portfolioData.reduce(
    (acc, stock) => {
      if (!acc[stock.category]) {
        acc[stock.category] = {
          totalValue: 0,
          percentOfAccount: 0,
          stocks: [],
        }
      }
      acc[stock.category].totalValue += stock.totalValue
      acc[stock.category].percentOfAccount += stock.percentOfAccount
      acc[stock.category].stocks.push(stock)
      return acc
    },
    {} as Record<string, { totalValue: number; percentOfAccount: number; stocks: typeof portfolioData }>,
  )

  // Get category details
  const getCategoryDetails = (category: string) => {
    const categoryData = portfolioByCategory[category]
    const totalCategoryValue = categoryData.totalValue
    const percentOfPortfolio = categoryData.percentOfAccount
    const stocks = categoryData.stocks

    return {
      category,
      totalValue: totalCategoryValue,
      percentOfPortfolio,
      stocks,
    }
  }

  // Handle category selection
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    setShowCategoryDetails(true)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
      {/* Header - Changed from blue to yellow gradient */}
      <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-16 relative z-10">
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
          <TouchFeedback className="bg-white text-[#b26f03] font-bold px-4 py-1.5 rounded-full shadow-md">
            + Invite
          </TouchFeedback>
        </div>

        <p className="text-white text-sm mb-4 truncate">Charlie Brown, Marley Woodson, Devin Michaels, and 32 others</p>

        {/* Added decorative wave overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0,50 C150,150 350,0 500,50 L500,150 L0,150 Z" fill="#f7f7f7" opacity="0.2"></path>
          </svg>
        </div>
      </div>

      <div ref={(el) => setScrollRef(el)} className="flex-1 overflow-y-auto -mt-10 relative z-20">
        {/* Portfolio Summary Card */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-5">
              <div>
                <p className="text-gray-500 text-sm font-medium">Portfolio Value</p>
                <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex bg-[#0fae37]/10 text-[#0fae37] px-3 py-1 rounded-md text-sm font-medium items-center">
                  <ArrowUpRight size={16} className="mr-1" />
                  +$3,243.21 (2.9%)
                </div>
                <p className="text-gray-500 text-xs mt-1">Today's gain</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Today's Return */}
              <div className="bg-[#f8f9fa] rounded-xl p-3">
                <p className="text-gray-500 text-xs font-medium mb-1">Today's Return</p>
                <div className="flex items-center">
                  <div className="text-[#0fae37] mr-1">
                    <ArrowUpRight size={18} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#0fae37]">+$1,245.67</p>
                    <p className="text-xs text-[#0fae37]">+1.12%</p>
                  </div>
                </div>
              </div>

              {/* Total Return */}
              <div className="bg-[#f8f9fa] rounded-xl p-3">
                <p className="text-gray-500 text-xs font-medium mb-1">Total Return</p>
                <div className="flex items-center">
                  <div className="text-[#0fae37] mr-1">
                    <ArrowUpRight size={18} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#0fae37]">+$15,235.65</p>
                    <p className="text-xs text-[#0fae37]">+15.8%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Buying Power</p>
                <p className="text-base font-bold">$12,345.67</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Cash Balance</p>
                <p className="text-base font-bold">$8,765.43</p>
              </div>
            </div>
          </div>
        </div>

        {/* Investments Section */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold tracking-wider">INVESTMENTS</h3>
            <TouchFeedback
              className="flex items-center text-gray-600 text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm"
              onClick={() => setShowSortOptions(!showSortOptions)}
            >
              <span>Sort: {sortOptions.find((option) => option.id === sortBy)?.label}</span>
              <ChevronDown size={16} className={`ml-1 transition-transform ${showSortOptions ? "rotate-180" : ""}`} />

              {showSortOptions && (
                <div className="absolute mt-28 right-4 bg-white shadow-lg rounded-lg z-20 w-48">
                  {sortOptions.map((option) => (
                    <TouchFeedback
                      key={option.id}
                      className={`w-full text-left p-3 hover:bg-gray-100 ${sortBy === option.id ? "font-bold bg-gray-50" : ""}`}
                      onClick={() => handleSort(option.id as SortOption)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{option.label}</span>
                      </div>
                    </TouchFeedback>
                  ))}
                </div>
              )}
            </TouchFeedback>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {portfolioData.map((stock, index) => (
              <TouchFeedback
                key={index}
                className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                onClick={() => router.push(`/challenge/stock/${stock.symbol}`)}
              >
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: stock.logoBackground }}
                  >
                    <span className="text-white font-bold text-xs">{stock.symbol.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-bold">{stock.symbol}</p>
                    <p className="text-gray-500 text-xs">{stock.shares} shares</p>
                  </div>
                </div>

                <div className="flex-1 mx-4">
                  <svg viewBox="0 0 100 20" className="w-full h-5">
                    <path
                      d="M0,10 Q20,8 40,12 T60,8 T80,10 L100,9"
                      fill="none"
                      stroke={stock.percentOfAccount >= 0 ? "#0fae37" : "#d93025"}
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                <div className="text-right">
                  <p className="font-bold">${stock.currentPrice.toFixed(2)}</p>
                  <p
                    className={`font-medium text-xs ${stock.changePercent >= 0 ? "text-[#0fae37]" : "text-[#d93025]"}`}
                  >
                    {stock.changePercent >= 0 ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%
                  </p>
                </div>
              </TouchFeedback>
            ))}
          </div>
        </div>

        {/* Portfolio Diversification Chart */}
        <div className="px-4 mb-20">
          <h3 className="text-xl font-bold tracking-wider mb-3">DIVERSIFICATION</h3>
          <div className="bg-white rounded-[18px] p-5 shadow-sm">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Chart segments */}
                {Object.entries(portfolioByCategory).map(([category, data], index) => {
                  const startAngle =
                    index === 0
                      ? 0
                      : Object.entries(portfolioByCategory)
                          .slice(0, index)
                          .reduce((sum, [_, catData]) => sum + catData.percentOfAccount, 0)
                  const endAngle = startAngle + data.percentOfAccount

                  // Calculate SVG arc path
                  const startRad = (((startAngle / 100) * 360 - 90) * Math.PI) / 180
                  const endRad = (((endAngle / 100) * 360 - 90) * Math.PI) / 180

                  const x1 = 50 + 40 * Math.cos(startRad)
                  const y1 = 50 + 40 * Math.sin(startRad)
                  const x2 = 50 + 40 * Math.cos(endRad)
                  const y2 = 50 + 40 * Math.sin(endRad)

                  // Determine if the arc should be drawn as a large arc
                  const largeArcFlag = endAngle - startAngle > 50 ? 1 : 0

                  // Create the path for the segment
                  const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

                  // Calculate label position
                  const midAngle = (startAngle + endAngle) / 2
                  const midRad = (((midAngle / 100) * 360 - 90) * Math.PI) / 180
                  const labelX = 50 + 30 * Math.cos(midRad)
                  const labelY = 50 + 30 * Math.sin(midRad)

                  // Define color based on index
                  const blueShades = [
                    "#f7b104",
                    "#e9a504",
                    "#d89a04",
                    "#c78f04",
                    "#b68404",
                    "#a57904",
                    "#946e04",
                    "#836304",
                  ]

                  return (
                    <g key={category} onClick={() => handleCategoryClick(category)}>
                      <path
                        d={path}
                        fill={blueShades[index % blueShades.length]}
                        stroke="white"
                        strokeWidth="0.5"
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                      />
                      {data.percentOfAccount >= 8 && (
                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="3"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          {category}
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* Center circle (donut hole) */}
                <circle cx="50" cy="50" r="22" fill="white" />

                {/* Center text */}
                <text x="50" y="48" textAnchor="middle" fontSize="6" fontWeight="bold" fill="black">
                  ${totalValue.toLocaleString()}
                </text>
                <text x="50" y="54" textAnchor="middle" fontSize="3" fontWeight="500" fill="#666" letterSpacing="0.2">
                  TOTAL VALUE
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {Object.entries(portfolioByCategory).map(([category, data], index) => {
                const colorShades = [
                  "#f7b104",
                  "#e9a504",
                  "#d89a04",
                  "#c78f04",
                  "#b68404",
                  "#a57904",
                  "#946e04",
                  "#836304",
                ]

                return (
                  <TouchFeedback
                    key={category}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-50"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: colorShades[index % colorShades.length] }}
                    ></div>
                    <p className="text-sm font-medium">{category}</p>
                    <p className="text-xs text-gray-500 ml-auto">{data.percentOfAccount.toFixed(1)}%</p>
                  </TouchFeedback>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Category Details Modal */}
      {showCategoryDetails && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedCategory}</h3>
              <TouchFeedback onClick={() => setShowCategoryDetails(false)}>
                <X size={24} className="text-gray-500" />
              </TouchFeedback>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-500 text-sm">Total Value</p>
                  <p className="text-xl font-bold">
                    ${getCategoryDetails(selectedCategory).totalValue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">% of Portfolio</p>
                  <p className="text-xl font-bold">
                    {getCategoryDetails(selectedCategory).percentOfPortfolio.toFixed(1)}%
                  </p>
                </div>
              </div>

              <h4 className="font-bold mb-3">Holdings</h4>
              <div className="space-y-3">
                {getCategoryDetails(selectedCategory).stocks.map((stock, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-xl">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: stock.logoBackground }}
                    >
                      <span className="text-white font-bold text-xs">{stock.symbol.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-bold">{stock.symbol}</p>
                        <p className="font-bold">${stock.totalValue.toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <p>{stock.shares} shares</p>
                        <p className={stock.changePercent >= 0 ? "text-[#0fae37]" : "text-[#d93025]"}>
                          {stock.changePercent >= 0 ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
