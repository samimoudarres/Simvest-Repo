import { createClientSupabaseClient } from "@/lib/supabase"
import type { Tables } from "./database.types"

export type Game = Tables<"games">
export type GameParticipant = Tables<"game_participants">

export async function validateGameCode(gameCode: string) {
  try {
    console.log("🔍 Validating game code:", gameCode)

    if (!gameCode || gameCode.length !== 6) {
      return {
        valid: false,
        error: "Game code must be 6 digits",
        game: null,
      }
    }

    const supabase = createClientSupabaseClient()

    // Query with timeout and retry logic
    const { data: game, error } = (await Promise.race([
      supabase
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
          created_at
        `)
        .eq("game_code", gameCode)
        .single(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 10000)),
    ])) as any

    if (error) {
      console.error("❌ Game validation error:", error)
      return {
        valid: false,
        error: error.code === "PGRST116" ? "Game code not found" : "Failed to validate game code",
        game: null,
      }
    }

    if (!game) {
      return {
        valid: false,
        error: "Game code not found",
        game: null,
      }
    }

    console.log("✅ Game validation successful:", game.title)

    return {
      valid: true,
      error: null,
      game,
    }
  } catch (err) {
    console.error("💥 Game validation failed:", err)
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Validation failed",
      game: null,
    }
  }
}

export async function createGame(gameData: {
  title: string
  description?: string
  hostId: string
}) {
  try {
    const supabase = createClientSupabaseClient()

    // Generate unique game code
    let gameCode: string
    let attempts = 0
    const maxAttempts = 10

    do {
      gameCode = Math.floor(100000 + Math.random() * 900000).toString()
      const { data: existingGame } = await supabase.from("games").select("game_code").eq("game_code", gameCode).single()

      if (!existingGame) break

      attempts++
    } while (attempts < maxAttempts)

    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique game code")
    }

    // Create the game
    const { data: game, error: gameError } = await supabase
      .from("games")
      .insert({
        title: gameData.title,
        description: gameData.description || null,
        host_id: gameData.hostId,
        game_code: gameCode,
        status: "active",
        max_players: 20,
        buy_in_amount: 100000,
        prize_pool: 110000,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        current_players: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (gameError) {
      throw new Error(`Failed to create game: ${gameError.message}`)
    }

    // Add host as participant
    const { error: participantError } = await supabase.from("game_participants").insert({
      game_id: game.id,
      user_id: gameData.hostId,
      joined_at: new Date().toISOString(),
      initial_balance: 100000,
      current_balance: 100000,
      total_return: 0,
      daily_return: 0,
      rank: 1,
    })

    if (participantError) {
      console.error("❌ Error adding host as participant:", participantError)
    }

    return {
      success: true,
      game,
      error: null,
    }
  } catch (err) {
    console.error("💥 Error creating game:", err)
    return {
      success: false,
      game: null,
      error: err instanceof Error ? err.message : "Failed to create game",
    }
  }
}

// Get game by code with enhanced error handling
export async function getGameByCode(gameCode: string) {
  console.log("🔍 Getting game by code:", gameCode)

  try {
    const supabase = createClientSupabaseClient()

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 8000)
    })

    // Create query promise
    const queryPromise = supabase
      .from("games")
      .select(`
        id,
        title,
        description,
        host_id,
        game_code,
        status,
        max_players,
        current_players,
        buy_in_amount,
        prize_pool,
        start_date,
        end_date,
        created_at,
        updated_at,
        users!games_host_id_fkey (
          display_name,
          username,
          profile_picture_url
        )
      `)
      .eq("game_code", gameCode)
      .maybeSingle()

    const { data: game, error } = await Promise.race([queryPromise, timeoutPromise])

    console.log("📋 Game query result:", { data: game, error })

    if (error) {
      console.error("❌ Database error:", error)
      throw error
    }

    if (!game) {
      console.log("❌ No game found")
      return {
        game: null,
        error: "Game not found",
      }
    }

    console.log("✅ Game found:", game.title)

    return {
      game: {
        ...game,
        host_name: game.users?.display_name || "Unknown Host",
        host_username: game.users?.username || "unknown",
        host_avatar: game.users?.profile_picture_url || null,
      },
      error: null,
    }
  } catch (error) {
    console.error("💥 Error getting game by code:", error)
    return {
      game: null,
      error: error instanceof Error ? error.message : "Failed to get game",
    }
  }
}

// Get user's games
export async function getUserGames(userId: string) {
  console.log("🎮 Getting user games for:", userId)

  try {
    const supabase = createClientSupabaseClient()

    // Get games where user is a participant
    const { data: participations, error: participationsError } = await supabase
      .from("game_participants")
      .select("game_id")
      .eq("user_id", userId)

    if (participationsError) {
      console.error("❌ Error getting participations:", participationsError)
      throw participationsError
    }

    const gameIds = participations.map((p) => p.game_id)

    // Get games where user is the host
    const { data: hostedGames, error: hostedError } = await supabase.from("games").select("id").eq("host_id", userId)

    if (hostedError) {
      console.error("❌ Error getting hosted games:", hostedError)
      throw hostedError
    }

    const hostedIds = hostedGames.map((g) => g.id)

    // Combine and remove duplicates
    const allGameIds = [...new Set([...gameIds, ...hostedIds])]

    if (allGameIds.length === 0) {
      console.log("ℹ️ No games found for user")
      return { games: [], error: null }
    }

    // Get game details
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select(`
        id,
        title,
        game_code,
        description,
        host_id,
        start_date,
        end_date,
        current_players,
        status,
        users!games_host_id_fkey (
          display_name
        )
      `)
      .in("id", allGameIds)
      .order("created_at", { ascending: false })

    if (gamesError) {
      console.error("❌ Error getting games:", gamesError)
      throw gamesError
    }

    // Format games with host names and color themes
    const formattedGames = games.map((game, index) => ({
      ...game,
      host_name: game.users?.display_name || "Unknown Host",
      color_theme: index % 6, // 6 different color themes
    }))

    console.log("✅ User games fetched:", formattedGames.length)
    return { games: formattedGames, error: null }
  } catch (error) {
    console.error("💥 Error getting user games:", error)
    return {
      games: [],
      error: error instanceof Error ? error.message : "Failed to get games",
    }
  }
}
