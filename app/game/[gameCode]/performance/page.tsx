"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, MoreVertical, Bell, TrendingUp, TrendingDown } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import ChallengeBottomNavigation from "@/components/challenge-bottom-navigation"
import { createClientSupabaseClient } from "@/lib/supabase"

type GameData = {
  id: string
  title: string
  host_name: string
  game_code: string
  current_players: number
}

export default function GamePerformancePage() {
  const router = useRouter()
  const params = useParams()
  const gameCode = params.gameCode as string

  const [game, setGame] = useState<GameData | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock performance data
  const [performanceData] = useState({
    totalReturn: 2.5,
    totalReturnAmount: 2500,
    dayReturn: 0.8,
    dayReturnAmount: 800,
    weekReturn: 1.2,
    monthReturn: 2.5,
    bestDay: 3.2,
    worstDay: -1.8,
    winRate: 68,
    totalTrades: 24,
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!gameCode) return

      try {
        const supabase = createClientSupabaseClient()

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
      } catch (err) {
        console.error("Error fetching game data:", err)
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
      {/* Header */}
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
        <h2 className="text-white text-center text-lg font-medium mb-4">Performance</h2>

        {/* Performance Summary */}
        <div className="text-center mb-4">
          <p className="text-white text-4xl font-bold">+{performanceData.totalReturn}%</p>
          <div className="flex items-center justify-center mt-2">
            <TrendingUp className="w-5 h-5 text-green-300 mr-1" />
            <span className="text-green-300 text-lg font-medium">
              +${performanceData.totalReturnAmount.toLocaleString()}
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
        {/* Performance Cards */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Today</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">+{performanceData.dayReturn}%</p>
              <p className="text-green-500 text-xs">+${performanceData.dayReturnAmount}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">This Week</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">+{performanceData.weekReturn}%</p>
              <p className="text-green-500 text-xs">Weekly gain</p>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="px-4 mb-6">
          <h3 className="text-xl font-bold tracking-wider mb-3 text-left">PERFORMANCE CHART</h3>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="h-48 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-medium">Portfolio Growth Chart</p>
                <p className="text-green-600 text-sm">+{performanceData.totalReturn}% Total Return</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="px-4 mb-6">
          <h3 className="text-xl font-bold tracking-wider mb-3 text-left">STATISTICS</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="p-4 border-r border-b border-gray-100">
                <p className="text-gray-500 text-sm">Best Day</p>
                <p className="font-bold text-lg text-green-600">+{performanceData.bestDay}%</p>
              </div>
              <div className="p-4 border-b border-gray-100">
                <p className="text-gray-500 text-sm">Worst Day</p>
                <p className="font-bold text-lg text-red-600">{performanceData.worstDay}%</p>
              </div>
              <div className="p-4 border-r border-gray-100">
                <p className="text-gray-500 text-sm">Win Rate</p>
                <p className="font-bold text-lg text-left">{performanceData.winRate}%</p>
              </div>
              <div className="p-4">
                <p className="text-gray-500 text-sm">Total Trades</p>
                <p className="font-bold text-lg text-left">{performanceData.totalTrades}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Performance */}
        <div className="px-4 mb-20">
          <h3 className="text-xl font-bold tracking-wider mb-3 text-left">RECENT PERFORMANCE</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {[
              { date: "Today", return: 0.8, amount: 800 },
              { date: "Yesterday", return: -0.3, amount: -300 },
              { date: "2 days ago", return: 1.2, amount: 1200 },
              { date: "3 days ago", return: 0.5, amount: 500 },
            ].map((day, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-left">{day.date}</p>
                  <p className="text-gray-500 text-sm text-left">Daily performance</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    {day.return >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`font-bold ${day.return >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {day.return >= 0 ? "+" : ""}
                      {day.return}%
                    </span>
                  </div>
                  <p className={`text-sm ${day.return >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {day.return >= 0 ? "+" : ""}${day.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <ChallengeBottomNavigation gameCode={gameCode} />
    </div>
  )
}
