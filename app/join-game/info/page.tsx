"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Users, Calendar, DollarSign, Trophy, Loader2, AlertCircle } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import { getGameByCode, joinGame } from "@/lib/games"
import { useAuth } from "@/contexts/auth-context"

export default function GameInfoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()
  const [game, setGame] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)

  const gameCode = searchParams.get("gameCode")

  useEffect(() => {
    if (!gameCode) {
      router.push("/join-game")
      return
    }

    loadGameInfo()
  }, [gameCode])

  const loadGameInfo = async () => {
    if (!gameCode) return

    console.log("📋 Loading game info for code:", gameCode)
    setIsLoading(true)
    setError(null)

    try {
      const { game: gameData, error: gameError } = await getGameByCode(gameCode)

      if (gameError) {
        console.error("❌ Error loading game:", gameError)
        setError(gameError)
        return
      }

      if (!gameData) {
        console.log("❌ No game data received")
        setError("Game not found")
        return
      }

      console.log("✅ Game loaded:", gameData.title)
      setGame(gameData)
    } catch (err) {
      console.error("💥 Unexpected error loading game:", err)
      setError("Failed to load game information")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinGame = async () => {
    if (!user || !gameCode) {
      setJoinError("You must be logged in to join a game")
      return
    }

    console.log("🚀 Joining game:", gameCode)
    setIsJoining(true)
    setJoinError(null)

    try {
      const result = await joinGame(gameCode, user.id)

      if (result.success) {
        console.log("✅ Successfully joined game")
        // Redirect to the game/challenge page
        router.push(`/challenge?gameCode=${gameCode}`)
      } else {
        console.log("❌ Failed to join game:", result.error)
        setJoinError(result.error || "Failed to join game")
      }
    } catch (err) {
      console.error("💥 Error joining game:", err)
      setJoinError("An unexpected error occurred. Please try again.")
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] max-w-[430px] mx-auto">
        <div className="bg-gradient-to-br from-[#0052cc] via-[#2684ff] to-[#4c9aff] p-4 pb-6 safe-area-top">
          <div className="flex items-center">
            <TouchFeedback className="text-white p-2" onClick={() => router.push("/join-game")}>
              <ArrowLeft size={24} />
            </TouchFeedback>
            <h1 className="text-white text-xl font-bold ml-2">Game Details</h1>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading game information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] max-w-[430px] mx-auto">
        <div className="bg-gradient-to-br from-[#0052cc] via-[#2684ff] to-[#4c9aff] p-4 pb-6 safe-area-top">
          <div className="flex items-center">
            <TouchFeedback className="text-white p-2" onClick={() => router.push("/join-game")}>
              <ArrowLeft size={24} />
            </TouchFeedback>
            <h1 className="text-white text-xl font-bold ml-2">Game Details</h1>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Unable to Load Game</h2>
            <p className="text-gray-600 mb-6">{error || "Game not found"}</p>
            <TouchFeedback
              className="bg-blue-500 text-white px-6 py-3 rounded-lg"
              onClick={() => router.push("/join-game")}
            >
              Try Again
            </TouchFeedback>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] max-w-[430px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0052cc] via-[#2684ff] to-[#4c9aff] p-4 pb-6 safe-area-top">
        <div className="flex items-center">
          <TouchFeedback className="text-white p-2" onClick={() => router.push("/join-game")}>
            <ArrowLeft size={24} />
          </TouchFeedback>
          <h1 className="text-white text-xl font-bold ml-2">Game Details</h1>
        </div>
      </div>

      {/* Game Info */}
      <div className="flex-1 p-4">
        {/* Game Title */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <h2 className="text-2xl font-bold mb-2">{game.title}</h2>
          <p className="text-gray-600 mb-4">{game.description}</p>

          <div className="flex items-center text-sm text-gray-500">
            <span>Game Code: </span>
            <span className="font-mono font-bold ml-1">{game.game_code}</span>
          </div>
        </div>

        {/* Host Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <h3 className="font-bold mb-3">Hosted by</h3>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden">
              {game.host_avatar ? (
                <img
                  src={game.host_avatar || "/placeholder.svg"}
                  alt={game.host_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                  {game.host_name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">{game.host_name}</div>
              <div className="text-sm text-gray-500">@{game.host_username}</div>
            </div>
          </div>
        </div>

        {/* Game Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <h3 className="font-bold mb-4">Game Details</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users size={20} className="text-blue-500 mr-3" />
                <span>Participants</span>
              </div>
              <span className="font-medium">
                {game.current_players}/{game.max_players}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign size={20} className="text-green-500 mr-3" />
                <span>Starting Balance</span>
              </div>
              <span className="font-medium">${game.buy_in_amount?.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trophy size={20} className="text-yellow-500 mr-3" />
                <span>Prize Pool</span>
              </div>
              <span className="font-medium">${game.prize_pool?.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar size={20} className="text-purple-500 mr-3" />
                <span>Duration</span>
              </div>
              <span className="font-medium">
                {new Date(game.start_date).toLocaleDateString()} - {new Date(game.end_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Join Error */}
        {joinError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
            <div className="flex items-start">
              <AlertCircle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Unable to Join Game</p>
                <p className="text-sm mt-1">{joinError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Join Button */}
        <div className="mt-6">
          <TouchFeedback
            className={`w-full py-4 rounded-xl text-center font-bold text-white shadow-md transition-all ${
              isJoining
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0052cc] to-[#2684ff] hover:shadow-lg"
            }`}
            onClick={!isJoining ? handleJoinGame : undefined}
          >
            {isJoining ? (
              <div className="flex items-center justify-center">
                <Loader2 size={24} className="animate-spin mr-2" />
                Joining Game...
              </div>
            ) : (
              "Join Game"
            )}
          </TouchFeedback>
        </div>
      </div>
    </div>
  )
}
