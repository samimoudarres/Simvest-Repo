"use client"

import { memo, useMemo } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Clock, BarChart2, DollarSign, Briefcase, Users } from "lucide-react"

const BottomNavigation = memo(function BottomNavigation() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get game code from URL params
  const gameCode = useMemo(() => {
    return searchParams.get("gameCode") || ""
  }, [searchParams])

  // Build URLs with game context
  const buildUrl = useMemo(
    () => (path: string) => {
      if (gameCode && gameCode !== "112024") {
        return `${path}?gameCode=${gameCode}`
      }
      return path
    },
    [gameCode],
  )

  // Define navigation items
  const navItems = useMemo(
    () => [
      {
        name: "ACTIVITY",
        icon: Clock,
        path: buildUrl("/activity"),
      },
      {
        name: "PERFORM.",
        icon: BarChart2,
        path: buildUrl("/performance"),
      },
      {
        name: "TRADE",
        icon: DollarSign,
        path: "/challenge", // Route to the restored challenge screen
      },
      {
        name: "PORTFOLIO",
        icon: Briefcase,
        path: buildUrl("/portfolio"),
      },
      {
        name: "LEADERBOARD",
        icon: Users,
        path: buildUrl("/leaderboard"),
      },
    ],
    [buildUrl],
  )

  // Check if current path matches the nav item
  const isActive = (path: string) => {
    const basePath = path.split("?")[0]
    return pathname === basePath || (path === "/challenge" && pathname.startsWith("/challenge"))
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-[430px] mx-auto">
        <div className="flex justify-between items-center p-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center px-2 transition-all duration-200 active:scale-95 ${
                isActive(item.path) ? "text-black font-bold" : "text-[#777777]"
              } ${item.name === "TRADE" ? "relative" : ""}`}
            >
              <div className="w-full flex flex-col items-center">
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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
})

export default BottomNavigation
