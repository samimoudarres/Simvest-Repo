"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { signIn } from "@/lib/auth"
import { ensureDemoAccountExists } from "@/app/actions/auth-actions"

export default function LoginPage() {
  const router = useRouter()
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Ensure demo account exists on page load
  useEffect(() => {
    const setupDemoAccount = async () => {
      setStatusMessage("Checking demo account...")
      const result = await ensureDemoAccountExists()
      if (result.success) {
        setStatusMessage(null)
      } else {
        console.error("Failed to ensure demo account:", result.error)
        setStatusMessage(null)
      }
    }

    setupDemoAccount()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) return

    setIsLoading(true)
    setError(null)

    console.log("Login attempt with:", emailOrUsername)

    try {
      // Use enhanced signIn function that supports both email and username
      const { user, error } = await signIn(emailOrUsername, password)

      if (error) {
        console.error("Login error:", error)
        setError(error.message || "Login failed. Please try again.")
        return
      }

      if (user) {
        console.log("Login successful, user:", user.email)
        // Auth context will handle redirect
      } else {
        setError("Login failed. Please try again.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const useTestAccount = () => {
    setEmailOrUsername("john.smith1@example.com")
    setPassword("demo123")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0052cc] via-[#2684ff] to-[#4c9aff]">
      {/* Header with Logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo Section */}
        <div className="mb-12 text-center">
          <div className="mb-6">
            <img
              src="/simvest-logo.png"
              alt="Simvest Logo"
              className="w-48 h-auto mx-auto"
              style={{
                filter: "brightness(0) invert(1)", // Makes the logo white
              }}
            />
          </div>
          <h1 className="text-white text-4xl font-bold tracking-wider mb-2">SIMVEST</h1>
          <div className="text-white/80 text-lg">Investment Trading Simulator</div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-white text-2xl font-bold text-center mb-6">Welcome Back</h2>

            {statusMessage && (
              <div className="bg-blue-500/20 border border-blue-400/30 text-white p-3 rounded-lg mb-4 text-sm">
                {statusMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-white p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email/Username Input */}
              <div>
                <label htmlFor="emailOrUsername" className="block text-white/90 text-sm font-medium mb-2">
                  Email or Username
                </label>
                <input
                  id="emailOrUsername"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-white/90 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent pr-12"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 transition-transform duration-100 active:scale-95"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full py-3 bg-white text-[#0052cc] font-bold rounded-lg text-center shadow-lg hover:bg-white/90 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Forgot Password */}
            <div className="text-center mt-4">
              <button className="text-white/80 text-sm hover:text-white transition-transform duration-100 active:scale-95">
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <div className="text-white/80 text-sm">
              Don't have an account?{" "}
              <button
                className="text-white font-semibold hover:underline transition-transform duration-100 active:scale-95"
                onClick={() => router.push("/signup")}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Demo Login */}
          <div className="text-center mt-4">
            <button
              className="text-white/60 text-xs hover:text-white/80 transition-transform duration-100 active:scale-95"
              onClick={useTestAccount}
            >
              Use Demo Account
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6">
        <div className="text-white/60 text-xs">© 2024 Simvest. All rights reserved.</div>
      </div>
    </div>
  )
}
