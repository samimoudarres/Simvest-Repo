"use client"

import { usePathname, useRouter } from "next/navigation"
import { Activity, BarChart2, DollarSign, Briefcase, Award } from "lucide-react"

const BottomNavigation = () => {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const navigate = (path: string) => {
    router.push(path)
  }

  return (
    <div className="flex justify-between items-center p-3 border-t border-gray-200 bg-white sticky bottom-0 z-10 max-w-md mx-auto w-full">
      <button
        onClick={() => navigate("/challenge/activity")}
        className={`flex flex-col items-center px-2 ${isActive("/challenge/activity") ? "text-black font-bold" : "text-[#777777]"}`}
      >
        <Activity size={20} className="mb-1" />
        <span className="text-xs">ACTIVITY</span>
      </button>

      <button
        onClick={() => navigate("/challenge/performance")}
        className={`flex flex-col items-center px-2 ${isActive("/challenge/performance") ? "text-black font-bold" : "text-[#777777]"}`}
      >
        <BarChart2 size={20} className="mb-1" />
        <span className="text-xs">PERFORM.</span>
      </button>

      <button onClick={() => navigate("/")} className="flex flex-col items-center relative px-2">
        <div
          className={`w-14 h-14 bg-[#f7b104] rounded-full flex items-center justify-center absolute -top-7 ${isActive("/") ? "ring-2 ring-white" : ""}`}
        >
          <DollarSign size={24} className="text-white" />
        </div>
        <span className={`text-xs mt-7 ${isActive("/") ? "text-black font-bold" : "text-[#777777]"}`}>TRADE</span>
      </button>

      <button
        onClick={() => navigate("/challenge/portfolio")}
        className={`flex flex-col items-center px-2 ${isActive("/challenge/portfolio") ? "text-black font-bold" : "text-[#777777]"}`}
      >
        <Briefcase size={20} className="mb-1" />
        <span className="text-xs">PORTFOLIO</span>
      </button>

      <button
        onClick={() => navigate("/challenge/leaderboard")}
        className={`flex flex-col items-center px-2 ${isActive("/challenge/leaderboard") ? "text-black font-bold" : "text-[#777777]"}`}
      >
        <Award size={20} className="mb-1" />
        <span className="text-xs">LEADERBOARD</span>
      </button>
    </div>
  )
}

export default BottomNavigation
