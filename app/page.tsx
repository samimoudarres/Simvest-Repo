"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Settings, Plus, ChevronDown } from "lucide-react"
import ActivityCard from "@/components/home/activity-card"
import { useAuth } from "@/contexts/auth-context"
import { fetchUserGames } from "./actions/game-actions"
import ProfileDropdownFixed from "@/components/profile-dropdown-fixed"

type Game = {
  id: string
  title: string
  game_code: string
  description: string | null
  host_id: string | null
  host_name?: string
  start_date: string | null
  end_date: string | null
  current_players: number | null
  status: string
  color_theme?: number
}

export default function HomePage() {
  const router = useRouter()
  const { user, profile, isLoading } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [gamesError, setGamesError] = useState<string | null>(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // Color themes for games
  const colorThemes = [
    { primary: "#0077B6", secondary: "#00B4D8", accent: "#F0F4F8" },
    { primary: "#F7B104", secondary: "#FEF3D7", accent: "#FEF9E7" },
    { primary: "#0fae37", secondary: "#e6f7eb", accent: "#F0F9F2" },
    { primary: "#9C27B0", secondary: "#f5e6f8", accent: "#F9F0FB" },
    { primary: "#d93025", secondary: "#fae9e8", accent: "#FDF5F4" },
    { primary: "#3F51B5", secondary: "#e8eaf6", accent: "#F5F6FB" },
  ]

  // Fetch user's games using server action
  useEffect(() => {
    const getGames = async () => {
      if (!user) return

      setGamesLoading(true)
      setGamesError(null)

      try {
        const { games: fetchedGames, error } = await fetchUserGames(user.id)

        if (error) {
          console.error("Error fetching games:", error)
          setGamesError(error)
        } else {
          setGames(fetchedGames)
        }
      } catch (error) {
        console.error("Error in getGames:", error)
        setGamesError(String(error))
      } finally {
        setGamesLoading(false)
      }
    }

    if (user) {
      getGames()
    }
  }, [user])

  // Mock activity data (we'll replace this with real data later)
  const activityData = [
    {
      userName: "Jack Roberts",
      userEmoji: "👨‍💼",
      time: "Mon Nov 25 at 3:53 PM ET",
      stockSymbol: "AAPL",
      stockName: "Apple Inc.",
      title: "I'm buying AAPL",
      sharesBought: 12,
      orderTotal: 2794.44,
      change: 1.36,
      marketCap: "$3.83T",
      revenue: "$391.04B",
      rationale: "I think Apple stock will sky rocket once they release the new iPhone",
    },
    {
      userName: "Miley Schmidt",
      userEmoji: "👩‍💼",
      time: "Mon Nov 25 at 3:21 PM ET",
      stockSymbol: "NVDA",
      stockName: "NVIDIA Corp",
      title: "I'm buying NVDA",
      sharesBought: 2.54,
      orderTotal: 2794.44,
      change: 4.91,
      marketCap: "$3.19T",
      revenue: "$35.08B",
      rationale: "The entire AI industry relies on NVIDIA to power their models",
    },
  ]

  // Calculate days left for a game
  const getDaysLeft = (endDate: string | null) => {
    if (!endDate) return 0

    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Handle game click - navigate to activity screen with game code
  const handleGameClick = (gameCode: string) => {
    router.push(`/activity?gameCode=${gameCode}`)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] items-center justify-center">
        <p className="text-gray-600">Please log in to continue</p>
        <button
          className="mt-4 px-4 py-2 bg-[#0077B6] text-white rounded-lg transition-transform duration-100 active:scale-95"
          onClick={() => router.push("/login")}
        >
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7]">
      {/* Header with blue gradient - Extended lower */}
      <div className="bg-gradient-to-r from-[#0077B6] to-[#00B4D8] p-5 pb-16 relative">
        <div className="flex justify-between items-center">
          {/* Profile Icon with Dropdown */}
          <div className="relative">
            <button
              className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              {profile?.profile_picture_url ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                  <img
                    src={profile.profile_picture_url || "/placeholder.svg"}
                    alt={profile.display_name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white border-2 border-white">
                  {profile?.first_name?.[0] || ""}
                  {profile?.last_name?.[0] || ""}
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <ProfileDropdownFixed user={user} profile={profile} onClose={() => setShowProfileDropdown(false)} />
            )}
          </div>

          <h1 className="text-white text-3xl font-bold tracking-wider">SIMVEST</h1>
          <button className="w-10 h-10 flex items-center justify-center">
            <Settings size={24} className="text-white" />
          </button>
        </div>

        {/* Welcome message */}
        {profile && (
          <div className="mt-2 text-white/90">
            <p>Welcome back, {profile.first_name}</p>
          </div>
        )}

        {/* Added decorative wave overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0,50 C150,150 350,0 500,50 L500,150 L0,150 Z" fill="#f7f7f7" opacity="0.2"></path>
          </svg>
        </div>
      </div>

      {/* Main Content - Moved up to overlap with the header gradient */}
      <div className="flex-1 px-4 pb-6 -mt-10 relative z-20">
        {/* YOUR GAMES section with white text */}
        <h2 className="text-white text-xl font-bold mb-3 ml-1">YOUR GAMES</h2>

        {/* Create New Game Button */}
        <button
          className="bg-white rounded-xl p-4 shadow-lg mb-4 flex items-center hover:shadow-xl transition-shadow border-2 border-[#0077B6] w-full"
          style={{ boxShadow: "0 4px 14px rgba(0, 119, 182, 0.25)" }}
          onClick={() => router.push("/create-game-options")}
        >
          <div className="w-14 h-14 rounded-full bg-[#F0F4F8] flex items-center justify-center mr-4">
            <Plus size={28} className="text-[#0077B6]" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-black">Create New Game</h3>
            <p className="text-gray-600">Invite friends to join</p>
          </div>
          <div className="ml-auto h-8 bg-[#F0F4F8] rounded-full w-32">
            <div className="w-full h-full bg-[url('/chart-line.png')] bg-no-repeat bg-center bg-contain opacity-30"></div>
          </div>
        </button>

        {/* Games List */}
        {gamesLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#0077B6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : gamesError ? (
          <div className="bg-white rounded-xl p-6 shadow-md mb-6 text-center">
            <p className="text-red-600 mb-4">Error loading games: {gamesError}</p>
            <button
              className="inline-block py-2 px-4 bg-[#0077B6] text-white rounded-lg font-medium transition-transform duration-100 active:scale-95"
              onClick={() => router.push("/create-game-options")}
            >
              Create Your First Game
            </button>
          </div>
        ) : games.length > 0 ? (
          <div className="space-y-4 mb-6">
            {games.slice(0, 4).map((game, index) => {
              const theme = colorThemes[game.color_theme || 0]
              const daysLeft = getDaysLeft(game.end_date)
              const isCreator = game.host_id === user?.id

              return (
                <button
                  key={game.id}
                  className={`bg-white rounded-xl p-4 flex items-center shadow-lg hover:shadow-xl transition-shadow border-2 w-full text-left`}
                  style={{
                    borderColor: theme.primary,
                    boxShadow: `0 4px 14px ${theme.primary}25`,
                  }}
                  onClick={() => handleGameClick(game.game_code)}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mr-4"
                    style={{ backgroundColor: theme.secondary }}
                  >
                    <span className="text-2xl" style={{ color: theme.primary }}>
                      {game.title.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl" style={{ color: theme.primary }}>
                      {game.title}
                    </h3>
                    <p className="text-gray-600">{isCreator ? "Created by you" : `Hosted by ${game.host_name}`}</p>
                  </div>
                  <div className="bg-gray-100 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700">
                    {daysLeft} days left
                  </div>
                </button>
              )
            })}

            {games.length > 4 && (
              <button
                className="w-full text-center py-2 text-[#0077B6] font-medium transition-transform duration-100 active:scale-95"
                onClick={() => router.push("/my-games")}
              >
                Show All Games ({games.length})
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-md mb-6 text-center">
            <p className="text-gray-600 mb-4">You haven't joined any games yet.</p>
            <button
              className="inline-block py-2 px-4 bg-[#0077B6] text-white rounded-lg font-medium transition-transform duration-100 active:scale-95"
              onClick={() => router.push("/create-game-options")}
            >
              Create Your First Game
            </button>
          </div>
        )}

        {/* Activity Section - Remove filter options */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-black text-xl font-bold">ACTIVITY</h2>
          <button className="flex items-center text-gray-600 transition-transform duration-100 active:scale-95">
            <span className="mr-1">Most Recent</span>
            <ChevronDown size={18} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {activityData.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}
        </div>

        {/* Your Watchlists */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3 ml-1">
            <h2 className="text-lg font-bold">Your Watchlists</h2>
            <button className="text-[#0052cc] text-sm font-medium transition-transform duration-100 active:scale-95">
              See All
            </button>
          </div>

          <div className="flex overflow-x-auto -mx-4 px-4 pb-4 scrollbar-hidden">
            <div className="flex space-x-3">
              <button className="bg-white rounded-xl p-4 shadow-md w-40 flex-shrink-0 hover:shadow-lg transition-shadow">
                <h4 className="font-bold mb-3">Tech Giants</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-[#000000] text-white text-xs px-2 py-1 rounded-full">AAPL</div>
                  <div className="bg-[#00a4ef] text-white text-xs px-2 py-1 rounded-full">MSFT</div>
                  <div className="bg-[#4285F4] text-white text-xs px-2 py-1 rounded-full">GOOG</div>
                  <div className="bg-[#0668E1] text-white text-xs px-2 py-1 rounded-full">META</div>
                </div>
              </button>

              <button className="bg-white rounded-xl p-4 shadow-md w-40 flex-shrink-0 hover:shadow-lg transition-shadow">
                <h4 className="font-bold mb-3">Crypto</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-[#ff9500] text-white text-xs px-2 py-1 rounded-full">BTC</div>
                  <div className="bg-[#627eea] text-white text-xs px-2 py-1 rounded-full">ETH</div>
                  <div className="bg-[#00ffbd] text-white text-xs px-2 py-1 rounded-full">SOL</div>
                </div>
              </button>

              <button className="bg-white rounded-xl p-4 shadow-md w-40 flex-shrink-0 hover:shadow-lg transition-shadow">
                <h4 className="font-bold mb-3">ETFs</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-[#d93025] text-white text-xs px-2 py-1 rounded-full">VOO</div>
                  <div className="bg-[#4831d4] text-white text-xs px-2 py-1 rounded-full">QQQ</div>
                  <div className="bg-[#00a79d] text-white text-xs px-2 py-1 rounded-full">ARKK</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Market News */}
        <div className="mb-20">
          <div className="flex justify-between items-center mb-3 ml-1">
            <h2 className="text-lg font-bold">Market News</h2>
            <button className="text-[#0052cc] text-sm font-medium transition-transform duration-100 active:scale-95">
              See All
            </button>
          </div>

          <div className="space-y-3">
            <button className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow w-full text-left">
              <div className="flex">
                <div className="flex-1 pr-3">
                  <h4 className="font-bold mb-1">Fed Signals Potential Rate Cut in December Meeting</h4>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                    The Federal Reserve has indicated it may consider cutting interest rates at its upcoming December
                    meeting...
                  </p>
                  <p className="text-xs text-gray-400">Bloomberg • 2 hours ago</p>
                </div>
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
              </div>
            </button>

            <button className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow w-full text-left">
              <div className="flex">
                <div className="flex-1 pr-3">
                  <h4 className="font-bold mb-1">NVIDIA Surges 7% After Beating Earnings Expectations</h4>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                    NVIDIA shares jumped after the company reported quarterly results that exceeded analyst
                    projections...
                  </p>
                  <p className="text-xs text-gray-400">CNBC • 5 hours ago</p>
                </div>
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
