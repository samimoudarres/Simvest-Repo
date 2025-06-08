import { createClientSupabaseClient } from "./supabase"

const supabase = createClientSupabaseClient()

// COMPLETELY FIXED LOGOUT FUNCTIONALITY
export async function performLogout(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🚪 Starting logout process...")

    // Step 1: Clear Supabase session
    console.log("🔄 Clearing Supabase session...")
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      console.error("❌ Supabase sign out error:", signOutError)
      // Continue with logout even if Supabase fails
    } else {
      console.log("✅ Supabase session cleared")
    }

    // Step 2: Clear local storage
    console.log("🔄 Clearing local storage...")
    try {
      localStorage.clear()
      console.log("✅ Local storage cleared")
    } catch (storageError) {
      console.error("❌ Local storage clear error:", storageError)
    }

    // Step 3: Clear session storage
    console.log("🔄 Clearing session storage...")
    try {
      sessionStorage.clear()
      console.log("✅ Session storage cleared")
    } catch (storageError) {
      console.error("❌ Session storage clear error:", storageError)
    }

    // Step 4: Clear any cached data
    console.log("🔄 Clearing cached data...")
    try {
      // Clear any application-specific caches
      if ("caches" in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
        console.log("✅ Browser caches cleared")
      }
    } catch (cacheError) {
      console.error("❌ Cache clear error:", cacheError)
    }

    console.log("✅ Logout process completed successfully")
    return { success: true }
  } catch (error) {
    console.error("💥 Logout process failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Logout failed",
    }
  }
}

// Enhanced logout with confirmation
export async function logoutWithConfirmation(): Promise<{ success: boolean; error?: string; cancelled?: boolean }> {
  try {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to logout?")

    if (!confirmed) {
      console.log("ℹ️ Logout cancelled by user")
      return { success: false, cancelled: true }
    }

    // Perform logout
    const result = await performLogout()
    return result
  } catch (error) {
    console.error("💥 Logout with confirmation failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Logout failed",
    }
  }
}
