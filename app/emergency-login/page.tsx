"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import TouchFeedback from "@/components/touch-feedback"
import { Loader2 } from "lucide-react"

export default function EmergencyLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleEmergencyLogin = async () => {
    setIsLoading(true)
    setMessage("")
    setError("")

    try {
      const supabase = createClientSupabaseClient()
      console.log("Emergency login attempt with demo account")

      // Try to sign in with demo account
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "john.smith1@example.com",
        password: "demo123",
      })

      if (error) {
        console.error("Emergency login error:", error)
        setError(`Login error: ${error.message}`)
        return
      }

      if (data.user) {
        setMessage("Login successful! Redirecting...")
        console.log("Emergency login successful, user:", data.user.email)

        // Wait a moment before redirecting
        setTimeout(() => {
          router.push("/")
        }, 1000)
      }
    } catch (error) {
      console.error("Emergency login error:", error)
      setError(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    setMessage("")
    setError("")

    try {
      const supabase = createClientSupabaseClient()

      // Test basic connection
      const { data, error } = await supabase.from("users").select("count").limit(1)

      if (error) {
        console.error("Database connection error:", error)
        setError(`Database error: ${error.message}`)
      } else {
        setMessage("Database connection successful!")
        console.log("Database connection test successful")
      }
    } catch (error) {
      console.error("Connection test error:", error)
      setError(`Connection error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] items-center justify-center p-6">
      <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Emergency Access</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="space-y-4">
          <TouchFeedback
            className="w-full py-3 bg-[#0077B6] text-white font-bold rounded-lg text-center"
            onClick={handleEmergencyLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 size={20} className="animate-spin mr-2" />
                Loading...
              </div>
            ) : (
              "Emergency Login (Demo Account)"
            )}
          </TouchFeedback>

          <TouchFeedback
            className="w-full py-3 bg-gray-500 text-white font-bold rounded-lg text-center"
            onClick={handleTestConnection}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 size={20} className="animate-spin mr-2" />
                Testing...
              </div>
            ) : (
              "Test Database Connection"
            )}
          </TouchFeedback>

          <TouchFeedback
            className="w-full py-3 bg-green-500 text-white font-bold rounded-lg text-center"
            onClick={() => router.push("/login")}
          >
            Back to Login
          </TouchFeedback>
        </div>
      </div>
    </div>
  )
}
