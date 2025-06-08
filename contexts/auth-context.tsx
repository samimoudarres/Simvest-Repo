"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define user type
type User = {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

// Define auth context type
type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ success: false }),
  signOut: async () => {},
})

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // For demo purposes, check localStorage for a mock session
        const storedUser = localStorage.getItem("mock_user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      // Mock authentication for demo purposes
      if (email && password) {
        const mockUser = {
          id: "user_" + Math.random().toString(36).substring(2, 9),
          email,
          user_metadata: {
            full_name: email.split("@")[0],
          },
        }

        // Store in localStorage for persistence
        localStorage.setItem("mock_user", JSON.stringify(mockUser))
        setUser(mockUser)
        return { success: true }
      }
      return { success: false, error: "Invalid credentials" }
    } catch (error) {
      console.error("Error signing in:", error)
      return { success: false, error: "An error occurred during sign in" }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      localStorage.removeItem("mock_user")
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext)
