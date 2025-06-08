"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, LogOut, Edit2, Camera, Loader2 } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import { useAuth } from "@/contexts/auth-context"
import { signOut, uploadProfilePicture, updateUserProfile } from "@/lib/auth"

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, refreshProfile, debugAuthState } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [username, setUsername] = useState(profile?.username || "")
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "")
  const [error, setError] = useState<string | null>(null)

  // Debug authentication state
  React.useEffect(() => {
    console.log("👤 Profile: Component mounted")
    debugAuthState()
  }, [debugAuthState])

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const { error } = await signOut()
      if (error) throw error
      router.push("/login")
    } catch (err) {
      console.error("❌ Logout error:", err)
      setError("Failed to log out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const { success, error } = await updateUserProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        username,
        phone_number: phoneNumber,
        display_name: `${firstName} ${lastName}`,
      })

      if (!success) throw new Error(error || "Failed to update profile")

      await refreshProfile()
      setIsEditing(false)
      console.log("✅ Profile updated successfully")
    } catch (err) {
      console.error("❌ Profile update error:", err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    setIsLoading(true)
    setError(null)

    try {
      const { url, error } = await uploadProfilePicture(user.id, file)
      if (error) throw new Error(error)

      await refreshProfile()
      console.log("✅ Profile picture uploaded successfully")
    } catch (err) {
      console.error("❌ Profile picture upload error:", err)
      setError("Failed to upload profile picture. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] max-w-[430px] mx-auto">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={40} className="text-[#0052cc] animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] max-w-[430px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0052cc] via-[#2684ff] to-[#4c9aff] p-4 pb-24 relative">
        <div className="flex justify-between items-center">
          <TouchFeedback className="text-white p-2" onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </TouchFeedback>
          <h1 className="text-white text-xl font-bold">My Profile</h1>
          <TouchFeedback className="text-white p-2" onClick={handleLogout}>
            <LogOut size={22} />
          </TouchFeedback>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 px-4 -mt-20 relative z-10">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url || "/placeholder.svg"}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#0052cc] text-white text-3xl font-bold">
                    {profile.first_name?.[0] || ""}
                    {profile.last_name?.[0] || ""}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-[#0052cc] text-white p-1.5 rounded-full shadow-md cursor-pointer">
                <Camera size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureUpload} />
              </label>
            </div>
            <h2 className="text-xl font-bold mt-3">{profile.display_name}</h2>
            <p className="text-gray-500">@{profile.username}</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

          {isEditing ? (
            /* Edit Profile Form */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1 text-left">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1 text-left">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 text-left">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 text-left">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <TouchFeedback
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-center font-medium"
                  onClick={() => {
                    setFirstName(profile.first_name || "")
                    setLastName(profile.last_name || "")
                    setUsername(profile.username || "")
                    setPhoneNumber(profile.phone_number || "")
                    setIsEditing(false)
                  }}
                >
                  Cancel
                </TouchFeedback>
                <TouchFeedback
                  className="flex-1 py-2 bg-[#0052cc] text-white rounded-lg text-center font-medium"
                  onClick={handleSaveProfile}
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Save Changes"}
                </TouchFeedback>
              </div>
            </div>
          ) : (
            /* Profile Info - V55 Layout Restored */
            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 text-left">Email</h3>
                  <p className="text-gray-800 text-left">{profile.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 text-left">Phone Number</h3>
                  <p className="text-gray-800 text-left">{profile.phone_number || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 text-left">Member Since</h3>
                  <p className="text-gray-800 text-left">
                    {profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <TouchFeedback
                className="mt-6 w-full py-2.5 border border-[#0052cc] text-[#0052cc] rounded-lg text-center font-medium flex items-center justify-center"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={18} className="mr-2" />
                Edit Profile
              </TouchFeedback>
            </div>
          )}
        </div>

        {/* Game Stats - V55 Layout */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-6">
          <h3 className="text-lg font-bold mb-4 text-left">Game Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm text-left">Games Joined</p>
              <p className="text-2xl font-bold text-[#0052cc] text-left">3</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm text-left">Games Created</p>
              <p className="text-2xl font-bold text-[#0052cc] text-left">1</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm text-left">Best Rank</p>
              <p className="text-2xl font-bold text-[#0052cc] text-left">#2</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm text-left">Best Return</p>
              <p className="text-2xl font-bold text-[#0fae37] text-left">+24.8%</p>
            </div>
          </div>
        </div>

        {/* Account Actions - V55 Layout */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-6">
          <h3 className="text-lg font-bold mb-4 text-left">Account</h3>
          <div className="space-y-3">
            <TouchFeedback className="w-full py-2.5 text-gray-700 flex justify-between items-center text-left">
              <span>Change Password</span>
              <ArrowLeft size={18} className="rotate-180" />
            </TouchFeedback>
            <TouchFeedback className="w-full py-2.5 text-gray-700 flex justify-between items-center text-left">
              <span>Notification Settings</span>
              <ArrowLeft size={18} className="rotate-180" />
            </TouchFeedback>
            <TouchFeedback className="w-full py-2.5 text-gray-700 flex justify-between items-center text-left">
              <span>Privacy Settings</span>
              <ArrowLeft size={18} className="rotate-180" />
            </TouchFeedback>
            <TouchFeedback
              className="w-full py-2.5 text-red-600 flex justify-between items-center text-left"
              onClick={handleLogout}
            >
              <span>Log Out</span>
              <LogOut size={18} />
            </TouchFeedback>
          </div>
        </div>
      </div>
    </div>
  )
}
