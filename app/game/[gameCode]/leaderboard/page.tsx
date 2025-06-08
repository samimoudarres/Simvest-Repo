"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, MoreVertical, Bell, Crown, TrendingUp, TrendingDown } from "lucide-react"
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

type LeaderboardEntry = {
  rank: number
  user_id: string
  username: string
  display_name: string
  profile_picture_url: string | null
  total_return: number
  total_return_amount: number
  current_balance: number
  is_host: boolean
}

export default function GameLeaderboardPage() {
  const router = useRouter()
  const params = useParams()
  const gameCode = params.gameCode as string

  const [game, setGame] = useState<GameData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!gameCode) return

      try {
        const supabase = createClientSupabaseClient()

        // Fetch game data
        const { data: gameData, error: gameError } = await supabase
          .from("games")
          .select(`
            id, title, game_code, current_players, host_id,
            users:host_id (display_name)
          `)
          .eq("game_code", gameCode)
          .single()

        if (gameError || !gameData) throw new Error("Game not found")

        setGame({
          ...gameData,
          host_name: gameData.users?.display_name || "Unknown Host",
        })

        // Fetch leaderboard data
        const { data: participantsData, error: participantsError } = await supabase
          .from("game_participants")
          .select(`
            rank, total_return, current_balance, user_id,
            users (username, display_name, profile_picture_url)
          `)
          .eq("game_id", gameData.id)
          .order("rank", { ascending: true })

        if (participantsError) {
          console.error("Error fetching participants:", participantsError)
        }

        // Format leaderboard data with mock performance data
        const mockLeaderboard: LeaderboardEntry[] = [
          {
            rank: 1,
            user_id: gameData.host_id || "",
            username: gameData.users?.display_name?.toLowerCase().replace(" ", "") || "host",
            display_name: gameData.users?.display_name || "Host",
            profile_picture_url: null,
            total_return: 5.2,
            total_return_amount: 5200,
            current_balance: 105200,
            is_host: true,
          },
          {
            rank: 2,
            user_id: "user2",
            username: "trader_pro",
            display_name: "Trading Pro",
            profile_picture_url: null,
            total_return: 3.8,
            total_return_amount: 3800,
            current_balance: 103800,
            is_host: false,
          },
          {
            rank: 3,
            user_id: "user3",
            username: "stock_master",
            display_name: "Stock Master",
            profile_picture_url: null,
            total_return: 2.1,
            total_return_amount: 2100,
            current_balance: 102100,
            is_host: false,
          },
          {
            rank: 4,
            user_id: "user4",
            username: "investor_jane",
            display_name: "Investor Jane",
            profile_picture_url: null,
            total_return: -0.5,
            total_return_amount: -500,
            current_balance: 99500,
            is_host: false,
          },
        ]

        setLeaderboard(mockLeaderboard)
      } catch (err) {
        console.error("Error fetching leaderboard data:", err)
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
        <h2 className="text-white text-center text-lg font-medium mb-4">Leaderboard</h2>

        {/* Top 3 Display */}
        {leaderboard.length >= 3 && (
          <div className="flex justify-center items-end mb-4 space-x-4">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-300 border-4 border-white flex items-center justify-center mb-2 mx-auto">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <p className="text-white text-sm font-medium">{leaderboard[1].display_name}</p>
              <p className="text-white text-xs">+{leaderboard[1].total_return}%</p>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-400 border-4 border-white flex items-center justify-center mb-2 mx-auto relative">
                <Crown className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
              </div>
              <p className="text-white text-sm font-medium">{leaderboard[0].display_name}</p>
              <p className="text-white text-xs">+{leaderboard[0].total_return}%</p>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange-400 border-4 border-white flex items-center justify-center mb-2 mx-auto">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <p className="text-white text-sm font-medium">{leaderboard[2].display_name}</p>
              <p className="text-white text-xs">+{leaderboard[2].total_return}%</p>
            </div>
          </div>
        )}

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0,50 C150,150 350,0 500,50 L500,150 L0,150 Z" fill="#f7f7f7" opacity="0.2"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto -mt-10 relative z-20">
        {/* Full Leaderboard */}
        <div className="px-4 mb-6">
          <h3 className="text-xl font-bold tracking-wider mb-3 text-left">FULL RANKINGS</h3>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {leaderboard.map((player, index) => (
              <div key={player.user_id} className="flex items-center p-4 border-b last:border-b-0">
                {/* Rank */}
                <div className="w-12 h-12 flex items-center justify-center mr-4">
                  {player.rank <= 3 ? (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        player.rank === 1 ? "bg-yellow-400" : player.rank === 2 ? "bg-gray-400" : "bg-orange-400"
                      }`}
                    >
                      {player.rank === 1 ? (
                        <Crown className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-bold">{player.rank}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 font-bold text-lg">{player.rank}</span>
                  )}
                </div>

                {/* Profile */}
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden">
                  {player.profile_picture_url ? (
                    <img
                      src={player.profile_picture_url || "/placeholder.svg"}
                      alt={player.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-medium">
                      {player.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="font-bold text-left">{player.display_name}</p>
                    {player.is_host && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Host</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm text-left">@{player.username}</p>
                </div>

                {/* Performance */}
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    {player.total_return >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`font-bold ${player.total_return >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {player.total_return >= 0 ? "+" : ""}
                      {player.total_return}%
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">${player.current_balance.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Stats */}
        <div className="px-4 mb-20">
          <h3 className="text-xl font-bold tracking-wider mb-3 text-left">GAME STATS</h3>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Total Players</p>
                <p className="font-bold text-xl text-left">{leaderboard.length}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Top Performer</p>
                <p className="font-bold text-xl text-left text-green-600">+{leaderboard[0]?.total_return || 0}%</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Average Return</p>
                <p className="font-bold text-xl text-left">
                  +
                  {(
                    leaderboard.reduce((sum, player) => sum + player.total_return, 0) / leaderboard.length || 0
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Game Code</p>
                <p className="font-bold text-xl text-left text-[#f7b104]">{game.game_code}</p>
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
