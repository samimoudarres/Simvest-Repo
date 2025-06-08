"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Loader2, Camera } from "lucide-react"
import { signUp, checkUsernameAvailability } from "@/lib/auth"

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1 = Basic Info, 2 = Profile Setup
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    phoneNumber: "",
    profilePicture: null as File | null,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null) // Clear error when user starts typing

    if (field === "username" && value.length >= 3) {
      checkUsername(value)
    } else if (field === "username" && value.length < 3) {
      setUsernameAvailable(null)
    }
  }

  const checkUsername = async (username: string) => {
    setCheckingUsername(true)
    try {
      const { available } = await checkUsernameAvailability(username)
      setUsernameAvailable(available)
    } catch (err) {
      console.error("Username check error:", err)
      setUsernameAvailable(null)
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, profilePicture: e.target.files![0] }))
    }
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }

    if (!formData.password.trim()) {
      setError("Password is required")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setStep(2)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // Final validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error("First name and last name are required")
      }

      if (!formData.username.trim()) {
        throw new Error("Username is required")
      }

      if (formData.username.length < 3) {
        throw new Error("Username must be at least 3 characters")
      }

      if (!usernameAvailable) {
        throw new Error("Username is not available")
      }

      console.log("Signup attempt with:", formData.email)

      const { user, error } = await signUp({
        email: formData.email.trim(),
        password: formData.password,
        username: formData.username.trim(),
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone_number: formData.phoneNumber.trim() || null,
        profile_picture_url: null, // We'll handle file upload separately
      })

      if (error) {
        console.error("Signup error:", error)
        throw new Error(error.message || "Failed to create account")
      }

      if (user) {
        console.log("Signup successful, user:", user.email)
        router.push("/") // Redirect to home after successful signup
      } else {
        throw new Error("Failed to create account")
      }
    } catch (err) {
      console.error("Signup error:", err)
      const errorMessage = err instanceof Error ? err.message : "Sign up failed. Please try again."

      // Handle specific error cases
      if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
        setError("An account with this email already exists. Please sign in instead.")
      } else if (errorMessage.includes("Username")) {
        setError(errorMessage)
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0052cc] via-[#2684ff] to-[#4c9aff]">
      {/* Header */}
      <div className="p-4 flex items-center">
        <button
          className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => (step === 1 ? router.back() : setStep(1))}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white text-xl font-bold ml-2">{step === 1 ? "Create Account" : "Complete Profile"}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        {step === 1 ? (
          /* Step 1: Basic Information */
          <div className="max-w-sm mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-center mb-6">
                <h2 className="text-white text-2xl font-bold mb-2">Join Simvest</h2>
                <div className="text-white/80 text-sm">Start your investment journey</div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400/30 text-white p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleStep1Submit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-white/90 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-white/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-white/90 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Create a password"
                      className="w-full px-4 py-3 bg-white/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 pr-12"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-white/90 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 bg-white/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 pr-12"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white text-[#0052cc] font-bold rounded-lg text-center shadow-lg hover:bg-white/90 transition-colors mt-6"
                >
                  Continue
                </button>
              </form>
            </div>

            <div className="text-center mt-6">
              <div className="text-white/80 text-sm">
                Already have an account?{" "}
                <button className="text-white font-semibold hover:underline" onClick={() => router.push("/login")}>
                  Sign In
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Profile Setup */
          <div className="max-w-sm mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-center mb-6">
                <h2 className="text-white text-2xl font-bold mb-2">Complete Your Profile</h2>
                <div className="text-white/80 text-sm">Tell us a bit about yourself</div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400/30 text-white p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Profile Picture */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 overflow-hidden">
                      {formData.profilePicture ? (
                        <img
                          src={URL.createObjectURL(formData.profilePicture) || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/60">
                          <Camera size={24} />
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-white text-[#0052cc] p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-white/90 transition-colors">
                      <Camera size={14} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
                    </label>
                  </div>
                  <div className="text-white/60 text-xs mt-2">Add a profile picture</div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-white/90 text-sm font-medium mb-2">
                      First Name <span className="text-red-300">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="First name"
                      className="w-full px-3 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-white/90 text-sm font-medium mb-2">
                      Last Name <span className="text-red-300">*</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Last name"
                      className="w-full px-3 py-3 bg-white/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-white/90 text-sm font-medium mb-2">
                    Username <span className="text-red-300">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="Choose a username"
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      required
                    />
                    {checkingUsername && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 size={16} className="animate-spin text-white/60" />
                      </div>
                    )}
                  </div>
                  {formData.username.length >= 3 && !checkingUsername && (
                    <div className={`text-xs mt-1 ${usernameAvailable ? "text-green-300" : "text-red-300"}`}>
                      {usernameAvailable ? "Username is available" : "Username is taken"}
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-white/90 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white text-[#0052cc] font-bold rounded-lg text-center shadow-lg hover:bg-white/90 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !usernameAvailable || formData.username.length < 3}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
