"use client"

import { useRouter } from "next/navigation"
import type { Stock } from "@/lib/types"

interface StockCardProps {
  stock: Stock
}

export default function StockCard({ stock }: StockCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/stock/${stock.symbol}`)
  }

  const isPositive = stock.changePercent > 0
  const textColor = isPositive ? "text-[#0fae37]" : "text-[#d93025]"

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-5 shadow-lg cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
      style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
    >
      <div className="flex justify-center mb-3">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: stock.logoBackground }}
        >
          {stock.logoType === "text" ? (
            <span className="text-white text-2xl font-bold">{stock.logoText}</span>
          ) : stock.logoType === "image" ? (
            <div className="w-10 h-7" style={{ backgroundColor: stock.logoColor }}></div>
          ) : (
            <span className="text-white text-2xl">{stock.logoEmoji}</span>
          )}
        </div>
      </div>
      <h4 className="text-2xl font-bold text-center mb-1">{stock.symbol}</h4>
      <p className="text-center text-gray-500 text-sm truncate mb-2">{stock.name}</p>
      <p className={`text-center ${textColor} text-xl font-bold mb-2`}>
        {isPositive ? "+" : ""}
        {stock.changePercent}%
      </p>
      <div className="h-8 mt-2">
        <svg viewBox="0 0 100 30" className="w-full h-full">
          <path d={stock.chartPath} fill="none" stroke={isPositive ? "#0fae37" : "#d93025"} strokeWidth="2" />
        </svg>
      </div>
    </div>
  )
}
