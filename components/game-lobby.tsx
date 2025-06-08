"use client"

import { useState, useEffect } from "react"
import { Users, Crown, UserPlus } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import { createClientSupabaseClient } from "@/lib/supabase"

type GameLobbyProps = {
  gameId: string
  gameCode: string
  onPlayerJoin?: () => void
  showJoinButton?: boolean
}

type PlayerData = {
  id: string
  user_id: string
  username: string
  display_name: string
  profile_picture_url: string | null
  joined_at: string
  is_host: boolean
}

export default function GameLobby({ gameId, gameCode, onPlayerJoin, showJoinButton = false }: GameLobbyProps) {
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [loading, setLoading] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)

  // Fetch players
  const fetchPlayers = async () => {
    try {
      const supabase = createClientSupabaseClient()

      const { data: playersData, error } = await supabase
        .from("game_participants")
        .select(`
          id,
          user_id,
          joined_at,
          users (
            username,
            display_name,
            profile_picture_url
          ),
          games!inner (
            host_id
          )
        `)
        .eq("game_id", gameId)
        .order("joined_at", { ascending: true })

      if (error) throw error

      const formattedPlayers: PlayerData[] = playersData.map((player) => ({
        id: player.id,
        user_id: player.user_id,
        username: player.users?.username || "unknown",
        display_name: player.users?.display_name || "Unknown Player",
        profile_picture_url: player.users?.profile_picture_url,
        joined_at: player.joined_at,
        is_host: player.user_id === player.games?.host_id,
      }))

      setPlayers(formattedPlayers)
    } catch (error) {
      console.error("Error fetching players:", error)
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchPlayers()

    const supabase = createClientSupabaseClient()
    const subscription = supabase
      .channel(`game-lobby-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_participants",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          fetchPlayers()
          onPlayerJoin?.()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [gameId, onPlayerJoin])

  const handleCopyLink = () => {
    const gameLink = `${window.location.origin}/join-game?code=${gameCode}`
    navigator.clipboard.writeText(gameLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-left">Players ({players.length})</h3>
        <TouchFeedback className="text-[#0052cc] text-sm font-medium" onClick={handleCopyLink}>
          {linkCopied ? "Copied!" : "Invite"}
        </TouchFeedback>
      </div>

      {players.length > 0 ? (
        <div className="space-y-3">
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
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
                  {player.is_host && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium text-left">{player.display_name}</p>
                    {player.is_host && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Host</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs text-left">@{player.username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{new Date(player.joined_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No players have joined yet</p>
          <p className="text-gray-400 text-sm">Share the game code to invite players</p>
        </div>
      )}

      {showJoinButton && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <TouchFeedback
            className="w-full py-3 bg-[#0052cc] text-white font-bold rounded-xl flex items-center justify-center"
            onClick={handleCopyLink}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Players
          </TouchFeedback>
        </div>
      )}
    </div>
  )
}
