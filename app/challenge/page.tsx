"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ProfileDropdown from "@/components/profile-dropdown"
import { topStocks, cryptoStocks, etfStocks } from "@/lib/data"
import SearchableStockInput from "@/components/searchable-stock-input"

const stockCategories = [
  {
    id: "popular",
    title: "Popular",
    color: "border-green-500",
    bgColor: "bg-green-50",
    stocks: topStocks.slice(0, 15),
  },
  {
    id: "crypto",
    title: "Crypto",
    color: "border-blue-500",
    bgColor: "bg-blue-50",
    stocks: cryptoStocks.slice(0, 15),
  },
  {
    id: "etfs",
    title: "ETFs",
    color: "border-purple-500",
    bgColor: "bg-purple-50",
    stocks: etfStocks.slice(0, 15),
  },
  {
    id: "top-gainers",
    title: "Top Gainers",
    color: "border-green-600",
    bgColor: "bg-green-50",
    stocks: topStocks.filter((stock) => stock.changePercent > 3).slice(0, 15),
  },
]

export default function ChallengePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/category/${categoryId}`)
  }

  const handleStockClick = (symbol: string) => {
    router.push(`/challenge/stock/${symbol}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
      {/* Header with the exact yellow gradient from Figma */}
      <div className="bg-gradient-to-b from-[#f7b104] to-[#d48f03] p-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8"></div> {/* Spacer for alignment */}
          <div className="text-center">
            <h1 className="text-white text-2xl font-bold">TRADE</h1>
            <p className="text-white text-sm opacity-90">NOV. 2024 STOCK CHALLENGE</p>
          </div>
          <ProfileDropdown />
        </div>

        {/* Search Bar */}
        <SearchableStockInput placeholder="Search stocks, crypto, and ETFs" className="w-full" />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 -mt-4 relative z-10">
        <h2 className="text-xl font-bold mb-4 text-black">Browse Categories</h2>

        {/* Horizontally Scrolling Categories */}
        <div className="space-y-6">
          {stockCategories.map((category) => (
            <div key={category.id} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-black">{category.title}</h3>
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className="text-[#0052cc] text-sm font-medium transition-all duration-200 active:scale-95"
                >
                  View All
                </button>
              </div>

              {/* Horizontal Scroll Container */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-3 pb-2" style={{ width: "max-content" }}>
                  {category.stocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleStockClick(stock.symbol)}
                      className="flex-shrink-0 w-32 bg-white rounded-xl p-3 shadow-sm transition-all duration-200 active:scale-95 hover:shadow-md"
                    >
                      <div className="text-center">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 overflow-hidden"
                          style={{ backgroundColor: stock.logoBackground || "#000000" }}
                        >
                          {stock.logoType === "text" ? (
                            <span className="text-white font-bold text-sm">{stock.logoText}</span>
                          ) : stock.logoType === "image" ? (
                            <div className="w-8 h-5" style={{ backgroundColor: stock.logoColor }}></div>
                          ) : (
                            <span className="text-white text-lg">{stock.logoEmoji || stock.symbol?.charAt(0)}</span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-black mb-1">{stock.symbol}</h4>
                        <p className="text-xs text-gray-500 truncate mb-2">{stock.name}</p>
                        <p
                          className={`text-sm font-bold ${stock.changePercent >= 0 ? "text-[#0fae37]" : "text-[#d93025]"}`}
                        >
                          {stock.changePercent >= 0 ? "+" : ""}
                          {stock.changePercent}%
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
