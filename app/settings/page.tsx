"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function SettingsPage() {
  const router = useRouter()
  const { profile, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const settingsOptions = [
    {
      icon: User,
      title: "Profile Settings",
      description: "Update your profile information",
      action: () => router.push("/profile"),
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage your notification preferences",
      action: () => console.log("Notifications settings"),
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Control your privacy settings",
      action: () => console.log("Privacy settings"),
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Get help and contact support",
      action: () => console.log("Help & Support"),
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <div className="bg-[#f7b104] p-5 pt-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-white p-2 transition-transform duration-100 active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white text-xl font-bold">Settings</h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Profile Section */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
              {profile?.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={24} className="text-gray-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">{profile?.display_name || "User"}</h2>
              <p className="text-gray-500">@{profile?.username || "username"}</p>
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-2">
          {settingsOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.action}
              className="w-full bg-white rounded-xl p-4 shadow-sm transition-all duration-200 active:scale-[0.98] hover:shadow-md"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                  <option.icon size={20} className="text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-900">{option.title}</h3>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full bg-red-50 border border-red-200 rounded-xl p-4 transition-all duration-200 active:scale-[0.98] hover:bg-red-100 disabled:opacity-50"
          >
            <div className="flex items-center justify-center">
              <LogOut size={20} className="text-red-600 mr-2" />
              <span className="font-medium text-red-600">{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
