"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

type UserProfile = {
  id: string
  email: string
  username: string
  display_name: string
  first_name: string
  last_name: string
  phone_number: string | null
  profile_picture_url: string | null
  created_at: string
  updated_at: string
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
  logout: () => Promise<void>
  debugAuthState: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const supabase = createClientSupabaseClient()

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/emergency-login"]

  // Enhanced debugging function
  const debugAuthState = useCallback(() => {
    console.log("🔍 AUTH DEBUG STATE:", {
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? { id: profile.id, username: profile.username } : null,
      isLoading,
      isAuthenticated: !!user && !!profile,
      initialized,
      pathname,
      timestamp: new Date().toISOString(),
    })
  }, [user, profile, isLoading, initialized, pathname])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("📊 Fetching profile for user:", userId)
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.error("❌ Error fetching user profile:", error)
        return null
      }

      console.log("✅ Profile fetched successfully:", data.username)
      return data
    } catch (error) {
      console.error("💥 Error fetching user profile:", error)
      return null
    }
  }

  const refreshProfile = useCallback(async () => {
    if (user) {
      console.log("🔄 Refreshing profile for user:", user.id)
      const profileData = await fetchUserProfile(user.id)
      if (profileData) {
        setProfile(profileData)
        console.log("✅ Profile refreshed successfully")
      } else {
        console.error("❌ Failed to refresh profile")
      }
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      console.log("🚪 Signing out user...")
      setIsLoading(true)

      // Clear local state first
      setUser(null)
      setProfile(null)

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("❌ Sign out error:", error)
      } else {
        console.log("✅ Sign out successful")
      }

      // Always redirect to login regardless of error
      router.push("/login")
    } catch (error) {
      console.error("💥 Sign out error:", error)
      // Still redirect to login on error
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  // Alias for logout
  const logout = handleSignOut

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🚀 Initializing auth state...")
      setIsLoading(true)

      try {
        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("❌ Session error:", sessionError)
          setUser(null)
          setProfile(null)
        } else if (session?.user) {
          console.log("✅ Active session found for:", session.user.email)
          setUser(session.user)

          // Fetch profile data
          const profileData = await fetchUserProfile(session.user.id)
          if (profileData) {
            setProfile(profileData)
            console.log("✅ Auth initialization complete with profile")
          } else {
            console.warn("⚠️ Auth initialized but profile fetch failed")
          }
        } else {
          console.log("ℹ️ No active session found")
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error("💥 Auth initialization error:", error)
        setUser(null)
        setProfile(null)
      } finally {
        setIsLoading(false)
        setInitialized(true)
        console.log("🏁 Auth initialization finished")
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.email || "no user")

      if (session?.user) {
        console.log("👤 User authenticated:", session.user.email)
        setUser(session.user)

        // Fetch profile data
        const profileData = await fetchUserProfile(session.user.id)
        if (profileData) {
          setProfile(profileData)
          console.log("✅ Profile loaded after auth change")
        } else {
          console.warn("⚠️ Profile fetch failed after auth change")
        }
      } else {
        console.log("👤 User signed out")
        setUser(null)
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Handle routing based on auth state
  useEffect(() => {
    if (isLoading || !initialized) return

    const isPublicRoute = publicRoutes.includes(pathname)
    const isAuthenticated = !!user && !!profile

    console.log("🛣️ Auth routing check:", {
      isAuthenticated,
      currentPath: pathname,
      isPublicRoute,
      hasUser: !!user,
      hasProfile: !!profile,
    })

    if (!isAuthenticated && !isPublicRoute) {
      console.log("🔒 Redirecting to login - unauthenticated user on protected route")
      router.push("/login")
    } else if (isAuthenticated && isPublicRoute) {
      console.log("🏠 Redirecting to home - authenticated user on public route")
      router.push("/")
    }
  }, [user, profile, pathname, router, isLoading, initialized])

  const contextValue = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user && !!profile,
    refreshProfile,
    signOut: handleSignOut,
    logout,
    debugAuthState,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
