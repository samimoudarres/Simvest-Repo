"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Settings, LogOut, ChevronDown, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { logoutWithConfirmation } from "@/lib/auth-enhanced"

export default function ProfileDropdownFixed() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, profile } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setLogoutError(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // COMPLETELY FIXED LOGOUT HANDLER
  const handleLogout = async () => {
    try {
      console.log("🚪 Logout button clicked")
      setIsLoggingOut(true)
      setLogoutError(null)
      setIsOpen(false)

      // Perform logout with confirmation
      const result = await logoutWithConfirmation()

      if (result.cancelled) {
        console.log("ℹ️ Logout cancelled")
        setIsLoggingOut(false)
        return
      }

      if (!result.success) {
        console.error("❌ Logout failed:", result.error)
        setLogoutError(result.error || "Logout failed")
        setIsLoggingOut(false)
        return
      }

      console.log("✅ Logout successful, redirecting...")

      // Force redirect to login page
      window.location.href = "/login"
    } catch (error) {
      console.error("💥 Logout error:", error)
      setLogoutError(error instanceof Error ? error.message : "Logout failed")
      setIsLoggingOut(false)
    }
  }

  const handleViewProfile = () => {
    router.push("/profile")
    setIsOpen(false)
  }

  const handleSettings = () => {
    router.push("/settings")
    setIsOpen(false)
  }

  if (!user || !profile) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon Button - COMPLETELY CLICKABLE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 active:scale-95 cursor-pointer"
        disabled={isLoggingOut}
        type="button"
      >
        <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center overflow-hidden">
          {profile.profile_picture_url ? (
            <img
              src={profile.profile_picture_url || "/placeholder.svg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={18} className="text-white" />
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-white transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="font-medium text-gray-900 truncate">{profile.display_name || profile.username}</p>
            <p className="text-sm text-gray-500 truncate">@{profile.username}</p>
          </div>

          <button
            onClick={handleViewProfile}
            className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            type="button"
          >
            <User size={18} className="text-gray-600 mr-3" />
            <span className="text-gray-900">View Profile</span>
          </button>

          <button
            onClick={handleSettings}
            className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            type="button"
          >
            <Settings size={18} className="text-gray-600 mr-3" />
            <span className="text-gray-900">Settings</span>
          </button>

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {isLoggingOut ? (
                <Loader2 size={18} className="text-red-600 mr-3 animate-spin" />
              ) : (
                <LogOut size={18} className="text-red-600 mr-3" />
              )}
              <span className="text-red-600">{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>

          {/* Error Display */}
          {logoutError && (
            <div className="px-4 py-2 border-t border-gray-100">
              <p className="text-xs text-red-600">{logoutError}</p>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <span className="text-gray-900">Logging out...</span>
          </div>
        </div>
      )}
    </div>
  )
}
