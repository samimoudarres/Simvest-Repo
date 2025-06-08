"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, MoreVertical, Bell, ChevronRight, TrendingUp, TrendingDown, Users, Copy, Check } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

type GameData = {
  id: string
  title: string
  description: string | null
  host_id: string | null
  host_name: string
  game_code: string
  start_date: string | null
  end_date: string | null
  current_players: number | null
  max_players: number | null
  buy_in_amount: number | null
  prize_pool: number | null
  status: string
  created_at: string
}

type PlayerData = {
  id: string
  user_id: string
  username: string
  display_name: string
  profile_picture_url: string | null
  joined_at: string
  initial_balance: number
  current_balance: number
  total_return: number
  rank: number | null
  is_host: boolean
}

type ActivityItem = {
  id: string
  user_id: string
  username: string
  display_name: string
  action_type: string
  stock_symbol: string
  quantity: number
  price: number
  total_value: number
  timestamp: string
  profile_picture_url: string | null
}

export default function GameActivityPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuth()
  const gameCode = params.gameCode as string

  const [game, setGame] = useState<GameData | null>(null)
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userIsParticipant, setUserIsParticipant] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // Fetch game data with robust error handling
  const fetchGameData = useCallback(async () => {
    if (!gameCode) {
      setError("No game code provided")
      setLoading(false)
      return
    }

    try {
      console.log("🎮 Fetching game data for code:", gameCode)
      const supabase = createClientSupabaseClient()

      // Fetch game information with host details
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select(`
          id,
          title,
          description,
          host_id,
          game_code,
          start_date,
          end_date,
          current_players,
          max_players,
          buy_in_amount,
          prize_pool,
          status,
          created_at,
          users:host_id (
            display_name,
            username
          )
        `)
        .eq("game_code", gameCode)
        .single()

      if (gameError) {
        console.error("❌ Error fetching game:", gameError)
        throw new Error(`Game not found: ${gameError.message}`)
      }

      if (!gameData) {
        throw new Error("Game not found")
      }

      console.log("✅ Game data fetched:", gameData)

      const formattedGame: GameData = {
        ...gameData,
        host_name: gameData.users?.display_name || "Unknown Host",
      }

      setGame(formattedGame)

      // Fetch players/participants with simplified query to avoid RLS recursion
      await fetchPlayers(gameData.id, gameData.host_id)

      // Generate mock activities for demonstration
      const mockActivities: ActivityItem[] = [
        {
          id: "1",
          user_id: gameData.host_id || "",
          username: gameData.users?.username || "host",
          display_name: gameData.users?.display_name || "Host",
          action_type: "buy",
          stock_symbol: "NVDA",
          quantity: 10,
          price: 271.3,
          total_value: 2713.0,
          timestamp: new Date().toISOString(),
          profile_picture_url: null,
        },
        {
          id: "2",
          user_id: gameData.host_id || "",
          username: gameData.users?.username || "host",
          display_name: gameData.users?.display_name || "Host",
          action_type: "buy",
          stock_symbol: "AAPL",
          quantity: 15,
          price: 185.5,
          total_value: 2782.5,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          profile_picture_url: null,
        },
      ]

      setActivities(mockActivities)
    } catch (err) {
      console.error("💥 Error fetching game data:", err)
      setError(err instanceof Error ? err.message : "Failed to load game")
    } finally {
      setLoading(false)
    }
  }, [gameCode])

  // Fixed fetchPlayers function to avoid RLS recursion
  const fetchPlayers = async (gameId: string, hostId: string | null) => {
    try {
      console.log("👥 Fetching players for game:", gameId)
      const supabase = createClientSupabaseClient()

      // Use a simpler query structure to avoid RLS policy recursion
      // First get participant user IDs
      const { data: participantIds, error: participantError } = await supabase
        .from("game_participants")
        .select("user_id, joined_at, initial_balance, current_balance, total_return, rank")
        .eq("game_id", gameId)

      if (participantError) {
        console.error("❌ Error fetching participant IDs:", participantError)
        // Create mock player data if query fails
        if (hostId) {
          const mockPlayers: PlayerData[] = [
            {
              id: "mock-1",
              user_id: hostId,
              username: "host",
              display_name: "Game Host",
              profile_picture_url: null,
              joined_at: new Date().toISOString(),
              initial_balance: 100000,
              current_balance: 100000,
              total_return: 0,
              rank: 1,
              is_host: true,
            },
          ]
          setPlayers(mockPlayers)
          setUserIsParticipant(user?.id === hostId)
        }
        return
      }

      if (!participantIds || participantIds.length === 0) {
        console.log("ℹ️ No participants found")
        setPlayers([])
        setUserIsParticipant(false)
        return
      }

      // Get user details separately to avoid RLS recursion
      const userIds = participantIds.map((p) => p.user_id)
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, username, display_name, profile_picture_url")
        .in("id", userIds)

      if (usersError) {
        console.error("❌ Error fetching user details:", usersError)
        // Create simplified player data without user details
        const simplifiedPlayers: PlayerData[] = participantIds.map((participant, index) => ({
          id: `participant-${index}`,
          user_id: participant.user_id,
          username: participant.user_id === hostId ? "host" : `player${index + 1}`,
          display_name: participant.user_id === hostId ? "Game Host" : `Player ${index + 1}`,
          profile_picture_url: null,
          joined_at: participant.joined_at,
          initial_balance: participant.initial_balance,
          current_balance: participant.current_balance,
          total_return: participant.total_return,
          rank: participant.rank,
          is_host: participant.user_id === hostId,
        }))
        setPlayers(simplifiedPlayers)
        setUserIsParticipant(user ? participantIds.some((p) => p.user_id === user.id) : false)
        return
      }

      console.log("✅ User data fetched:", usersData)

      // Combine participant and user data
      const formattedPlayers: PlayerData[] = participantIds.map((participant) => {
        const userData = usersData.find((u) => u.id === participant.user_id)
        return {
          id: `${participant.user_id}-${gameId}`,
          user_id: participant.user_id,
          username: userData?.username || "unknown",
          display_name: userData?.display_name || "Unknown Player",
          profile_picture_url: userData?.profile_picture_url,
          joined_at: participant.joined_at,
          initial_balance: participant.initial_balance,
          current_balance: participant.current_balance,
          total_return: participant.total_return,
          rank: participant.rank,
          is_host: participant.user_id === hostId,
        }
      })

      setPlayers(formattedPlayers)

      // Check if current user is a participant
      if (user) {
        const isParticipant = formattedPlayers.some((p) => p.user_id === user.id)
        setUserIsParticipant(isParticipant)
        console.log("🔍 User participation status:", isParticipant)
      }
    } catch (err) {
      console.error("💥 Error fetching players:", err)
      // Fallback to mock data
      if (hostId) {
        const fallbackPlayers: PlayerData[] = [
          {
            id: "fallback-1",
            user_id: hostId,
            username: "host",
            display_name: "Game Host",
            profile_picture_url: null,
            joined_at: new Date().toISOString(),
            initial_balance: 100000,
            current_balance: 100000,
            total_return: 0,
            rank: 1,
            is_host: true,
          },
        ]
        setPlayers(fallbackPlayers)
        setUserIsParticipant(user?.id === hostId)
      }
    }
  }

  // Auto-join user if they're authenticated but not a participant
  const autoJoinGame = async () => {
    if (!game || !user || userIsParticipant) return

    try {
      console.log("🚀 Auto-joining user to game:", game.game_code)
      const supabase = createClientSupabaseClient()

      // Add user as participant
      const { error: joinError } = await supabase.from("game_participants").insert({
        game_id: game.id,
        user_id: user.id,
        joined_at: new Date().toISOString(),
        initial_balance: game.buy_in_amount || 100000,
        current_balance: game.buy_in_amount || 100000,
        total_return: 0,
        daily_return: 0,
        rank: (game.current_players || 0) + 1,
      })

      if (joinError) {
        console.error("❌ Error auto-joining game:", joinError)
        return
      }

      // Update game participant count
      const { error: updateError } = await supabase
        .from("games")
        .update({
          current_players: (game.current_players || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", game.id)

      if (updateError) {
        console.error("❌ Error updating game:", updateError)
      }

      console.log("✅ Successfully auto-joined game")
      setUserIsParticipant(true)

      // Refresh players list
      await fetchPlayers(game.id, game.host_id)
    } catch (err) {
      console.error("💥 Error auto-joining game:", err)
    }
  }

  // Set up real-time subscriptions
  useEffect(() => {
    if (!game?.id) return

    console.log("🔄 Setting up real-time subscriptions for game:", game.id)
    const supabase = createClientSupabaseClient()

    // Subscribe to game participants changes
    const participantsSubscription = supabase
      .channel(`game-participants-${game.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_participants",
          filter: `game_id=eq.${game.id}`,
        },
        (payload) => {
          console.log("🔄 Participants change detected:", payload)
          fetchPlayers(game.id, game.host_id)
        },
      )
      .subscribe()

    return () => {
      console.log("🧹 Cleaning up subscriptions")
      participantsSubscription.unsubscribe()
    }
  }, [game?.id, game?.host_id])

  // Initial data fetch
  useEffect(() => {
    fetchGameData()
  }, [fetchGameData])

  // Auto-join authenticated users
  useEffect(() => {
    if (game && user && isAuthenticated && !userIsParticipant) {
      autoJoinGame()
    }
  }, [game, user, isAuthenticated, userIsParticipant])

  // Copy game link
  const handleCopyLink = () => {
    const gameLink = `${window.location.origin}/join-game?code=${game?.game_code}`
    navigator.clipboard.writeText(gameLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
        <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-16 relative z-10">
          <div className="flex justify-between items-center mb-3">
            <TouchFeedback className="text-white p-2" onClick={() => router.back()}>
              <ArrowLeft size={28} />
            </TouchFeedback>
            <div className="w-10"></div>
          </div>
          <h1 className="text-white text-center text-3xl font-bold mb-2">Loading Game...</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#f7b104] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !game) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
        <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-16 relative z-10">
          <div className="flex justify-between items-center mb-3">
            <TouchFeedback className="text-white p-2" onClick={() => router.back()}>
              <ArrowLeft size={28} />
            </TouchFeedback>
            <div className="w-10"></div>
          </div>
          <h1 className="text-white text-center text-3xl font-bold mb-2">Game Not Found</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Game Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || "The game you're looking for doesn't exist or has been removed."}
            </p>
            <TouchFeedback
              className="bg-[#f7b104] text-white font-bold px-6 py-3 rounded-full"
              onClick={() => router.push("/")}
            >
              Return to Home
            </TouchFeedback>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
      {/* Header - Exact replica of November 2024 layout */}
      <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-16 relative z-10">
        <div className="flex justify-between items-center mb-3">
          <TouchFeedback className="text-white p-2" onClick={() => router.back()}>
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
        <h2 className="text-white text-center text-lg font-medium mb-4">Hosted by {game.host_name}</h2>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {players.slice(0, 5).map((player, i) => (
                <div
                  key={player.id}
                  className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
                >
                  {player.profile_picture_url ? (
                    <img
                      src={player.profile_picture_url || "/placeholder.svg"}
                      alt={player.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-white font-medium">
                      {player.display_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
              {players.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-medium">+{players.length - 5}</span>
                </div>
              )}
            </div>
          </div>
          <TouchFeedback
            className="bg-white text-[#b26f03] font-bold px-4 py-1.5 rounded-full shadow-md"
            onClick={handleCopyLink}
          >
            {linkCopied ? "Copied!" : "+ Invite"}
          </TouchFeedback>
        </div>

        <p className="text-white text-sm mb-4 truncate">
          {game.current_players || players.length} players • Game Code: {game.game_code}
        </p>

        {/* Decorative wave overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0,50 C150,150 350,0 500,50 L500,150 L0,150 Z" fill="#f7f7f7" opacity="0.2"></path>
          </svg>
        </div>
      </div>

      {/* Main Content - Exact replica of activity screen layout */}
      <div className="flex-1 overflow-y-auto -mt-10 relative z-20">
        {/* Quick Stats Cards */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Total Players</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{game.current_players || players.length}</p>
              <p className="text-green-500 text-xs">+{game.current_players || players.length} joined</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Prize Pool</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">${(game.prize_pool || 0).toLocaleString()}</p>
              <p className="text-blue-500 text-xs">Total rewards</p>
            </div>
          </div>
        </div>

        {/* Navigation Cards - Exact replica */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <TouchFeedback
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => router.push(`/game/${gameCode}/portfolio`)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">📊</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-left">Portfolio</h3>
              <p className="text-gray-500 text-sm text-left">View holdings</p>
            </TouchFeedback>

            <TouchFeedback
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => router.push(`/game/${gameCode}/performance`)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl">📈</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-left">Performance</h3>
              <p className="text-gray-500 text-sm text-left">Track returns</p>
            </TouchFeedback>

            <TouchFeedback
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => router.push(`/game/${gameCode}/leaderboard`)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">🏆</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-left">Leaderboard</h3>
              <p className="text-gray-500 text-sm text-left">See rankings</p>
            </TouchFeedback>

            <TouchFeedback
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => router.push(`/challenge?gameCode=${gameCode}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-xl">💰</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-left">Trade</h3>
              <p className="text-gray-500 text-sm text-left">Buy & sell</p>
            </TouchFeedback>
          </div>
        </div>

        {/* Recent Activity Section - Exact replica */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold tracking-wider text-left">RECENT ACTIVITY</h3>
            <TouchFeedback className="text-[#f7b104] text-sm font-medium">View All</TouchFeedback>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={activity.id} className="flex items-center p-4 border-b last:border-b-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                    {activity.profile_picture_url ? (
                      <img
                        src={activity.profile_picture_url || "/placeholder.svg"}
                        alt={activity.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-medium">
                        {activity.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-left">
                          {activity.display_name}{" "}
                          <span className="text-gray-500 font-normal">
                            {activity.action_type === "buy" ? "bought" : "sold"}
                          </span>{" "}
                          {activity.quantity} shares of <span className="font-bold">{activity.stock_symbol}</span>
                        </p>
                        <p className="text-gray-500 text-sm text-left">
                          {new Date(activity.timestamp).toLocaleTimeString()} • ${activity.price.toFixed(2)} per share
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${activity.action_type === "buy" ? "text-red-600" : "text-green-600"}`}
                        >
                          {activity.action_type === "buy" ? "-" : "+"}${activity.total_value.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-end">
                          {activity.action_type === "buy" ? (
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          )}
                          <span className="text-xs text-gray-500">
                            {activity.action_type === "buy" ? "Purchase" : "Sale"}
                          </span>
                        </div>
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
                <h4 className="font-bold text-gray-600 mb-2">No Activity Yet</h4>
                <p className="text-gray-500 text-sm">Start trading to see your activity here</p>
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

        {/* Game Information Card */}
        <div className="px-4 mb-20">
          <h3 className="text-xl font-bold tracking-wider mb-3 text-left">GAME INFO</h3>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Starting Balance</p>
                <p className="font-bold text-left">${(game.buy_in_amount || 100000).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Game Status</p>
                <p className="font-bold text-left capitalize">{game.status}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Start Date</p>
                <p className="font-bold text-left">
                  {game.start_date ? new Date(game.start_date).toLocaleDateString() : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">End Date</p>
                <p className="font-bold text-left">
                  {game.end_date ? new Date(game.end_date).toLocaleDateString() : "Ongoing"}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Game Code</p>
                  <p className="font-bold text-[#f7b104] text-lg">{game.game_code}</p>
                </div>
                <TouchFeedback
                  className="bg-[#f7b104] text-white font-bold px-4 py-2 rounded-full"
                  onClick={handleCopyLink}
                >
                  {linkCopied ? (
                    <div className="flex items-center">
                      <Check size={16} className="mr-1" />
                      Copied!
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Copy size={16} className="mr-1" />
                      Share Code
                    </div>
                  )}
                </TouchFeedback>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
