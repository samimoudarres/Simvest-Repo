"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, X } from "lucide-react"
import { topStocks, cryptoStocks, etfStocks } from "@/lib/data"
import type { Stock } from "@/lib/types"

export default function TradePage({ params }: { params: { symbol: string } }) {
  const router = useRouter()
  const [stock, setStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantityType, setQuantityType] = useState<"shares" | "dollars">("shares")
  const [actionType, setActionType] = useState<"buy" | "sell">("buy")
  const [quantity, setQuantity] = useState("")
  const [availableFunds, setAvailableFunds] = useState(31930.0)
  const [totalCost, setTotalCost] = useState("----.--")

  useEffect(() => {
    // Simulate API loading
    setLoading(true)
    setTimeout(() => {
      // Find the stock in our data
      const allStocks = [...topStocks, ...cryptoStocks, ...etfStocks]
      const foundStock = allStocks.find((s) => s.symbol === params.symbol)
      setStock(foundStock || null)
      setLoading(false)
    }, 300)
  }, [params.symbol])

  useEffect(() => {
    if (stock && quantity) {
      const numericQuantity = Number.parseFloat(quantity)
      if (!isNaN(numericQuantity)) {
        if (quantityType === "shares") {
          setTotalCost((numericQuantity * stock.price).toFixed(2))
        } else {
          setTotalCost(numericQuantity.toFixed(2))
        }
      } else {
        setTotalCost("----.--")
      }
    } else {
      setTotalCost("----.--")
    }
  }, [quantity, stock, quantityType])

  const handleNumberPress = (num: string) => {
    if (quantity.length < 10) {
      setQuantity(quantity + num)
    }
  }

  const handleBackspace = () => {
    setQuantity(quantity.slice(0, -1))
  }

  const handleReviewOrder = () => {
    if (stock && quantity && Number.parseFloat(quantity) > 0) {
      router.push(
        `/challenge/stock/${params.symbol}/review?quantity=${quantity}&type=${quantityType}&action=${actionType}`,
      )
    }
  }

  if (!stock && !loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white pb-20">
        <div className="p-5">
          <button onClick={() => router.back()} className="transition-all duration-200 active:scale-95">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold mt-4">Stock Not Found</h2>
          <p className="mt-2">The stock you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="p-5">
        <button onClick={() => router.back()} className="transition-all duration-200 active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-4xl font-bold mt-4">
          {actionType === "buy" ? "Buy" : "Sell"} {params.symbol}
        </h1>
        <p className="text-gray-500 mt-1">${availableFunds.toFixed(2)} Available to Trade</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 pt-8">
        {/* Quantity Selector */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4">Quantity</h2>
          <div className="flex bg-gray-100 rounded-full p-1 mb-4">
            <button
              className={`flex-1 py-2 px-4 rounded-full text-center font-medium transition-all duration-200 active:scale-95 ${
                quantityType === "shares" ? "bg-[#00688B] text-white" : "text-gray-700"
              }`}
              onClick={() => setQuantityType("shares")}
            >
              Shares
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-full text-center font-medium transition-all duration-200 active:scale-95 ${
                quantityType === "dollars" ? "bg-[#00688B] text-white" : "text-gray-700"
              }`}
              onClick={() => setQuantityType("dollars")}
            >
              Dollars
            </button>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <input
              type="text"
              value={quantity}
              readOnly
              placeholder={`Enter ${quantityType === "shares" ? "Shares" : "Dollars"}`}
              className="w-full text-xl focus:outline-none"
            />
          </div>
        </div>

        {/* Action Selector */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4">Action</h2>
          <div className="flex bg-gray-100 rounded-full p-1">
            <button
              className={`flex-1 py-2 px-4 rounded-full text-center font-medium transition-all duration-200 active:scale-95 ${
                actionType === "buy" ? "bg-[#00688B] text-white" : "text-gray-700"
              }`}
              onClick={() => setActionType("buy")}
            >
              Buy
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-full text-center font-medium transition-all duration-200 active:scale-95 ${
                actionType === "sell" ? "bg-[#00688B] text-white" : "text-gray-700"
              }`}
              onClick={() => setActionType("sell")}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Competition Selector */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4">Competition</h2>
          <button className="flex justify-between items-center bg-gray-100 rounded-full py-3 px-5 w-full transition-all duration-200 active:scale-95">
            <span className="font-medium">Nov. 2024 Stock Challenge</span>
            <span>▼</span>
          </button>
        </div>

        {/* Market Price */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4">Market Price</h2>
          <div className="text-right">
            <span className="text-4xl font-bold">${stock?.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Total Cost */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Total Cost</h2>
          <div className="text-right">
            <span className="text-4xl font-bold">${totalCost}</span>
          </div>
        </div>

        {/* Review Order Button */}
        <button
          className={`w-full py-4 rounded-full text-center text-white text-xl font-bold transition-all duration-200 active:scale-95 ${
            quantity && Number.parseFloat(quantity) > 0 ? "bg-[#00688B]" : "bg-gray-300"
          }`}
          onClick={handleReviewOrder}
          disabled={!quantity || Number.parseFloat(quantity) <= 0}
        >
          Review Order
        </button>
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-1 bg-gray-200 p-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            className="bg-white p-4 text-center font-bold text-2xl transition-all duration-200 active:scale-95"
            onClick={() => handleNumberPress(num.toString())}
          >
            {num}
            <div className="text-xs text-gray-500">
              {num === 2
                ? "ABC"
                : num === 3
                  ? "DEF"
                  : num === 4
                    ? "GHI"
                    : num === 5
                      ? "JKL"
                      : num === 6
                        ? "MNO"
                        : num === 7
                          ? "PQRS"
                          : num === 8
                            ? "TUV"
                            : num === 9
                              ? "WXYZ"
                              : ""}
            </div>
          </button>
        ))}
        <button
          className="bg-white p-4 text-center font-bold text-2xl transition-all duration-200 active:scale-95"
          onClick={() => handleNumberPress("0")}
        >
          0
        </button>
        <button
          className="bg-white p-4 text-center font-bold text-2xl col-span-1 transition-all duration-200 active:scale-95"
          onClick={() => handleNumberPress(".")}
        >
          .
        </button>
        <button
          className="bg-white p-4 text-center font-bold text-2xl flex items-center justify-center transition-all duration-200 active:scale-95"
          onClick={handleBackspace}
        >
          <X size={24} />
        </button>
      </div>
    </div>
  )
}
