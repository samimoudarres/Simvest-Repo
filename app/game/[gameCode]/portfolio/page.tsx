"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, MoreVertical, Bell, TrendingUp, TrendingDown, Plus, Minus } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import ChallengeBottomNavigation from "@/components/challenge-bottom-navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

type GameData = {
  id: string
  title: string
  host_name: string
  game_code: string
  current_players: number
}

type HoldingData = {
  symbol: string
  company_name: string
  shares: number
  avg_price: number
  current_price: number
  total_value: number
  gain_loss: number
  gain_loss_percent: number
}

export default function GamePortfolioPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const gameCode = params.gameCode as string

  const [game, setGame] = useState<GameData | null>(null)
  const [holdings, setHoldings] = useState<HoldingData[]>([])
  const [loading, setLoading] = useState(true)
  const [portfolioValue, setPortfolioValue] = useState(100000)
  const [totalGainLoss, setTotalGainLoss] = useState(0)
  const [totalGainLossPercent, setTotalGainLossPercent] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      if (!gameCode) return

      try {
        const supabase = createClientSupabaseClient()

        // Fetch game data
        const { data: gameData, error: gameError } = await supabase
          .from("games")
          .select(`
            id, title, game_code, current_players,
            users:host_id (display_name)
          `)
          .eq("game_code", gameCode)
          .single()

        if (gameError || !gameData) throw new Error("Game not found")

        setGame({
          ...gameData,
          host_name: gameData.users?.display_name || "Unknown Host",
        })

        // Mock portfolio data - in real app, fetch from database
        const mockHoldings: HoldingData[] = [
          {
            symbol: "NVDA",
            company_name: "NVIDIA Corporation",
            shares: 10,
            avg_price: 271.3,
            current_price: 285.4,
            total_value: 2854,
            gain_loss: 141,
            gain_loss_percent: 5.2,
          },
          {
            symbol: "AAPL",
            company_name: "Apple Inc.",
            shares: 15,
            avg_price: 185.5,
            current_price: 189.2,
            total_value: 2838,
            gain_loss: 55.5,
            gain_loss_percent: 2.0,
          },
          {
            symbol: "MSFT",
            company_name: "Microsoft Corporation",
            shares: 8,
            avg_price: 342.1,
            current_price: 338.9,
            total_value: 2711.2,
            gain_loss: -25.6,
            gain_loss_percent: -0.9,
          },
        ]

        setHoldings(mockHoldings)

        // Calculate totals
        const totalValue = mockHoldings.reduce((sum, holding) => sum + holding.total_value, 0)
        const totalGain = mockHoldings.reduce((sum, holding) => sum + holding.gain_loss, 0)
        const totalPercent = (totalGain / (totalValue - totalGain)) * 100

        setPortfolioValue(totalValue)
        setTotalGainLoss(totalGain)
        setTotalGainLossPercent(totalPercent)
      } catch (err) {
        console.error("Error fetching portfolio data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [gameCode])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
        <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-16">
          <div className="flex justify-between items-center mb-3">
            <TouchFeedback className="text-white p-2" onClick={() => router.back()}>
              <ArrowLeft size={28} />
            </TouchFeedback>
            <div className="w-10"></div>
          </div>
          <h1 className="text-white text-center text-3xl font-bold">Loading...</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#f7b104] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
        <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-16">
          <h1 className="text-white text-center text-3xl font-bold">Game Not Found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
      {/* Header - Exact replica */}
      <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-16 relative z-10">
        <div className="flex justify-between items-center mb-3">
          <TouchFeedback className="text-white p-2" onClick={() => router.push(`/game/${gameCode}`)}>
            <ArrowLeft size={28} />
          </TouchFeedback>
          <div className="flex">
            <TouchFeedback className="text-white p-2 mr-1">
              <Bell size={24} />
            </TouchFeedback>
            <TouchFeedback className="text-white p-2">
              <MoreVertical size={24} />
            </TouchFeedback>
          </div>
        </div>

        <h1 className="text-white text-center text-3xl font-bold mb-2">{game.title}</h1>
        <h2 className="text-white text-center text-lg font-medium mb-4">Portfolio</h2>

        {/* Portfolio Value Display */}
        <div className="text-center mb-4">
          <p className="text-white text-4xl font-bold">${portfolioValue.toLocaleString()}</p>
          <div className="flex items-center justify-center mt-2">
            {totalGainLoss >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-300 mr-1" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-300 mr-1" />
            )}
            <span className={`text-lg font-medium ${totalGainLoss >= 0 ? "text-green-300" : "text-red-300"}`}>
              {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toFixed(2)} ({totalGainLossPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0,50 C150,150 350,0 500,50 L500,150 L0,150 Z" fill="#f7f7f7" opacity="0.2"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto -mt-10 relative z-20">
        {/* Holdings Section */}
        <div className="px-4 mb-6">
          <h3 className="text-xl font-bold tracking-wider mb-3 text-left">YOUR HOLDINGS</h3>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {holdings.length > 0 ? (
              holdings.map((holding, index) => (
                <div key={holding.symbol} className="p-4 border-b last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-lg text-left">{holding.symbol}</h4>
                        <div className="text-right">
                          <p className="font-bold text-lg">${holding.total_value.toLocaleString()}</p>
                          <div className="flex items-center justify-end">
                            {holding.gain_loss >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                holding.gain_loss >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {holding.gain_loss >= 0 ? "+" : ""}${holding.gain_loss.toFixed(2)} (
                              {holding.gain_loss_percent.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm text-left mb-2">{holding.company_name}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{holding.shares} shares</span>
                        <span>
                          Avg: ${holding.avg_price.toFixed(2)} | Current: ${holding.current_price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">📊</span>
                </div>
                <h4 className="font-bold text-gray-600 mb-2">No Holdings Yet</h4>
                <p className="text-gray-500 text-sm">Start trading to build your portfolio</p>
                <TouchFeedback
                  className="mt-4 bg-[#f7b104] text-white font-bold px-6 py-2 rounded-full"
                  onClick={() => router.push(`/challenge?gameCode=${gameCode}`)}
                >
                  Start Trading
                </TouchFeedback>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 mb-6">
          <h3 className="text-xl font-bold tracking-wider mb-3 text-left">QUICK ACTIONS</h3>
          <div className="grid grid-cols-2 gap-4">
            <TouchFeedback
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => router.push(`/challenge?gameCode=${gameCode}`)}
            >
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h4 className="font-bold text-center">Buy Stocks</h4>
              <p className="text-gray-500 text-sm text-center">Add to portfolio</p>
            </TouchFeedback>

            <TouchFeedback
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => router.push(`/challenge?gameCode=${gameCode}`)}
            >
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Minus className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h4 className="font-bold text-center">Sell Stocks</h4>
              <p className="text-gray-500 text-sm text-center">Reduce holdings</p>
            </TouchFeedback>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="px-4 mb-20">
          <h3 className="text-xl font-bold tracking-wider mb-3 text-left">PORTFOLIO SUMMARY</h3>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Total Value</p>
                <p className="font-bold text-xl text-left">${portfolioValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Day's Change</p>
                <p className={`font-bold text-xl text-left ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Holdings</p>
                <p className="font-bold text-xl text-left">{holdings.length}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Cash Available</p>
                <p className="font-bold text-xl text-left">${(100000 - portfolioValue + 100000).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <ChallengeBottomNavigation gameCode={gameCode} />
    </div>
  )
}
