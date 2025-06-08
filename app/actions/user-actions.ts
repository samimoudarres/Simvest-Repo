"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export async function createUserProfile(userData: {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  display_name: string
  phone_number?: string | null
  profile_picture_url?: string | null
}) {
  try {
    console.log("Creating user profile on server:", userData.email)

    // Use server-side client with service role key to bypass RLS
    const supabase = createServerSupabaseClient()

    // First check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userData.email)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing user:", checkError)
      return { success: false, error: checkError.message }
    }

    if (existingUser) {
      console.log("User already exists, updating profile instead")
      const { error: updateError } = await supabase
        .from("users")
        .update({
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          display_name: userData.display_name,
          phone_number: userData.phone_number || null,
          profile_picture_url: userData.profile_picture_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userData.id)

      if (updateError) {
        console.error("Server profile update error:", updateError)
        return { success: false, error: updateError.message }
      }

      return { success: true, error: null }
    }

    // User doesn't exist, create new profile
    const { error } = await supabase.from("users").insert({
      id: userData.id,
      email: userData.email,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      display_name: userData.display_name,
      phone_number: userData.phone_number || null,
      profile_picture_url: userData.profile_picture_url || null,
    })

    if (error) {
      console.error("Server profile creation error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Unexpected server profile creation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function checkUserExists(email: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("users").select("id, email").eq("email", email).single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking user existence:", error)
      return { exists: false, error: error.message }
    }

    return { exists: !!data, error: null }
  } catch (error) {
    console.error("Unexpected error checking user existence:", error)
    return {
      exists: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
