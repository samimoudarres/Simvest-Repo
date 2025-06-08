"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, Search } from "lucide-react"
import BottomNavigation from "@/components/bottom-navigation"
import { createClientSupabaseClient } from "@/lib/supabase"

type LeaderboardEntry = {
  id: string
  rank: number
  user_id: string
  username: string
  display_name: string
  profile_picture_url: string | null
  total_return: number
  current_balance: number
  initial_balance: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const sortOptions = [
    { id: "rank", label: "Rank" },
    { id: "totalReturn", label: "Total Return" },
    { id: "todayReturn", label: "Today's Return" },
    { id: "portfolioValue", label: "Portfolio Value" },
  ]

  // Handle back button - return to original home screen
  const handleBack = () => {
    router.push("/")
  }

  // Fetch leaderboard data from Supabase with timeout
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true)
      setError(null)

      // Set a timeout for the query
      const timeoutId = setTimeout(() => {
        setError("Loading is taking longer than expected...")
      }, 5000)

      try {
        const supabase = createClientSupabaseClient()

        // Optimized query with timeout
        const { data, error: queryError } = (await Promise.race([
          supabase
            .from("game_participants")
            .select(`
              id,
              rank,
              user_id,
              total_return,
              current_balance,
              initial_balance,
              users!inner (
                username,
                display_name,
                profile_picture_url
              )
            `)
            .order("rank", { ascending: true })
            .limit(50),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Query timeout")), 10000)),
        ])) as [any, never]

        clearTimeout(timeoutId)

        if (queryError) {
          console.error("Error fetching leaderboard:", queryError)
          throw queryError
        }

        // Format the data
        const formattedData: LeaderboardEntry[] =
          data?.map((entry: any, index: number) => ({
            id: entry.id,
            rank: entry.rank || index + 1,
            user_id: entry.user_id,
            username: entry.users?.username || "unknown",
            display_name: entry.users?.display_name || "Unknown User",
            profile_picture_url: entry.users?.profile_picture_url,
            total_return: entry.total_return || 0,
            current_balance: entry.current_balance || 100000,
            initial_balance: entry.initial_balance || 100000,
          })) || []

        setLeaderboardData(formattedData)
      } catch (error) {
        console.error("Error fetching leaderboard data:", error)
        clearTimeout(timeoutId)

        // Use mock data as fallback
        const mockData: LeaderboardEntry[] = [
          {
            id: "1",
            rank: 1,
            user_id: "user1",
            username: "johnsmith",
            display_name: "John Smith",
            profile_picture_url: "/thoughtful-man-glasses.png",
            total_return: 24.31,
            current_balance: 124310,
            initial_balance: 100000,
          },
          {
            id: "2",
            rank: 2,
            user_id: "user2",
            username: "sarahjohnson",
            display_name: "Sarah Johnson",
            profile_picture_url: "/diverse-woman-portrait.png",
            total_return: 18.45,
            current_balance: 118450,
            initial_balance: 100000,
          },
          {
            id: "3",
            rank: 3,
            user_id: "user3",
            username: "mikechen",
            display_name: "Mike Chen",
            profile_picture_url: "/young-man-contemplative.png",
            total_return: 15.67,
            current_balance: 115670,
            initial_balance: 100000,
          },
          {
            id: "4",
            rank: 4,
            user_id: "user4",
            username: "emilydavis",
            display_name: "Emily Davis",
            profile_picture_url: "/woman-brown-hair.png",
            total_return: 12.34,
            current_balance: 112340,
            initial_balance: 100000,
          },
          {
            id: "5",
            rank: 5,
            user_id: "user5",
            username: "alexwilson",
            display_name: "Alex Wilson",
            profile_picture_url: "/asian-man-glasses.png",
            total_return: 9.87,
            current_balance: 109870,
            initial_balance: 100000,
          },
        ]
        setLeaderboardData(mockData)
        setError("Using demo data - database connection failed")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboardData()
  }, [])

  // Filter the leaderboard data
  const getFilteredData = () => {
    let filtered = leaderboardData

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (entry) =>
          entry.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (filter) {
        case "totalReturn":
          return sortDirection === "desc" ? b.total_return - a.total_return : a.total_return - b.total_return
        case "todayReturn":
          // Mock today's return calculation
          const aTodayReturn = a.total_return * 0.1 * (Math.random() - 0.5)
          const bTodayReturn = b.total_return * 0.1 * (Math.random() - 0.5)
          return sortDirection === "desc" ? bTodayReturn - aTodayReturn : aTodayReturn - bTodayReturn
        case "portfolioValue":
          return sortDirection === "desc"
            ? b.current_balance - a.current_balance
            : a.current_balance - b.current_balance
        default:
          return sortDirection === "desc" ? a.rank - b.rank : b.rank - a.rank
      }
    })

    // Apply category filter
    switch (filter) {
      case "friends":
        return filtered.slice(0, 5)
      case "following":
        return filtered.slice(0, 8)
      default:
        return filtered
    }
  }

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
      {/* Header */}
      <div className="bg-[#f7b104] p-4 pb-5">
        <div className="flex justify-between items-center">
          <button className="text-white p-2 transition-transform duration-100 active:scale-95" onClick={handleBack}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white text-xl font-bold">Leaderboard</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
          <Search size={18} className="text-gray-500 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-sm min-w-0"
          />
        </div>

        <div className="relative">
          <button
            className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2 w-full transition-transform duration-100 active:scale-95"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="text-sm font-medium truncate">
              {filter === "all" ? "All Players" : filter === "friends" ? "Friends Only" : "Following"}
            </span>
            <ChevronDown
              size={18}
              className={`text-gray-500 transition-transform ml-2 flex-shrink-0 ${showFilters ? "rotate-180" : ""}`}
            />
          </button>

          {showFilters && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-lg z-10">
              <button
                className={`w-full text-left p-3 transition-transform duration-100 active:scale-95 ${filter === "all" ? "bg-gray-100" : ""}`}
                onClick={() => {
                  setFilter("all")
                  setShowFilters(false)
                }}
              >
                All Players
              </button>
              <button
                className={`w-full text-left p-3 transition-transform duration-100 active:scale-95 ${filter === "friends" ? "bg-gray-100" : ""}`}
                onClick={() => {
                  setFilter("friends")
                  setShowFilters(false)
                }}
              >
                Friends Only
              </button>
              <button
                className={`w-full text-left p-3 transition-transform duration-100 active:scale-95 ${filter === "following" ? "bg-gray-100" : ""}`}
                onClick={() => {
                  setFilter("following")
                  setShowFilters(false)
                }}
              >
                Following
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#f7b104] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 p-3 border-b text-sm font-medium text-gray-500">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-7">Player</div>
              <div className="col-span-4 text-right">Return</div>
            </div>

            {getFilteredData().map((entry, index) => (
              <button
                key={entry.id}
                onClick={() => handleUserClick(entry.username)}
                className={`w-full grid grid-cols-12 p-3 border-b last:border-b-0 items-center transition-all duration-200 active:scale-[0.98] hover:bg-gray-50 ${
                  index < 3 ? "bg-yellow-50" : ""
                }`}
              >
                <div className="col-span-1 text-center font-bold">
                  <div
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      index === 0
                        ? "bg-yellow-400 text-white"
                        : index === 1
                          ? "bg-gray-300 text-gray-800"
                          : index === 2
                            ? "bg-amber-700 text-white"
                            : "text-gray-700"
                    }`}
                  >
                    {entry.rank}
                  </div>
                </div>
                <div className="col-span-7 flex items-center text-left min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden flex-shrink-0">
                    {entry.profile_picture_url ? (
                      <img
                        src={entry.profile_picture_url || "/placeholder.svg"}
                        alt={entry.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white">
                        {entry.display_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{entry.display_name}</p>
                    <p className="text-gray-500 text-xs truncate">@{entry.username}</p>
                  </div>
                </div>
                <div className="col-span-4 text-right">
                  <p className={`font-bold ${entry.total_return >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {entry.total_return >= 0 ? "+" : ""}
                    {entry.total_return.toFixed(2)}%
                  </p>
                  <p className="text-gray-500 text-xs">
                    ${entry.current_balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </button>
            ))}

            {getFilteredData().length === 0 && !loading && (
              <div className="p-8 text-center">
                <h4 className="font-bold text-gray-600 mb-2">No Results Found</h4>
                <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation - Always visible */}
      <BottomNavigation />
    </div>
  )
}
