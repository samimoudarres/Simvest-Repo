"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Clock, BarChart2, DollarSign, Briefcase, Users } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"

interface ChallengeBottomNavigationProps {
  gameCode?: string
}

export default function ChallengeBottomNavigation({ gameCode }: ChallengeBottomNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Determine if we're in a game context or challenge context
  const isGameContext = pathname.includes("/game/")
  const baseRoute = isGameContext && gameCode ? `/game/${gameCode}` : "/challenge"

  // Define navigation items
  const navItems = [
    {
      name: "ACTIVITY",
      icon: Clock,
      path: baseRoute,
    },
    {
      name: "PERFORM.",
      icon: BarChart2,
      path: `${baseRoute}/performance`,
    },
    {
      name: "TRADE",
      icon: DollarSign,
      path: isGameContext ? `/challenge?gameCode=${gameCode}` : "/challenge",
    },
    {
      name: "PORTFOLIO",
      icon: Briefcase,
      path: `${baseRoute}/portfolio`,
    },
    {
      name: "LEADERBOARD",
      icon: Users,
      path: `${baseRoute}/leaderboard`,
    },
  ]

  // Check if current path matches the nav item
  const isActive = (path: string) => {
    if (path === baseRoute && pathname === baseRoute) return true
    if (path !== baseRoute && pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md">
      <div className="flex justify-between items-center p-3 border-t border-gray-200 bg-white safe-area-bottom">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex flex-col items-center px-2 ${
              isActive(item.path) ? "text-black font-bold" : "text-[#777777]"
            } ${item.name === "TRADE" ? "relative" : ""}`}
          >
            <TouchFeedback className="w-full flex flex-col items-center">
              {item.name === "TRADE" ? (
                <>
                  <div className="w-14 h-14 bg-[#f7b104] rounded-full flex items-center justify-center absolute -top-7 shadow-md">
                    <item.icon className="text-white" size={24} />
                  </div>
                  <span className="text-xs mt-7">{item.name}</span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 mb-1 flex items-center justify-center">
                    <item.icon size={20} />
                  </div>
                  <span className="text-xs">{item.name}</span>
                </>
              )}
            </TouchFeedback>
          </Link>
        ))}
      </div>
    </div>
  )
}
