"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, profile, logout } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setIsOpen(false)
      await logout()
      console.log("✅ Logout successful")
    } catch (error) {
      console.error("❌ Logout error:", error)
    } finally {
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
      {/* Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 active:scale-95"
        disabled={isLoggingOut}
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
          >
            <User size={18} className="text-gray-600 mr-3" />
            <span className="text-gray-900">View Profile</span>
          </button>

          <button
            onClick={handleSettings}
            className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <Settings size={18} className="text-gray-600 mr-3" />
            <span className="text-gray-900">Settings</span>
          </button>

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <LogOut size={18} className="text-red-600 mr-3" />
              <span className="text-red-600">{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
