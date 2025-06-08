"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Search, Trophy, TrendingUp, TrendingDown } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import BottomNavigation from "@/components/bottom-navigation"
import { createClientSupabaseClient } from "@/lib/supabase"

type Player = {
  id: string
  username: string
  display_name: string
  profile_picture_url: string | null
  total_return: number
  daily_return: number
  current_balance: number
  rank: number
  joined_at: string
}

export default function PlayersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [players, setPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const gameCode = searchParams.get("gameCode") || "112024"

  // Generate 35 mock players for November 2024
  const generateMockPlayers = useCallback(() => {
    const names = [
      "John Smith",
      "Sarah Johnson",
      "Mike Chen",
      "Emily Davis",
      "Alex Wilson",
      "Jessica Brown",
      "David Lee",
      "Amanda Taylor",
      "Chris Anderson",
      "Lisa Garcia",
      "Ryan Martinez",
      "Nicole White",
      "Kevin Thompson",
      "Rachel Clark",
      "Jason Rodriguez",
      "Michelle Lewis",
      "Brandon Walker",
      "Stephanie Hall",
      "Tyler Young",
      "Ashley King",
      "Justin Wright",
      "Megan Lopez",
      "Andrew Hill",
      "Samantha Green",
      "Daniel Adams",
      "Brittany Baker",
      "Matthew Nelson",
      "Kayla Carter",
      "Joshua Mitchell",
      "Lauren Perez",
      "Nicholas Roberts",
      "Alexis Turner",
      "Jonathan Phillips",
      "Victoria Campbell",
      "Anthony Parker",
    ]

    const profileImages = [
      "/thoughtful-man-glasses.png",
      "/diverse-woman-portrait.png",
      "/young-man-contemplative.png",
      "/woman-brown-hair.png",
      "/asian-man-glasses.png",
      "/blonde-woman-portrait.png",
      "/black-man-with-beard.png",
      "/red-haired-woman.png",
      "/short-haired-man.png",
      "/latina-woman-smiling.png",
      "/young-man-glasses.png",
      "/young-latina-woman.png",
      "/curly-haired-man.png",
      "/woman-long-dark-hair.png",
      "/older-man-gray-hair.png",
      "/short-haired-woman.png",
      "/bearded-man-portrait.png",
      "/woman-with-glasses.png",
      "/dark-haired-man.png",
      "/curly-haired-woman.png",
      "/young-man-blonde-hair.png",
      "/older-woman-gray-hair.png",
      "/smiling-man.png",
    ]

    return names
      .map((name, index) => ({
        id: `player-${index + 1}`,
        username: name.toLowerCase().replace(" ", ""),
        display_name: name,
        profile_picture_url: profileImages[index % profileImages.length],
        total_return: Math.random() * 50 - 10, // -10% to +40%
        daily_return: Math.random() * 10 - 2, // -2% to +8%
        current_balance: 100000 + (Math.random() * 50000 - 10000), // $90k to $140k
        rank: index + 1,
        joined_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      }))
      .sort((a, b) => b.total_return - a.total_return)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }))
  }, [])

  // Fetch players data
  const fetchPlayers = useCallback(async () => {
    setLoading(true)
    try {
      if (gameCode === "112024") {
        // Use mock data for November 2024
        const mockPlayers = generateMockPlayers()
        setPlayers(mockPlayers)
        setFilteredPlayers(mockPlayers)
        setLoading(false)
        return
      }

      const supabase = createClientSupabaseClient()

      const { data: playersData, error } = await supabase
        .from("game_participants")
        .select(`
          user_id,
          total_return,
          daily_return,
          current_balance,
          rank,
          joined_at,
          users (
            username,
            display_name,
            profile_picture_url
          )
        `)
        .eq("game_id", gameCode)
        .order("total_return", { ascending: false })

      if (error) {
        console.error("Error fetching players:", error)
        const mockPlayers = generateMockPlayers()
        setPlayers(mockPlayers)
        setFilteredPlayers(mockPlayers)
        setLoading(false)
        return
      }

      const formattedPlayers = playersData.map((player, index) => ({
        id: player.user_id,
        username: player.users?.username || "unknown",
        display_name: player.users?.display_name || "Unknown Player",
        profile_picture_url: player.users?.profile_picture_url,
        total_return: player.total_return,
        daily_return: player.daily_return,
        current_balance: player.current_balance,
        rank: index + 1,
        joined_at: player.joined_at,
      }))

      setPlayers(formattedPlayers)
      setFilteredPlayers(formattedPlayers)
    } catch (err) {
      console.error("Error fetching players:", err)
      const mockPlayers = generateMockPlayers()
      setPlayers(mockPlayers)
      setFilteredPlayers(mockPlayers)
    } finally {
      setLoading(false)
    }
  }, [gameCode, generateMockPlayers])

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      if (!query.trim()) {
        setFilteredPlayers(players)
        return
      }

      const filtered = players.filter(
        (player) =>
          player.display_name.toLowerCase().includes(query.toLowerCase()) ||
          player.username.toLowerCase().includes(query.toLowerCase()),
      )
      setFilteredPlayers(filtered)
    },
    [players],
  )

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
        <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-8">
          <div className="flex justify-between items-center mb-3">
            <TouchFeedback className="text-white p-2" onClick={() => router.back()}>
              <ArrowLeft size={28} />
            </TouchFeedback>
            <div className="w-10"></div>
          </div>
          <h1 className="text-white text-center text-3xl font-bold">Loading Players...</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#f7b104] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-8">
        <div className="flex justify-between items-center mb-3">
          <TouchFeedback className="text-white p-2" onClick={() => router.back()}>
            <ArrowLeft size={28} />
          </TouchFeedback>
          <div className="w-10"></div>
        </div>
        <h1 className="text-white text-center text-3xl font-bold mb-2">All Players</h1>
        <p className="text-white text-center text-lg">
          {gameCode === "112024" ? "Nov. 2024 Stock Challenge" : `Game ${gameCode}`}
        </p>
        <p className="text-white text-center text-sm mt-2">
          {filteredPlayers.length} {filteredPlayers.length === 1 ? "player" : "players"}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 -mt-5 relative z-10">
        {/* Search Bar */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="relative rounded-full bg-gray-100 flex items-center px-4 py-2">
            <Search className="text-gray-500 mr-2" size={20} />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent w-full outline-none text-base"
            />
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-3">
          {filteredPlayers.map((player, index) => (
            <TouchFeedback
              key={player.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => router.push(`/profile/${player.username}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 mr-3">
                    {player.rank <= 3 ? (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          player.rank === 1 ? "bg-yellow-500" : player.rank === 2 ? "bg-gray-400" : "bg-orange-500"
                        }`}
                      >
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">#{player.rank}</span>
                      </div>
                    )}
                  </div>

                  {/* Profile Picture */}
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {player.profile_picture_url ? (
                      <img
                        src={player.profile_picture_url || "/placeholder.svg"}
                        alt={player.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-600">
                        {player.display_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{player.display_name}</h3>
                    <p className="text-gray-600 text-sm truncate">@{player.username}</p>
                    <p className="text-gray-500 text-xs">Joined {new Date(player.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Performance Data */}
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="flex items-center justify-end mb-1">
                    {player.total_return >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <p className={`font-bold ${player.total_return >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {player.total_return >= 0 ? "+" : ""}
                      {player.total_return.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm">${player.current_balance.toLocaleString()}</p>
                  <p className={`text-xs ${player.daily_return >= 0 ? "text-green-600" : "text-red-600"}`}>
                    Today: {player.daily_return >= 0 ? "+" : ""}
                    {player.daily_return.toFixed(2)}%
                  </p>
                </div>
              </div>
            </TouchFeedback>
          ))}
        </div>

        {filteredPlayers.length === 0 && searchQuery && (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-600 mb-2">No Players Found</h3>
            <p className="text-gray-500 text-sm">Try searching with a different name</p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
