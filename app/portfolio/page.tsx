"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ArrowLeft, BarChart2, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { portfolioData } from "@/lib/portfolio-data"
import BottomNavigation from "@/components/bottom-navigation"

type SortOption = "totalPercentReturn" | "totalDollarReturn" | "todayReturn" | "percentOfAccount"

export default function PortfolioPage() {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<SortOption>("totalPercentReturn")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("positions")
  const scrollRef = useRef<HTMLDivElement>(null)

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

  // Handle back button - return to original home screen
  const handleBack = () => {
    router.push("/")
  }

  // Track scroll position to determine when to expand detailed view
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
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

  // Sort the portfolio data
  const sortedPortfolio = [...portfolioData].sort((a, b) => {
    let valueA, valueB

    switch (sortBy) {
      case "totalPercentReturn":
        valueA = a.totalPercentReturn
        valueB = b.totalPercentReturn
        break
      case "totalDollarReturn":
        valueA = a.totalDollarReturn
        valueB = b.totalDollarReturn
        break
      case "todayReturn":
        valueA = a.todayReturn
        valueB = b.todayReturn
        break
      case "percentOfAccount":
        valueA = a.percentOfAccount
        valueB = b.percentOfAccount
        break
    }

    return sortDirection === "asc" ? valueA - valueB : valueB - valueA
  })

  // Calculate total portfolio value
  const totalValue = portfolioData.reduce((sum, stock) => sum + stock.currentValue, 0)

  // Calculate today's return
  const todayReturn = portfolioData.reduce((sum, stock) => sum + stock.todayReturn, 0)
  const todayReturnPercent = (todayReturn / totalValue) * 100

  // Calculate total return
  const totalReturnAmount = portfolioData.reduce((sum, stock) => sum + stock.totalDollarReturn, 0)
  const totalReturnPercent = (totalReturnAmount / (totalValue - totalReturnAmount)) * 100

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0052cc] via-[#2684ff] to-[#4c9aff] p-5 pb-16 relative z-10">
        <div className="flex justify-between items-center mb-3">
          <button className="text-white p-2 transition-transform duration-100 active:scale-95" onClick={handleBack}>
            <ArrowLeft size={24} />
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
          <button className="bg-white text-[#0052cc] font-bold px-4 py-1.5 rounded-full shadow-md transition-transform duration-100 active:scale-95">
            + Invite
          </button>
        </div>

        <p className="text-white text-sm mb-4 truncate">Charlie Brown, Marley Woodson, Devin Michaels, and 32 others</p>

        {/* Added decorative wave overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0,50 C150,150 350,0 500,50 L500,150 L0,150 Z" fill="#f7f7f7" opacity="0.2"></path>
          </svg>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto -mt-10 relative z-20">
        {/* Portfolio Summary Card */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-5">
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-medium">Portfolio Value</p>
                <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
              </div>

              {/* Rank Badge */}
              <div className="flex flex-col items-end ml-4">
                <div className="bg-[#ebf4ff] text-[#0052cc] px-3 py-1.5 rounded-full text-sm font-medium flex items-center whitespace-nowrap">
                  <PieChart size={16} className="mr-1" /> Rank: #5
                </div>
                <p className="text-gray-500 text-xs mt-1 text-right">out of 35 competitors</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Today's Return */}
              <div className="bg-[#f8f9fa] rounded-xl p-3">
                <p className="text-gray-500 text-xs font-medium mb-1">Today's Return</p>
                <div className="flex items-center">
                  <div className={`${todayReturn >= 0 ? "text-[#0fae37]" : "text-[#d93025]"} mr-1 flex-shrink-0`}>
                    {todayReturn >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-lg font-bold ${todayReturn >= 0 ? "text-[#0fae37]" : "text-[#d93025]"} truncate`}
                    >
                      {todayReturn >= 0 ? "+" : ""}
                      {formatCurrency(todayReturn)}
                    </p>
                    <p className={`text-xs ${todayReturn >= 0 ? "text-[#0fae37]" : "text-[#d93025]"}`}>
                      {todayReturn >= 0 ? "+" : ""}
                      {todayReturnPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Return */}
              <div className="bg-[#f8f9fa] rounded-xl p-3">
                <p className="text-gray-500 text-xs font-medium mb-1">Total Return</p>
                <div className="flex items-center">
                  <div className={`${totalReturnAmount >= 0 ? "text-[#0fae37]" : "text-[#d93025]"} mr-1 flex-shrink-0`}>
                    {totalReturnAmount >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-lg font-bold ${totalReturnAmount >= 0 ? "text-[#0fae37]" : "text-[#d93025]"} truncate`}
                    >
                      {totalReturnAmount >= 0 ? "+" : ""}
                      {formatCurrency(totalReturnAmount)}
                    </p>
                    <p className={`text-xs ${totalReturnAmount >= 0 ? "text-[#0fae37]" : "text-[#d93025]"}`}>
                      {totalReturnAmount >= 0 ? "+" : ""}
                      {totalReturnPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex rounded-lg bg-[#f1f3f5] p-1">
              <button
                className={`flex-1 py-2 px-3 rounded-md text-center text-sm font-medium transition-transform duration-100 active:scale-95 ${activeTab === "positions" ? "bg-white shadow-sm" : "text-gray-600"}`}
                onClick={() => setActiveTab("positions")}
              >
                Positions
              </button>
              <button
                className={`flex-1 py-2 px-3 rounded-md text-center text-sm font-medium transition-transform duration-100 active:scale-95 ${activeTab === "performance" ? "bg-white shadow-sm" : "text-gray-600"}`}
                onClick={() => setActiveTab("performance")}
              >
                Performance
              </button>
              <button
                className={`flex-1 py-2 px-3 rounded-md text-center text-sm font-medium transition-transform duration-100 active:scale-95 ${activeTab === "activity" ? "bg-white shadow-sm" : "text-gray-600"}`}
                onClick={() => setActiveTab("activity")}
              >
                Activity
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Positions */}
        {activeTab === "positions" && (
          <div className="px-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Your Positions</h3>
              <div className="relative">
                <button
                  className="flex items-center text-gray-600 text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm transition-transform duration-100 active:scale-95"
                  onClick={() => setShowSortOptions(!showSortOptions)}
                >
                  <span className="truncate max-w-32">
                    Sort: {sortOptions.find((option) => option.id === sortBy)?.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`ml-1 transition-transform flex-shrink-0 ${showSortOptions ? "rotate-180" : ""}`}
                  />
                </button>

                {showSortOptions && (
                  <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-lg z-20 w-48">
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        className={`w-full text-left p-3 hover:bg-gray-100 transition-transform duration-100 active:scale-95 ${sortBy === option.id ? "font-bold bg-gray-50" : ""}`}
                        onClick={() => handleSort(option.id as SortOption)}
                      >
                        <span className="text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-md mb-6">
              {sortedPortfolio.map((stock, index) => (
                <button
                  key={index}
                  className="flex items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors w-full text-left"
                  onClick={() => router.push(`/stock/${stock.symbol}`)}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ backgroundColor: stock.logoBackground }}
                    >
                      <span className="text-white font-bold">{stock.symbol.charAt(0)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center mb-1">
                        <p className="font-bold text-base truncate">{stock.symbol}</p>
                        <p className="text-gray-500 text-xs ml-2 flex-shrink-0">• {stock.shares} shares</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-700 text-sm">${stock.currentPrice.toFixed(2)}</p>
                        <p className={`text-sm ${stock.totalPercentReturn >= 0 ? "text-[#0fae37]" : "text-[#d93025]"}`}>
                          {stock.totalPercentReturn >= 0 ? "+" : ""}
                          {stock.totalPercentReturn.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-bold">${stock.currentValue.toLocaleString()}</p>
                    <p className={`text-sm ${stock.todayReturn >= 0 ? "text-[#0fae37]" : "text-[#d93025]"}`}>
                      {stock.todayReturn >= 0 ? "+" : ""}${Math.abs(stock.todayReturn).toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Performance */}
        {activeTab === "performance" && (
          <div className="px-4">
            <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
              <h3 className="text-lg font-bold mb-4">Performance Chart</h3>

              <div className="h-64 relative mb-4">
                {/* Placeholder for chart */}
                <div className="absolute inset-0 flex items-center justify-center bg-[#f8f9fa] rounded-xl">
                  <BarChart2 size={48} className="text-gray-300" />
                </div>
              </div>

              <div className="flex justify-between space-x-2">
                <button className="px-3 py-1.5 rounded-full bg-[#0052cc] text-white text-sm transition-transform duration-100 active:scale-95">
                  1D
                </button>
                <button className="px-3 py-1.5 rounded-full bg-gray-100 text-sm transition-transform duration-100 active:scale-95">
                  1W
                </button>
                <button className="px-3 py-1.5 rounded-full bg-gray-100 text-sm transition-transform duration-100 active:scale-95">
                  1M
                </button>
                <button className="px-3 py-1.5 rounded-full bg-gray-100 text-sm transition-transform duration-100 active:scale-95">
                  3M
                </button>
                <button className="px-3 py-1.5 rounded-full bg-gray-100 text-sm transition-transform duration-100 active:scale-95">
                  1Y
                </button>
                <button className="px-3 py-1.5 rounded-full bg-gray-100 text-sm transition-transform duration-100 active:scale-95">
                  ALL
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
              <h3 className="text-lg font-bold mb-4">Statistics</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Annualized Return</p>
                  <p className="font-bold text-[#0fae37]">+42.8%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Sharpe Ratio</p>
                  <p className="font-bold">1.32</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Beta</p>
                  <p className="font-bold">1.15</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Alpha</p>
                  <p className="font-bold text-[#0fae37]">+2.4%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Max Drawdown</p>
                  <p className="font-bold text-[#d93025]">-8.7%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Volatility</p>
                  <p className="font-bold">18.2%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Activity */}
        {activeTab === "activity" && (
          <div className="px-4">
            <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
              <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>

              <div className="space-y-4">
                {[
                  { type: "buy", symbol: "NVDA", shares: 3, price: 1045.78, date: "Nov 24, 2024" },
                  { type: "sell", symbol: "AAPL", shares: 5, price: 187.45, date: "Nov 22, 2024" },
                  { type: "buy", symbol: "MSFT", shares: 2, price: 415.32, date: "Nov 20, 2024" },
                ].map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${transaction.type === "buy" ? "bg-[#0fae37]/10" : "bg-[#d93025]/10"}`}
                      >
                        <span
                          className={`font-bold ${transaction.type === "buy" ? "text-[#0fae37]" : "text-[#d93025]"}`}
                        >
                          {transaction.type === "buy" ? "B" : "S"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate">
                          {transaction.type === "buy" ? "Bought" : "Sold"} {transaction.symbol}
                        </p>
                        <p className="text-gray-500 text-xs">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="font-bold">{transaction.shares} shares</p>
                      <p className="text-gray-500 text-xs">${transaction.price.toFixed(2)}/share</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Diversification Chart */}
        {activeTab === "positions" && expanded && (
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="text-lg font-bold mb-4">Portfolio Diversification</h3>

              <div className="relative h-64 mb-4">
                {/* Placeholder for pie chart */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <PieChart size={150} className="text-[#0052cc]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {sortedPortfolio.slice(0, 6).map((stock, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: stock.logoBackground }}
                    ></div>
                    <p className="text-sm font-medium truncate">{stock.symbol}</p>
                    <p className="text-xs text-gray-500 ml-auto flex-shrink-0">{stock.percentOfAccount.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation - Always visible */}
      <BottomNavigation />
    </div>
  )
}
