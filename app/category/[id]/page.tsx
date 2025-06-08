"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search } from "lucide-react"
import { getAllCategoryStocks } from "@/lib/data"
import { categories } from "@/lib/data"
import type { Stock } from "@/lib/types"

export default function CategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<any>(null)

  useEffect(() => {
    // Find the category
    const foundCategory = categories.find((cat) => cat.id === params.id)
    setCategory(foundCategory)

    // Simulate API loading
    setLoading(true)
    setTimeout(() => {
      const categoryStocks = getAllCategoryStocks(params.id)
      setStocks(categoryStocks)
      setLoading(false)
    }, 800)
  }, [params.id])

  if (!category && !loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] max-w-md mx-auto p-5">
        <div className="flex items-center mb-4">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold ml-2">Category Not Found</h1>
        </div>
        <p>The category you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <div
        className="p-5 pb-6 sticky top-0 z-10"
        style={{
          background: category
            ? `linear-gradient(to bottom, ${category.borderColor}, ${category.shadowColor.replace("0.3", "1")})`
            : "linear-gradient(to bottom, #f7b104, #d48f03)",
        }}
      >
        <div className="flex items-center mb-4">
          <button onClick={() => router.back()} className="text-white p-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white text-2xl font-bold ml-2">{category?.name || "Loading..."}</h1>
        </div>

        {/* Search Bar */}
        <div className="relative rounded-full bg-[#252525]/20 flex items-center px-4 py-2">
          <Search className="text-white/70 mr-2" size={20} />
          <input
            type="text"
            placeholder={`Search ${category?.name || "stocks"}...`}
            className="bg-transparent text-white placeholder-white/70 w-full outline-none text-base"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-[#f7b104] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading stocks...</p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-600">No stocks found in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stocks.map((stock) => (
              <div
                key={stock.symbol}
                className="bg-white rounded-xl p-4 shadow-md flex items-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/stock/${stock.symbol}`)}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
                  style={{ backgroundColor: stock.logoBackground }}
                >
                  {stock.logoType === "text" ? (
                    <span className="text-white text-lg font-bold">{stock.logoText}</span>
                  ) : stock.logoType === "image" ? (
                    <div className="w-8 h-5" style={{ backgroundColor: stock.logoColor }}></div>
                  ) : (
                    <span className="text-white text-lg">{stock.logoEmoji}</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{stock.symbol}</h3>
                      <p className="text-gray-500 text-sm">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${stock.price.toLocaleString()}</p>
                      <p
                        className={`text-sm font-medium ${stock.changePercent > 0 ? "text-[#0fae37]" : "text-[#d93025]"}`}
                      >
                        {stock.changePercent > 0 ? "+" : ""}
                        {stock.changePercent}%
                      </p>
                    </div>
                  </div>

                  <div className="h-6 mt-2">
                    <svg viewBox="0 0 100 30" className="w-full h-full">
                      <path
                        d={stock.chartPath}
                        fill="none"
                        stroke={stock.changePercent > 0 ? "#0fae37" : "#d93025"}
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
