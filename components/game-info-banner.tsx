"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

type GameInfo = {
  title: string
  game_code: string
  host_name?: string
}

export default function GameInfoBanner() {
  const searchParams = useSearchParams()
  const gameCode = searchParams.get("gameCode")
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGameInfo = async () => {
      if (!gameCode) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const supabase = createClientSupabaseClient()

        // Fetch game info with host name
        const { data, error } = await supabase
          .from("games")
          .select(`
            title,
            game_code,
            host_id,
            users:host_id (
              display_name
            )
          `)
          .eq("game_code", gameCode)
          .single()

        if (error) throw error

        setGameInfo({
          title: data.title,
          game_code: data.game_code,
          host_name: data.users?.display_name || "Unknown Host",
        })
      } catch (err) {
        console.error("Error fetching game info:", err)
        setError("Could not load game information")
      } finally {
        setLoading(false)
      }
    }

    fetchGameInfo()
  }, [gameCode])

  if (!gameCode || (!loading && !gameInfo)) return null

  return (
    <div className="bg-[#FFF8E1] px-4 py-3 mb-4 rounded-lg">
      {loading ? (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500 mr-2" />
          <span className="text-gray-700">Loading game info...</span>
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <div>
          <p className="text-gray-700 font-medium">{gameInfo?.host_name}'s Challenge</p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-gray-600 text-sm">{gameInfo?.title}</p>
            <p className="text-gray-600 text-sm font-medium">Game Code: {gameInfo?.game_code}</p>
          </div>
        </div>
      )}
    </div>
  )
}
