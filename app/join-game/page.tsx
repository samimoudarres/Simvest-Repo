"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import { joinGameAction } from "@/app/actions/game-actions"
import { useAuth } from "@/contexts/auth-context"

export default function JoinGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [gameCode, setGameCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-fill game code from URL params
  useEffect(() => {
    const code = searchParams.get("code")
    if (code) {
      setGameCode(code)
      // Auto-join if user is authenticated
      if (user) {
        handleJoinGame(code)
      }
    }
  }, [searchParams, user])

  const handleJoinGame = async (code?: string) => {
    const codeToJoin = code || gameCode

    if (!codeToJoin.trim()) {
      setError("Please enter a game code")
      return
    }

    if (!user) {
      setError("Please log in to join a game")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await joinGameAction(codeToJoin, user.id)

      if (result.success) {
        // Redirect based on game code
        if (codeToJoin === "112024") {
          router.push("/activity")
        } else {
          router.push(`/activity?gameCode=${codeToJoin}`)
        }
      } else {
        setError(result.error || "Failed to join game")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Join game error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] p-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <TouchFeedback className="p-2 -ml-2" onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </TouchFeedback>
        <h1 className="text-xl font-bold ml-4">Join Game</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#f7b104] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">#</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Enter Game Code</h2>
          <p className="text-gray-600">Enter the 6-digit code to join a stock trading challenge</p>
        </div>

        {/* Game Code Input */}
        <div className="mb-6">
          <input
            type="text"
            value={gameCode}
            onChange={(e) => {
              setGameCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              setError("")
            }}
            placeholder="123456"
            className="w-full text-center text-2xl font-bold py-4 px-6 border-2 border-gray-200 rounded-xl focus:border-[#f7b104] focus:outline-none"
            maxLength={6}
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Join Button */}
        <TouchFeedback
          className={`w-full py-4 px-6 rounded-xl font-bold text-white ${
            loading || gameCode.length !== 6 ? "bg-gray-300 cursor-not-allowed" : "bg-[#f7b104] hover:bg-[#e6a004]"
          }`}
          onClick={() => handleJoinGame()}
          disabled={loading || gameCode.length !== 6}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Joining Game...
            </div>
          ) : (
            "Join Game"
          )}
        </TouchFeedback>

        {/* Quick Join November 2024 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center mb-4">Or join the featured challenge</p>
          <TouchFeedback
            className="w-full py-3 px-6 rounded-xl font-medium text-[#f7b104] border-2 border-[#f7b104] hover:bg-[#f7b104] hover:text-white transition-colors"
            onClick={() => {
              setGameCode("112024")
              handleJoinGame("112024")
            }}
            disabled={loading}
          >
            November 2024 Stock Challenge
          </TouchFeedback>
        </div>
      </div>
    </div>
  )
}
