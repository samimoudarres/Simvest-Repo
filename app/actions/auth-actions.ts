"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

// Function to ensure demo account exists
export async function ensureDemoAccountExists() {
  try {
    const supabase = createServerSupabaseClient()
    const demoEmail = "john.smith1@example.com"
    const demoPassword = "demo123"

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      console.error("Error checking users:", userError)
      return { success: false, error: userError.message }
    }

    // Find if demo user exists
    const demoUser = userData.users.find((user) => user.email === demoEmail)

    if (demoUser) {
      console.log("Demo user already exists")
      return { success: true, message: "Demo account already exists" }
    }

    // Create demo user if it doesn't exist
    console.log("Creating demo account...")
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
    })

    if (createError) {
      console.error("Error creating demo user:", createError)
      return { success: false, error: createError.message }
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: demoEmail,
        username: "johnsmith1",
        first_name: "John",
        last_name: "Smith",
        display_name: "John Smith",
        phone_number: null,
        profile_picture_url: null,
      })

      if (profileError) {
        console.error("Error creating demo profile:", profileError)
        return { success: false, error: profileError.message }
      }
    }

    return { success: true, message: "Demo account created successfully" }
  } catch (error) {
    console.error("Unexpected error creating demo account:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Function to verify credentials
export async function verifyCredentials(email: string, password: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { valid: false, error: error.message }
    }

    return { valid: true, user: data.user }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Function to check username availability
export async function checkServerUsernameAvailability(username: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("users").select("username").eq("username", username).maybeSingle()

    if (error) {
      console.error("Error checking username availability:", error)
      return {
        available: false,
        error: error.message,
      }
    }

    return {
      available: !data,
      error: null,
    }
  } catch (error) {
    console.error("Error checking username availability:", error)
    return {
      available: false,
      error: error instanceof Error ? error.message : "Error checking username",
    }
  }
}

// Function to create user account
export async function serverSignUp(formData: {
  email: string
  password: string
  username: string
  first_name: string
  last_name: string
  phone_number: string
  profile_picture_url: string | null
}) {
  try {
    // Validate required fields
    if (!formData.email || !formData.password || !formData.username || !formData.first_name || !formData.last_name) {
      return {
        success: false,
        user: null,
        error: "All required fields must be provided",
      }
    }

    const supabase = createServerSupabaseClient()

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error("User creation failed")
    }

    // 2. Create user profile using service role client (bypasses RLS)
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: formData.email,
      username: formData.username,
      display_name: `${formData.first_name} ${formData.last_name}`,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone_number: formData.phone_number || null,
      profile_picture_url: formData.profile_picture_url,
    })

    if (profileError) throw profileError

    return { success: true, user: authData.user, error: null }
  } catch (error) {
    console.error("Error during server sign up:", error)
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : "An error occurred during registration",
    }
  }
}

// Function to join a game
export async function serverJoinGame(gameCode: string, userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Get game ID from game code
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select("id")
      .eq("game_code", gameCode)
      .single()

    if (gameError) throw gameError
    if (!gameData) throw new Error("Game not found")

    // Check if user is already in the game
    const { data: existingParticipant, error: checkError } = await supabase
      .from("game_participants")
      .select("id")
      .eq("game_id", gameData.id)
      .eq("user_id", userId)
      .maybeSingle()

    if (checkError) throw checkError

    // If user is already in the game, return success
    if (existingParticipant) {
      return { success: true, error: null }
    }

    // Add user to game participants
    const { error: joinError } = await supabase.from("game_participants").insert({
      game_id: gameData.id,
      user_id: userId,
      initial_balance: 10000.0,
      current_balance: 10000.0,
    })

    if (joinError) throw joinError

    // Increment current_players count
    const { error: updateError } = await supabase.rpc("increment_game_players", {
      game_id: gameData.id,
    })

    if (updateError) throw updateError

    return { success: true, error: null }
  } catch (error) {
    console.error("Error joining game:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error joining game",
    }
  }
}
