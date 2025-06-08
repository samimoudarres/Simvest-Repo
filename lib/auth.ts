import { createClientSupabaseClient } from "./supabase"
import { createUserProfile, checkUserExists } from "@/app/actions/user-actions"

// Type for user signup data
type SignUpData = {
  email: string
  password: string
  username: string
  first_name: string
  last_name: string
  phone_number?: string | null
  profile_picture_url?: string | null
}

// Type for user profile update data
type UserProfileUpdate = {
  first_name?: string
  last_name?: string
  username?: string
  phone_number?: string | null
  display_name?: string
  profile_picture_url?: string | null
}

// Get current user session
export async function getCurrentSession() {
  try {
    const supabase = createClientSupabaseClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("❌ Session error:", error.message)
      return { session: null, error }
    }

    return { session: data.session, error: null }
  } catch (error) {
    console.error("💥 Unexpected session error:", error)
    return {
      session: null,
      error: error instanceof Error ? { message: error.message } : { message: "An unexpected error occurred" },
    }
  }
}

// Enhanced sign in function that supports both email and username
export async function signIn(emailOrUsername: string, password: string) {
  try {
    const supabase = createClientSupabaseClient()

    console.log("🔐 Signing in with:", emailOrUsername)

    let email = emailOrUsername

    // Check if input is username (no @ symbol)
    if (!emailOrUsername.includes("@")) {
      console.log("🔍 Looking up email for username:", emailOrUsername)

      // Look up email by username
      const { data: userData, error: lookupError } = await supabase
        .from("users")
        .select("email")
        .eq("username", emailOrUsername)
        .single()

      if (lookupError || !userData) {
        console.error("❌ Username not found:", lookupError)
        return { user: null, error: { message: "Invalid username or password" } }
      }

      email = userData.email
      console.log("✅ Found email for username:", email)
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("❌ Sign in error:", error.message)
      return { user: null, error }
    }

    console.log("✅ Sign in successful:", data.user?.email)
    return { user: data.user, error: null }
  } catch (error) {
    console.error("💥 Unexpected sign in error:", error)
    return {
      user: null,
      error: error instanceof Error ? { message: error.message } : { message: "An unexpected error occurred" },
    }
  }
}

// Sign up function
export async function signUp(userData: SignUpData) {
  try {
    const supabase = createClientSupabaseClient()

    console.log("📝 Signing up with:", userData.email)

    // Check if user already exists in our users table
    const { exists, error: checkError } = await checkUserExists(userData.email)

    if (checkError) {
      console.error("❌ Error checking user existence:", checkError)
      return { user: null, error: { message: checkError } }
    }

    if (exists) {
      console.log("❌ User already exists with this email")
      return { user: null, error: { message: "An account with this email already exists. Please sign in instead." } }
    }

    // Check if username is available
    const { available, error: usernameError } = await checkUsernameAvailability(userData.username)

    if (usernameError) {
      console.error("❌ Username check error:", usernameError.message)
      return { user: null, error: usernameError }
    }

    if (!available) {
      console.error("❌ Username not available")
      return { user: null, error: { message: "Username is already taken. Please choose a different username." } }
    }

    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    })

    if (authError) {
      console.error("❌ Auth signup error:", authError.message)

      // Handle specific auth errors
      if (authError.message.includes("already registered")) {
        return { user: null, error: { message: "An account with this email already exists. Please sign in instead." } }
      }

      return { user: null, error: authError }
    }

    if (!authData.user) {
      console.error("❌ No user returned from auth signup")
      return { user: null, error: { message: "Failed to create user account" } }
    }

    // Create the user profile using the server action
    const { success, error: profileError } = await createUserProfile({
      id: authData.user.id,
      email: userData.email,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      display_name: `${userData.first_name} ${userData.last_name}`,
      phone_number: userData.phone_number || null,
      profile_picture_url: userData.profile_picture_url || null,
    })

    if (!success) {
      console.error("❌ Profile creation error:", profileError)

      // If profile creation fails, we should clean up the auth user
      try {
        await supabase.auth.admin.deleteUser(authData.user.id)
      } catch (cleanupError) {
        console.error("❌ Failed to cleanup auth user:", cleanupError)
      }

      return { user: null, error: { message: profileError || "Failed to create user profile" } }
    }

    console.log("✅ Signup successful:", authData.user.email)
    return { user: authData.user, error: null }
  } catch (error) {
    console.error("💥 Unexpected signup error:", error)
    return {
      user: null,
      error: error instanceof Error ? { message: error.message } : { message: "An unexpected error occurred" },
    }
  }
}

// Check username availability
export async function checkUsernameAvailability(username: string) {
  try {
    const supabase = createClientSupabaseClient()

    const { data, error } = await supabase.from("users").select("username").eq("username", username).maybeSingle()

    if (error) {
      console.error("❌ Username check error:", error.message)
      return { available: false, error }
    }

    return { available: !data, error: null }
  } catch (error) {
    console.error("💥 Unexpected username check error:", error)
    return {
      available: false,
      error: error instanceof Error ? { message: error.message } : { message: "An unexpected error occurred" },
    }
  }
}

// Sign out function
export async function signOut() {
  try {
    const supabase = createClientSupabaseClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("❌ Sign out error:", error.message)
      return { error }
    }

    console.log("✅ Sign out successful")
    return { error: null }
  } catch (error) {
    console.error("💥 Unexpected sign out error:", error)
    return {
      error: error instanceof Error ? { message: error.message } : { message: "An unexpected error occurred" },
    }
  }
}

// Update user profile function
export async function updateUserProfile(userId: string, updates: UserProfileUpdate) {
  try {
    console.log("📝 Updating user profile:", userId, updates)
    const supabase = createClientSupabaseClient()

    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("❌ Profile update error:", error.message)
      return { success: false, error: error.message }
    }

    console.log("✅ Profile updated successfully")
    return { success: true, data, error: null }
  } catch (error) {
    console.error("💥 Unexpected profile update error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Upload profile picture function
export async function uploadProfilePicture(userId: string, file: File) {
  try {
    console.log("📸 Uploading profile picture for user:", userId)
    const supabase = createClientSupabaseClient()

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `profile-pictures/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("❌ Upload error:", uploadError.message)
      return { url: null, error: uploadError.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)

    // Update user profile with new picture URL
    const { error: updateError } = await supabase
      .from("users")
      .update({
        profile_picture_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("❌ Profile picture URL update error:", updateError.message)
      return { url: null, error: updateError.message }
    }

    console.log("✅ Profile picture uploaded successfully")
    return { url: publicUrl, error: null }
  } catch (error) {
    console.error("💥 Unexpected upload error:", error)
    return {
      url: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
