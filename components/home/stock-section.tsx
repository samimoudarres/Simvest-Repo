"use client"
import Link from "next/link"
import { topStocks } from "@/lib/data"
import TouchFeedback from "@/components/touch-feedback"

interface StockSectionProps {
  sectionType: "top" | "more"
}

export default function StockSection({ sectionType }: StockSectionProps) {
  // Get different stocks based on section type
  const stocks = sectionType === "top" ? topStocks.slice(0, 4) : topStocks.slice(4, 8)

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {stocks.map((stock) => (
        <Link href={`/challenge/stock/${stock.symbol}`} key={stock.symbol}>
          <TouchFeedback>
            <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mr-3 text-white"
                  style={{ backgroundColor: stock.logoBackground }}
                >
                  {stock.logoType === "text" ? (
                    <span className="font-bold text-lg">{stock.logoText}</span>
                  ) : stock.logoType === "emoji" ? (
                    <span className="text-xl">{stock.logoEmoji}</span>
                  ) : (
                    <span className="text-lg">$</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{stock.symbol}</h4>
                  <p className="text-sm text-gray-500">{stock.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">${stock.price.toFixed(2)}</p>
                  <p className={`text-sm ${stock.changePercent > 0 ? "text-green-500" : "text-red-500"}`}>
                    {stock.changePercent > 0 ? "+" : ""}
                    {stock.changePercent}%
                  </p>
                </div>
                <div className="w-16 h-8">
                  <svg viewBox="0 0 100 30" className="w-full h-full">
                    <path
                      d={
                        stock.chartPath || "M0,15 L10,10 L20,20 L30,5 L40,15 L50,10 L60,20 L70,15 L80,5 L90,10 L100,15"
                      }
                      fill="none"
                      stroke={stock.changePercent > 0 ? "#0fae37" : "#d93025"}
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </TouchFeedback>
        </Link>
      ))}
    </div>
  )
}
