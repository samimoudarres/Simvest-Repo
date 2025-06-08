"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import { serverSignUp, checkServerUsernameAvailability, serverJoinGame } from "@/app/actions/auth-actions"

type FormErrors = {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  password?: string
  phoneNumber?: string
}

export default function ProfileSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameCode = searchParams.get("gameCode")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [formTouched, setFormTouched] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check username availability with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null)
      return
    }

    const timer = setTimeout(async () => {
      setUsernameChecking(true)
      try {
        const result = await checkServerUsernameAvailability(username)
        setUsernameAvailable(result.available)
        if (result.error) {
          console.error("Username check error:", result.error)
        }
      } catch (err) {
        console.error("Error checking username:", err)
      } finally {
        setUsernameChecking(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

  // Validate form fields when they change
  useEffect(() => {
    if (!formTouched) return

    const errors: FormErrors = {}

    if (!firstName.trim()) {
      errors.firstName = "First name is required"
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required"
    }

    if (!username.trim()) {
      errors.username = "Username is required"
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters"
    } else if (usernameAvailable === false) {
      errors.username = "Username is already taken"
    }

    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!password.trim()) {
      errors.password = "Password is required"
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    setFormErrors(errors)
  }, [firstName, lastName, username, email, password, usernameAvailable, formTouched])

  const handleProfileImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    setFormTouched(true)

    const errors: FormErrors = {}

    if (!firstName.trim()) {
      errors.firstName = "First name is required"
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required"
    }

    if (!username.trim()) {
      errors.username = "Username is required"
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters"
    } else if (usernameAvailable === false) {
      errors.username = "Username is already taken"
    }

    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!password.trim()) {
      errors.password = "Password is required"
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isFormValid = () => {
    return (
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      username.trim() !== "" &&
      username.length >= 3 &&
      email.trim() !== "" &&
      /\S+@\S+\.\S+/.test(email) &&
      password.trim() !== "" &&
      password.length >= 6 &&
      usernameAvailable === true
    )
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      // Create user account using server action
      const result = await serverSignUp({
        email,
        password,
        username,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        profile_picture_url: null, // We'll update this after upload
      })

      if (!result.success || !result.user) {
        throw new Error(result.error || "Failed to create user account")
      }

      // TODO: Upload profile picture if provided
      // This would use a server action for profile picture upload

      // Join game if game code is provided
      if (gameCode) {
        const joinResult = await serverJoinGame(gameCode, result.user.id)
        if (!joinResult.success) {
          throw new Error(joinResult.error || "Failed to join game")
        }
      }

      // Redirect to the appropriate page
      if (gameCode) {
        router.push(`/challenge/activity?gameCode=${gameCode}`)
      } else {
        router.push("/challenge/activity")
      }
    } catch (err) {
      console.error("Error during registration:", err)
      setError(err instanceof Error ? err.message : "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-[430px] mx-auto">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <TouchFeedback onClick={() => router.push("/join-game/info")}>
          <ArrowLeft size={24} className="text-black" />
        </TouchFeedback>
        <h1 className="text-[#0077B6] text-3xl font-bold">SIMVEST</h1>
        <div className="w-6"></div> {/* Empty div for spacing */}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 flex flex-col">
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8 mt-2">
          <TouchFeedback onClick={handleProfileImageClick}>
            <div className="w-24 h-24 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img src={profileImage || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-10 h-6 bg-white rounded-t-full"></div>
                  <div className="w-16 h-8 bg-white rounded-full mt-1"></div>
                </div>
              )}
            </div>
            <p className="text-center text-gray-700 mt-2">Set profile photo</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </TouchFeedback>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-5">
          {/* First and Last Name Row */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-gray-700 text-base font-medium mb-2">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  setFormTouched(true)
                }}
                className={`w-full p-3 bg-[#F0F4F8] rounded-md focus:outline-none ${
                  formErrors.firstName ? "border-2 border-red-500" : ""
                }`}
                placeholder="Enter first name"
              />
              {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 text-base font-medium mb-2">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  setFormTouched(true)
                }}
                className={`w-full p-3 bg-[#F0F4F8] rounded-md focus:outline-none ${
                  formErrors.lastName ? "border-2 border-red-500" : ""
                }`}
                placeholder="Enter last name"
              />
              {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-gray-700 text-base font-medium mb-2">
              Create username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setFormTouched(true)
                }}
                className={`w-full p-3 bg-[#F0F4F8] rounded-md focus:outline-none ${
                  formErrors.username
                    ? "border-2 border-red-500"
                    : usernameAvailable === true && username.length >= 3
                      ? "border-2 border-green-500"
                      : ""
                }`}
                placeholder="Enter username"
              />
              {usernameChecking && (
                <div className="absolute right-3 top-3">
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
              )}
              {usernameAvailable === true && username.length >= 3 && !usernameChecking && (
                <div className="absolute right-3 top-3">
                  <CheckCircle size={20} className="text-green-500" />
                </div>
              )}
              {formErrors.username && <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>}
              {usernameAvailable === true && username.length >= 3 && !formErrors.username && (
                <p className="text-green-500 text-sm mt-1">Username is available</p>
              )}
            </div>
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-gray-700 text-base font-medium mb-2">Phone number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                setFormTouched(true)
              }}
              className="w-full p-3 bg-[#F0F4F8] rounded-md focus:outline-none"
              placeholder="Enter phone number"
            />
            {formErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-gray-700 text-base font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setFormTouched(true)
              }}
              className={`w-full p-3 bg-[#F0F4F8] rounded-md focus:outline-none ${
                formErrors.email ? "border-2 border-red-500" : ""
              }`}
              placeholder="Enter email address"
            />
            {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 text-base font-medium mb-2">
              Create password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setFormTouched(true)
                }}
                className={`w-full p-3 bg-[#F0F4F8] rounded-md focus:outline-none ${
                  formErrors.password ? "border-2 border-red-500" : ""
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-auto py-8">
          <TouchFeedback
            className={`w-full py-4 rounded-full text-center font-bold text-white text-xl shadow-md ${
              isFormValid() && !isLoading
                ? "bg-gradient-to-r from-[#0077B6] to-[#00B4D8]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 size={24} className="animate-spin mr-2" />
                Creating account...
              </div>
            ) : (
              "Start trading"
            )}
          </TouchFeedback>
        </div>
      </div>
    </div>
  )
}
