"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import MobileContainer from "@/components/mobile-container"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

// Types for user profile and portfolio data
type UserProfile = {
  id: string
  username: string
  display_name: string
  email: string
  first_name?: string
  last_name?: string
  profile_picture_url: string | null
  created_at: string
}

type PortfolioHolding = {
  id: string
  stock_symbol: string
  shares_owned: number
  purchase_price: number
  purchase_date: string
  current_value: number
  game_id: string
}

type GameParticipation = {
  game_id: string
  game_title: string
  initial_balance: number
  current_balance: number
  total_return: number
  daily_return: number
  rank: number
  joined_at: string
}

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const username = params.username as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [games, setGames] = useState<GameParticipation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("portfolio")

  // Fetch user profile and portfolio data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      setError(null)

      try {
        const supabase = createClientSupabaseClient()

        // First try to fetch user profile
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single()

        if (userError) {
          console.error("User fetch error:", userError)
          // If user not found in database, create mock profile
          const mockProfile: UserProfile = {
            id: `mock-${username}`,
            username: username,
            display_name: username.charAt(0).toUpperCase() + username.slice(1),
            email: `${username}@example.com`,
            profile_picture_url: null,
            created_at: new Date().toISOString(),
          }
          setProfile(mockProfile)
          setLoading(false)
          return
        }

        setProfile(userData)

        // Fetch user's game participations
        const { data: participations, error: participationsError } = await supabase
          .from("game_participants")
          .select(`
            game_id,
            initial_balance,
            current_balance,
            total_return,
            daily_return,
            rank,
            joined_at,
            games(title)
          `)
          .eq("user_id", userData.id)

        if (!participationsError && participations) {
          // Format game participations
          const formattedGames = participations.map((p) => ({
            game_id: p.game_id,
            game_title: p.games?.title || "November 2024 Stock Challenge",
            initial_balance: p.initial_balance,
            current_balance: p.current_balance,
            total_return: p.total_return,
            daily_return: p.daily_return,
            rank: p.rank,
            joined_at: p.joined_at,
          }))

          setGames(formattedGames)

          // Fetch portfolio holdings for the most recent game
          if (participations.length > 0) {
            const mostRecentGame = participations.sort(
              (a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime(),
            )[0]

            const { data: portfolioData, error: portfolioError } = await supabase
              .from("user_portfolios")
              .select("*")
              .eq("user_id", userData.id)
              .eq("game_id", mostRecentGame.game_id)

            if (!portfolioError && portfolioData) {
              setHoldings(portfolioData)
            }
          }
        } else {
          // Create mock game participation for November 2024
          const mockGame: GameParticipation = {
            game_id: "november-2024",
            game_title: "November 2024 Stock Challenge",
            initial_balance: 100000,
            current_balance: 105000,
            total_return: 5.0,
            daily_return: 2.3,
            rank: Math.floor(Math.random() * 35) + 1,
            joined_at: new Date().toISOString(),
          }
          setGames([mockGame])

          // Create mock holdings
          const mockHoldings: PortfolioHolding[] = [
            {
              id: "1",
              stock_symbol: "NVDA",
              shares_owned: 10,
              purchase_price: 450.0,
              purchase_date: new Date().toISOString(),
              current_value: 4800.0,
              game_id: "november-2024",
            },
            {
              id: "2",
              stock_symbol: "AAPL",
              shares_owned: 25,
              purchase_price: 180.0,
              purchase_date: new Date().toISOString(),
              current_value: 4625.0,
              game_id: "november-2024",
            },
          ]
          setHoldings(mockHoldings)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to load profile data")

        // Create fallback mock profile
        const mockProfile: UserProfile = {
          id: `mock-${username}`,
          username: username,
          display_name: username.charAt(0).toUpperCase() + username.slice(1),
          email: `${username}@example.com`,
          profile_picture_url: null,
          created_at: new Date().toISOString(),
        }
        setProfile(mockProfile)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchUserData()
    }
  }, [username])

  // Handle stock click
  const handleStockClick = (symbol: string) => {
    router.push(`/challenge/stock/${symbol}`)
  }

  // Calculate portfolio metrics
  const calculatePortfolioMetrics = () => {
    if (!holdings || holdings.length === 0) {
      return {
        totalValue: games[0]?.current_balance || 100000,
        totalReturn: games[0]?.total_return || 0,
        totalReturnValue: (games[0]?.current_balance || 100000) - (games[0]?.initial_balance || 100000),
        todayReturn: games[0]?.daily_return || 0,
        todayReturnValue: ((games[0]?.current_balance || 100000) * (games[0]?.daily_return || 0)) / 100,
      }
    }

    const totalValue = holdings.reduce((sum, holding) => sum + (holding.current_value || 0), 0)
    const totalCost = holdings.reduce((sum, holding) => sum + holding.purchase_price * holding.shares_owned, 0)
    const totalReturn = ((totalValue - totalCost) / totalCost) * 100
    const totalReturnValue = totalValue - totalCost

    // Simulate today's return (random for demo)
    const todayReturn = Math.random() * 10 - 5 // -5% to +5%
    const todayReturnValue = totalValue * (todayReturn / 100)

    return {
      totalValue,
      totalReturn,
      totalReturnValue,
      todayReturn,
      todayReturnValue,
    }
  }

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex flex-col min-h-screen bg-[#f7f7f7] items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#f7b104] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </MobileContainer>
    )
  }

  if (error || !profile) {
    return (
      <MobileContainer>
        <div className="flex flex-col min-h-screen bg-[#f7f7f7] p-6 items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Profile Error</h1>
          <p className="text-gray-600 mb-6">{error || "Profile not found"}</p>
          <button
            className="bg-[#f7b104] text-white font-bold px-6 py-3 rounded-full transition-transform duration-100 active:scale-95"
            onClick={() => router.push("/activity")}
          >
            Return to Activity
          </button>
        </div>
      </MobileContainer>
    )
  }

  const portfolioMetrics = calculatePortfolioMetrics()
  const isCurrentUser = user?.id === profile.id

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-8">
          <div className="flex justify-between items-center mb-3">
            <button
              className="text-white p-2 transition-transform duration-100 active:scale-95"
              onClick={() => router.back()}
            >
              <ArrowLeft size={28} />
            </button>
            <div className="w-10"></div>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white border-2 border-white overflow-hidden mr-4">
              <img
                src={profile.profile_picture_url || "/placeholder.svg?height=80&width=80&query=user profile"}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">{profile.display_name}</h1>
              <p className="text-white opacity-90">@{profile.username}</p>
              <p className="text-white opacity-75 text-sm">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <p className="text-white mb-4">
            {profile.first_name && profile.last_name
              ? `${profile.first_name} ${profile.last_name} is an active trader focusing on technology and growth stocks.`
              : `${profile.display_name} is an active trader focusing on technology and growth stocks.`}
          </p>

          <div className="flex space-x-3">
            {!isCurrentUser && (
              <button className="bg-white text-[#b26f03] font-bold px-4 py-1.5 rounded-full shadow-md transition-transform duration-100 active:scale-95">
                Follow
              </button>
            )}
            <button className="bg-white/20 text-white font-bold px-4 py-1.5 rounded-full shadow-md transition-transform duration-100 active:scale-95">
              Message
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white px-4 py-3 flex border-b">
          <button
            className={`px-4 py-2 font-medium transition-transform duration-100 active:scale-95 ${
              activeTab === "portfolio" ? "text-[#f7b104] border-b-2 border-[#f7b104]" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("portfolio")}
          >
            Portfolio
          </button>
          <button
            className={`px-4 py-2 font-medium transition-transform duration-100 active:scale-95 ${
              activeTab === "activity" ? "text-[#f7b104] border-b-2 border-[#f7b104]" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("activity")}
          >
            Activity
          </button>
          <button
            className={`px-4 py-2 font-medium transition-transform duration-100 active:scale-95 ${
              activeTab === "about" ? "text-[#f7b104] border-b-2 border-[#f7b104]" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("about")}
          >
            About
          </button>
        </div>

        {/* Portfolio Tab Content */}
        {activeTab === "portfolio" && (
          <div className="p-4">
            {/* Portfolio Summary Card */}
            <div className="bg-white rounded-xl p-5 shadow-md mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Net Worth</p>
                  <p className="text-3xl font-bold">
                    ${portfolioMetrics.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                {games.length > 0 && (
                  <div className="bg-[#0fae37]/10 text-[#0fae37] px-3 py-1 rounded-md text-sm font-medium">
                    Rank #{games[0].rank}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-2">
                {/* Total Return */}
                <div>
                  <p className="text-gray-500 text-sm">Total Return</p>
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full ${portfolioMetrics.totalReturn >= 0 ? "bg-[#0fae37]" : "bg-[#d93025]"} flex items-center justify-center mr-1`}
                    >
                      <ArrowUpRight size={12} className="text-white" />
                    </div>
                    <p
                      className={`${portfolioMetrics.totalReturn >= 0 ? "text-[#0fae37]" : "text-[#d93025]"} font-bold text-lg`}
                    >
                      {portfolioMetrics.totalReturn >= 0 ? "+" : ""}
                      {portfolioMetrics.totalReturn.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {portfolioMetrics.totalReturnValue >= 0 ? "Up" : "Down"} $
                    {Math.abs(portfolioMetrics.totalReturnValue).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* Today's Return */}
                <div>
                  <p className="text-gray-500 text-sm">Today's Return</p>
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full ${portfolioMetrics.todayReturn >= 0 ? "bg-[#0fae37]" : "bg-[#d93025]"} flex items-center justify-center mr-1`}
                    >
                      <ArrowUpRight size={12} className="text-white" />
                    </div>
                    <p
                      className={`${portfolioMetrics.todayReturn >= 0 ? "text-[#0fae37]" : "text-[#d93025]"} font-bold text-lg`}
                    >
                      {portfolioMetrics.todayReturn >= 0 ? "+" : ""}
                      {portfolioMetrics.todayReturn.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {portfolioMetrics.todayReturnValue >= 0 ? "Up" : "Down"} $
                    {Math.abs(portfolioMetrics.todayReturnValue).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    today
                  </p>
                </div>
              </div>
            </div>

            {/* Holdings */}
            {holdings.length > 0 ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-bold">Holdings</h3>
                </div>
                {holdings.map((stock, index) => {
                  const currentPrice = stock.current_value / stock.shares_owned
                  const changePercent = ((currentPrice - stock.purchase_price) / stock.purchase_price) * 100

                  return (
                    <button
                      key={index}
                      className="w-full flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors text-left"
                      onClick={() => handleStockClick(stock.stock_symbol)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-xs">{stock.stock_symbol.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-bold">{stock.stock_symbol}</p>
                          <div className="flex text-gray-500 text-xs">
                            <span>{stock.shares_owned} shares</span>
                            <span className="mx-1">•</span>
                            <span>Bought {new Date(stock.purchase_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">${currentPrice.toFixed(2)}</p>
                        <p
                          className={`font-medium text-xs ${changePercent >= 0 ? "text-[#0fae37]" : "text-[#d93025]"}`}
                        >
                          {changePercent >= 0 ? "+" : ""}
                          {changePercent.toFixed(2)}%
                        </p>
                        <p className="text-gray-500 text-xs">
                          ${stock.current_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <p className="text-gray-500">No holdings found for this user.</p>
                {isCurrentUser && (
                  <button
                    className="mt-4 bg-[#f7b104] text-white font-bold px-4 py-2 rounded-lg inline-block transition-transform duration-100 active:scale-95"
                    onClick={() => router.push("/trade")}
                  >
                    Start Trading
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Activity Tab Content */}
        {activeTab === "activity" && (
          <div className="p-4">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📊</span>
              </div>
              <h4 className="font-bold text-gray-600 mb-2">No Activity Yet</h4>
              <p className="text-gray-500 text-sm">This user hasn't shared any trades or posts yet.</p>
            </div>
          </div>
        )}

        {/* About Tab Content */}
        {activeTab === "about" && (
          <div className="p-4">
            <div className="bg-white rounded-xl p-5 shadow-md mb-4">
              <h3 className="text-lg font-bold mb-3">About {profile.display_name}</h3>
              <p className="text-gray-700 mb-4">
                {profile.first_name && profile.last_name
                  ? `${profile.first_name} ${profile.last_name} is an active trader focusing on technology and growth stocks. With a keen eye for market trends and a disciplined approach to investing, ${profile.first_name} has built a diverse portfolio of high-performing assets.`
                  : `${profile.display_name} is an active trader focusing on technology and growth stocks. With a keen eye for market trends and a disciplined approach to investing, they have built a diverse portfolio of high-performing assets.`}
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm">Username</p>
                  <p className="font-medium">@{profile.username}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Member Since</p>
                  <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
                {games.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-sm">Current Rank</p>
                    <p className="font-medium">
                      #{games[0].rank} in {games[0].game_title}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileContainer>
  )
}
