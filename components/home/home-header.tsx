"use client"

import { Search, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ProfileDropdownFixed from "@/components/profile-dropdown-fixed"

export default function HomeHeader() {
  const router = useRouter()
  const { user, profile } = useAuth()

  return (
    <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-8">
      <div className="flex justify-between items-center mb-6">
        {/* FIXED Profile Icon - Now Completely Clickable */}
        <ProfileDropdownFixed />

        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 active:scale-95"
            onClick={() => router.push("/challenge/search")}
          >
            <Search size={24} className="text-white" />
          </button>
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 active:scale-95">
            <Bell size={24} className="text-white" />
          </button>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-white text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-white/90 text-lg">Ready to make some trades?</p>
      </div>
    </div>
  )
}
