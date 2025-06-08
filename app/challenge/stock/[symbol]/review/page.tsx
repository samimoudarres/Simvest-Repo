"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { topStocks, cryptoStocks, etfStocks } from "@/lib/data"
import type { Stock } from "@/lib/types"

export default function ReviewOrderPage({ params }: { params: { symbol: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [stock, setStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)

  const quantity = searchParams.get("quantity") || "0"
  const type = searchParams.get("type") || "shares"
  const action = searchParams.get("action") || "buy"

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

  const handlePlaceOrder = () => {
    router.push(`/challenge/stock/${params.symbol}/confirm?quantity=${quantity}&type=${type}&action=${action}`)
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

  // Calculate values
  const numericQuantity = Number.parseFloat(quantity)
  const orderValue = type === "shares" ? numericQuantity * (stock?.price || 0) : numericQuantity

  const totalValue = orderValue // In a real app, you'd add fees here

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="p-5 border-b">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="transition-all duration-200 active:scale-95">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold ml-4">Review Order</h1>
        </div>
      </div>

      {/* Stock Info */}
      <div className="p-5 flex flex-col items-center border-b">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: stock?.logoBackground || "#000000" }}
        >
          {stock?.logoType === "text" ? (
            <span className="text-white font-bold text-3xl">{stock?.logoText}</span>
          ) : stock?.logoType === "image" ? (
            <div className="w-16 h-10" style={{ backgroundColor: stock?.logoColor }}></div>
          ) : (
            <span className="text-white text-3xl">{stock?.logoEmoji || stock?.symbol?.charAt(0)}</span>
          )}
        </div>
        <h2 className="text-2xl font-bold">{stock?.name}</h2>
        <h3 className="text-4xl text-gray-500 mb-4">{stock?.symbol}</h3>
        <div className="bg-[#00b33c] text-white font-bold py-2 px-6 rounded-full text-xl uppercase">
          {action === "buy" ? "BUYING" : "SELLING"} ${orderValue.toFixed(2)} AT MARKET
        </div>
      </div>

      {/* Order Details */}
      <div className="flex-1 p-5">
        <div className="border-b py-4 flex justify-between">
          <span className="text-2xl">Game</span>
          <span className="text-2xl">Nov. 2024 Stock Ch...</span>
        </div>
        <div className="border-b py-4 flex justify-between">
          <span className="text-2xl">Symbol</span>
          <span className="text-2xl">{stock?.symbol}</span>
        </div>
        <div className="border-b py-4 flex justify-between">
          <span className="text-2xl">Action</span>
          <span className="text-2xl capitalize">{action}</span>
        </div>
        <div className="border-b py-4 flex justify-between">
          <span className="text-2xl">Quantity Type</span>
          <span className="text-2xl capitalize">{type}</span>
        </div>
        <div className="border-b py-4 flex justify-between">
          <span className="text-2xl">Quantity</span>
          <span className="text-2xl">
            {type === "shares" ? numericQuantity.toString() : `$${numericQuantity.toFixed(2)}`}
          </span>
        </div>
        <div className="border-b py-4 flex justify-between">
          <span className="text-2xl">Order Value</span>
          <span className="text-2xl">${orderValue.toFixed(2)}</span>
        </div>
        <div className="py-4 flex justify-between">
          <span className="text-2xl font-bold">Total Value</span>
          <span className="text-2xl font-bold">${totalValue.toFixed(2)}</span>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="p-5">
        <button
          className="w-full py-4 bg-[#00688B] rounded-full text-center text-white text-xl font-bold transition-all duration-200 active:scale-95"
          onClick={handlePlaceOrder}
        >
          Place Order
        </button>
      </div>
    </div>
  )
}
