"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { executeTradeAndPost } from "@/lib/trading-system-fixed"
import { getStockData } from "@/lib/stock-data-service"
import type { EnhancedStock } from "@/lib/stock-data-service"

export default function ConfirmOrderPage({ params }: { params: { symbol: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [stock, setStock] = useState<EnhancedStock | null>(null)
  const [loading, setLoading] = useState(true)
  const [rationale, setRationale] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [errorDetails, setErrorDetails] = useState<any>(null)

  const quantity = searchParams.get("quantity") || "0"
  const type = searchParams.get("type") || "shares"
  const action = searchParams.get("action") || "buy"

  useEffect(() => {
    // Fetch real stock data from Alpha Vantage
    const fetchStockData = async () => {
      setLoading(true)
      try {
        console.log("📊 Fetching stock data for:", params.symbol)
        const stockData = await getStockData(params.symbol)
        setStock(stockData)
        console.log("✅ Stock data loaded:", stockData)
      } catch (error) {
        console.error("❌ Error fetching stock data:", error)
        setError("Failed to load stock data")
      } finally {
        setLoading(false)
      }
    }

    fetchStockData()
  }, [params.symbol])

  const handleRationaleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRationale(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }

  // COMPLETELY FIXED TRADE EXECUTION
  const handleButtonClick = async () => {
    if (!user || !stock) {
      setError("User not authenticated or stock data not loaded")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setErrorDetails(null)

    try {
      // Calculate trade details
      const numericQuantity = Number.parseFloat(quantity)
      const actualShares = type === "shares" ? numericQuantity : Math.floor(numericQuantity / stock.price)

      if (actualShares <= 0) {
        setError("Invalid quantity specified")
        setIsSubmitting(false)
        return
      }

      console.log("🔄 Processing trade:", {
        user: user.id,
        stock: stock.symbol,
        quantity: actualShares,
        price: stock.price,
        action,
        rationale: rationale.trim(),
      })

      // Execute trade and create activity post
      const result = await executeTradeAndPost(
        user.id,
        "112024", // Game ID
        stock.symbol,
        stock.name,
        actualShares,
        stock.price,
        action as "buy" | "sell",
        rationale.trim() || undefined,
      )

      console.log("📊 Trade result:", result)

      if (!result.success) {
        console.error("❌ Trade execution failed:", result.error)
        setError(result.error || "Failed to execute trade")
        setErrorDetails(result.errorDetails)
        return
      }

      console.log("✅ Trade executed successfully:", result)
      setSuccess(true)

      // Navigate to activity feed after showing success
      setTimeout(() => {
        router.push("/challenge/activity")
      }, 2000)
    } catch (error) {
      console.error("💥 Error processing trade:", error)
      setError(error instanceof Error ? error.message : "Failed to process trade")
      setErrorDetails(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white pb-20">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00688B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading stock data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="flex flex-col min-h-screen bg-white pb-20">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Stock Not Found</h2>
            <p className="text-gray-600 mb-4">Unable to load stock data for {params.symbol}</p>
            <button
              onClick={() => router.back()}
              className="bg-[#00688B] text-white px-6 py-2 rounded-lg transition-all duration-200 active:scale-95"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-white pb-20">
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
          <div className="text-green-500 mb-6">
            <CheckCircle size={80} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-green-600">Trade Executed!</h1>
          <p className="text-xl text-center text-gray-600 mb-8">
            Your {action} order for {quantity} {type === "shares" ? "shares" : "dollars"} of {stock.symbol} has been
            completed successfully.
            <br />
            Check your portfolio and activity feed for updates.
          </p>
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  const actualShares =
    type === "shares" ? Number.parseFloat(quantity) : Math.floor(Number.parseFloat(quantity) / stock.price)
  const totalCost = actualShares * stock.price

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Main Content */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="text-[#00688B] mb-6">
          <CheckCircle size={80} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-bold mb-4">Order Received!</h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          Your order for {actualShares} shares of {stock.symbol} at ${stock.price.toFixed(2)} per share
          <br />
          Total: ${totalCost.toFixed(2)}
        </p>

        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle size={20} className="text-red-600 mr-2" />
              <p className="text-red-600 font-medium">Trade Execution Failed</p>
            </div>
            <p className="text-red-600 text-sm">{error}</p>
            {errorDetails && (
              <details className="mt-2">
                <summary className="text-red-500 text-xs cursor-pointer">Show technical details</summary>
                <pre className="text-xs text-red-500 mt-1 overflow-auto">{JSON.stringify(errorDetails, null, 2)}</pre>
              </details>
            )}
          </div>
        )}

        <div className="w-full mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
              <span className="text-gray-500">💡</span>
            </div>
            <h2 className="text-2xl font-bold">Share rationale for your trade:</h2>
          </div>
          <textarea
            value={rationale}
            onChange={handleRationaleChange}
            placeholder={`I ${action === "buy" ? "bought" : "sold"} ${stock.name} because I think their earnings call showed...`}
            className="w-full border border-gray-300 rounded-lg p-4 h-40 text-lg focus:outline-none focus:ring-2 focus:ring-[#00688B] disabled:bg-gray-100"
            disabled={isSubmitting}
          />
        </div>

        <button
          className={`w-full py-4 rounded-full text-center text-white text-xl font-bold transition-all duration-200 active:scale-95 flex items-center justify-center ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#00688B] hover:bg-[#005577]"
          }`}
          onClick={handleButtonClick}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={24} className="animate-spin mr-2" />
              Processing Trade...
            </>
          ) : isTyping ? (
            "Execute Trade & Share"
          ) : (
            "Execute Trade"
          )}
        </button>

        {isSubmitting && (
          <p className="text-gray-500 text-sm mt-4 text-center">Executing your trade and updating your portfolio...</p>
        )}
      </div>
    </div>
  )
}
