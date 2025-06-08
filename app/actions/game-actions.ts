"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

// Type for game data
type Game = {
  id: string
  title: string
  game_code: string
  description: string | null
  host_id: string | null
  host_name?: string
  start_date: string | null
  end_date: string | null
  current_players: number | null
  status: string
  color_theme?: number
}

// Enhanced authentication verification with multiple methods
async function verifyAuthentication() {
  try {
    console.log("🔐 Server: Verifying authentication...")
    const supabase = createServerSupabaseClient()

    // Method 1: Try to get user from server-side session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("🔍 Server auth check method 1:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: userError?.message,
    })

    if (user && !userError) {
      // Verify user exists in database
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("id, username, display_name")
        .eq("id", user.id)
        .single()

      if (profile && !profileError) {
        console.log("✅ Server authentication verified via method 1:", {
          userId: user.id,
          username: profile.username,
        })
        return { user, profile, error: null }
      }
    }

    // Method 2: Try to get session from cookies
    console.log("🔄 Trying authentication method 2 (session from cookies)...")
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    console.log("🔍 Server auth check method 2:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      error: sessionError?.message,
    })

    if (session?.user && !sessionError) {
      // Verify user exists in database
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("id, username, display_name")
        .eq("id", session.user.id)
        .single()

      if (profile && !profileError) {
        console.log("✅ Server authentication verified via method 2:", {
          userId: session.user.id,
          username: profile.username,
        })
        return { user: session.user, profile, error: null }
      }
    }

    console.error("❌ All authentication methods failed")
    return { user: null, error: "Auth session missing!" }
  } catch (error) {
    console.error("💥 Server authentication verification failed:", error)
    return { user: null, error: "Authentication verification failed" }
  }
}

// Alternative: Accept user ID as parameter and verify it
async function verifyUserById(userId: string) {
  try {
    console.log("🔐 Server: Verifying user by ID:", userId)
    const supabase = createServerSupabaseClient()

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, username, display_name, email")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      console.error("❌ User profile not found:", profileError)
      return { user: null, profile: null, error: "User not found in database" }
    }

    console.log("✅ User verified by ID:", {
      userId: profile.id,
      username: profile.username,
    })

    // Create a user object compatible with Supabase User type
    const user = {
      id: profile.id,
      email: profile.email,
      aud: "authenticated",
      role: "authenticated",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
    }

    return { user, profile, error: null }
  } catch (error) {
    console.error("💥 User verification by ID failed:", error)
    return { user: null, profile: null, error: "User verification failed" }
  }
}

// Fetch user's games using server-side client (bypasses RLS policies)
export async function fetchUserGames(userId: string | undefined) {
  if (!userId) {
    return { games: [], error: "No user ID provided" }
  }

  try {
    console.log("📊 Fetching games for user:", userId)
    const supabase = createServerSupabaseClient()

    // Get games the user has joined (using service role to bypass RLS)
    const { data: participantData, error: participantError } = await supabase
      .from("game_participants")
      .select("game_id")
      .eq("user_id", userId)

    if (participantError) {
      console.error("❌ Error fetching participant data:", participantError)
      throw participantError
    }

    const gameIds = participantData?.map((p) => p.game_id) || []

    // Get games the user has created
    const { data: hostData, error: hostError } = await supabase.from("games").select("id").eq("host_id", userId)

    if (hostError) {
      console.error("❌ Error fetching host data:", hostError)
      throw hostError
    }

    const hostGameIds = hostData?.map((g) => g.id) || []

    // Combine and remove duplicates
    const allGameIds = [...new Set([...gameIds, ...hostGameIds])]

    if (allGameIds.length === 0) {
      return { games: [], error: null }
    }

    // Get game details
    const { data: gamesData, error: gamesError } = await supabase
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
        status
      `)
      .in("id", allGameIds)
      .order("created_at", { ascending: false })

    if (gamesError) {
      console.error("❌ Error fetching games data:", gamesError)
      throw gamesError
    }

    // Get host names
    const hostIds = [...new Set(gamesData?.map((g) => g.host_id).filter(Boolean) || [])]

    if (hostIds.length > 0) {
      const { data: hostsData, error: hostsError } = await supabase
        .from("users")
        .select("id, display_name")
        .in("id", hostIds)

      if (hostsError) {
        console.error("❌ Error fetching hosts data:", hostsError)
        throw hostsError
      }

      // Combine data and assign color themes
      const gamesWithHosts =
        gamesData?.map((game, index) => {
          const host = hostsData?.find((h) => h.id === game.host_id)
          return {
            ...game,
            host_name: host?.display_name || "Unknown Host",
            color_theme: index % 6, // 6 is the number of color themes
          }
        }) || []

      return { games: gamesWithHosts, error: null }
    } else {
      // No host IDs to fetch, just return games with default host names
      const gamesWithDefaultHosts =
        gamesData?.map((game, index) => ({
          ...game,
          host_name: "Unknown Host",
          color_theme: index % 6,
        })) || []

      return { games: gamesWithDefaultHosts, error: null }
    }
  } catch (error) {
    console.error("💥 Error in fetchUserGames:", error)
    return { games: [], error: String(error) }
  }
}

// Updated createGameAction with user ID parameter
export async function createGameAction(formData: FormData, userId?: string) {
  try {
    console.log("🎮 Creating new game...")

    const supabase = createServerSupabaseClient()

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    let hostUserId = userId
    if (!hostUserId && session?.user) {
      hostUserId = session.user.id
    }

    if (!hostUserId) {
      console.error("❌ Authentication failed for game creation: No user ID available!")
      throw new Error("Authentication required to create a game")
    }

    console.log("✅ Authenticated user:", hostUserId)

    // Extract form data
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const maxPlayers = Number.parseInt(formData.get("maxPlayers") as string) || 50
    const buyInAmount = Number.parseFloat(formData.get("buyInAmount") as string) || 100000
    const prizePool = buyInAmount * maxPlayers * 0.8 // 80% of total buy-ins

    // Generate unique game code
    const gameCode = Math.floor(100000 + Math.random() * 900000).toString()

    console.log("🎯 Game details:", { title, gameCode, maxPlayers, buyInAmount })

    // Create the game
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .insert({
        title,
        description,
        host_id: hostUserId,
        game_code: gameCode,
        status: "active",
        max_players: maxPlayers,
        buy_in_amount: buyInAmount,
        prize_pool: prizePool,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        current_players: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (gameError) {
      console.error("❌ Error creating game:", gameError)
      throw new Error(`Failed to create game: ${gameError.message}`)
    }

    console.log("✅ Game created successfully:", gameData)

    // Add the host as the first participant
    const { error: participantError } = await supabase.from("game_participants").insert({
      game_id: gameData.id,
      user_id: hostUserId,
      joined_at: new Date().toISOString(),
      initial_balance: buyInAmount,
      current_balance: buyInAmount,
      total_return: 0,
      daily_return: 0,
      rank: 1,
    })

    if (participantError) {
      console.error("❌ Error adding host as participant:", participantError)
      // Don't throw here, game is still created successfully
    } else {
      console.log("✅ Host added as participant")
    }

    console.log("🚀 Redirecting to game:", gameCode)

    return {
      success: true,
      gameCode,
      gameId: gameData.id,
      message: "Game created successfully!",
    }
  } catch (error) {
    console.error("💥 Error in createGameAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create game",
    }
  }
}

async function generateUniqueGameCode(): Promise<string> {
  const supabase = createServerSupabaseClient()

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  let code = generateCode()
  let attempts = 0

  while (attempts < 10) {
    const { data } = await supabase.from("games").select("game_code").eq("game_code", code).maybeSingle()

    if (!data) {
      return code
    }

    code = generateCode()
    attempts++
  }

  return code
}

// Updated joinGameAction with user ID parameter
export async function joinGameAction(gameCode: string, userId?: string) {
  try {
    console.log("🎮 Joining game with code:", gameCode)

    const supabase = createServerSupabaseClient()

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    let joinUserId = userId
    if (!joinUserId && session?.user) {
      joinUserId = session.user.id
    }

    if (!joinUserId) {
      console.error("❌ Authentication failed for game join: No user ID available!")
      throw new Error("Authentication required to join a game")
    }

    console.log("✅ Authenticated user:", joinUserId)

    // Find the game
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("game_code", gameCode)
      .single()

    if (gameError || !gameData) {
      console.error("❌ Game not found:", gameError)
      throw new Error("Game not found")
    }

    console.log("✅ Game found:", gameData.title)

    // Check if user is already a participant
    const { data: existingParticipant, error: checkError } = await supabase
      .from("game_participants")
      .select("id")
      .eq("game_id", gameData.id)
      .eq("user_id", joinUserId)
      .maybeSingle()

    if (checkError) {
      console.error("❌ Error checking participation:", checkError)
      throw new Error("Failed to verify participation status")
    }

    if (existingParticipant) {
      console.log("ℹ️ User already participating in game")
      return {
        success: true,
        gameCode,
        gameId: gameData.id,
        message: "Already participating in this game",
        alreadyJoined: true,
      }
    }

    // Check if game is full
    if (gameData.current_players >= gameData.max_players) {
      throw new Error("Game is full")
    }

    // Add user as participant
    const { error: joinError } = await supabase.from("game_participants").insert({
      game_id: gameData.id,
      user_id: joinUserId,
      joined_at: new Date().toISOString(),
      initial_balance: gameData.buy_in_amount,
      current_balance: gameData.buy_in_amount,
      total_return: 0,
      daily_return: 0,
      rank: gameData.current_players + 1,
    })

    if (joinError) {
      console.error("❌ Error joining game:", joinError)
      throw new Error(`Failed to join game: ${joinError.message}`)
    }

    // Update game participant count
    const { error: updateError } = await supabase
      .from("games")
      .update({
        current_players: gameData.current_players + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameData.id)

    if (updateError) {
      console.error("❌ Error updating game:", updateError)
      // Don't throw here, user is still joined successfully
    }

    console.log("✅ Successfully joined game")

    return {
      success: true,
      gameCode,
      gameId: gameData.id,
      message: "Successfully joined the game!",
    }
  } catch (error) {
    console.error("💥 Error in joinGameAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to join game",
    }
  }
}

// Check if a user exists in the database
export async function checkUserExists(userId: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("users").select("id").eq("id", userId).single()

    if (error) {
      return false
    }

    return !!data
  } catch (error) {
    console.error("❌ Error checking if user exists:", error)
    return false
  }
}

// Get current session user
export async function getCurrentUser() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    return { user: data.session?.user || null, error: null }
  } catch (error) {
    console.error("❌ Error getting current user:", error)
    return { user: null, error: String(error) }
  }
}

export async function validateGameCode(gameCode: string) {
  try {
    console.log("🔍 Validating game code:", gameCode)

    const supabase = createServerSupabaseClient()

    const { data: gameData, error: gameError } = await supabase
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
        users:host_id (
          display_name,
          username
        )
      `)
      .eq("game_code", gameCode)
      .eq("status", "active")
      .single()

    if (gameError || !gameData) {
      console.error("❌ Game validation failed:", gameError)
      return {
        valid: false,
        error: "Game not found or inactive",
      }
    }

    console.log("✅ Game validated successfully:", gameData.title)

    return {
      valid: true,
      game: gameData,
    }
  } catch (error) {
    console.error("💥 Error validating game code:", error)
    return {
      valid: false,
      error: "Failed to validate game code",
    }
  }
}
