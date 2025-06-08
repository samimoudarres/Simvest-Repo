"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, TrendingDown, DollarSign, Users, Plus, RefreshCw } from "lucide-react"
import MobileContainer from "@/components/mobile-container"
import BottomNavigation from "@/components/bottom-navigation"
import { useAuth } from "@/contexts/auth-context"
import { tradingService, type UserBalance } from "@/lib/trading-service"
import { getActivityPosts } from "@/lib/social-interactions"
import ActivityCardEnhanced from "@/components/home/activity-card-enhanced"
import CreatePostEnhanced from "@/components/social/create-post-enhanced"

// Mock data for trending stocks
const trendingStocks = [
  { symbol: "AAPL", price: 189.95, change: 2.45, changePercent: 1.31 },
  { symbol: "MSFT", price: 378.85, change: -1.23, changePercent: -0.32 },
  { symbol: "GOOGL", price: 138.21, change: 4.67, changePercent: 3.49 },
  { symbol: "AMZN", price: 145.86, change: -0.89, changePercent: -0.61 },
  { symbol: "TSLA", price: 248.5, change: 12.34, changePercent: 5.22 },
  { symbol: "NVDA", price: 875.28, change: 15.67, changePercent: 1.82 },
]

const gameStats = {
  totalPlayers: 1247,
  activeGames: 23,
  totalVolume: 2847392,
}

// Loading skeleton components
const PostSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 shadow-md mb-4 animate-pulse">
    <div className="flex items-start space-x-3 mb-3">
      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
    <div className="bg-gray-100 rounded-xl p-4 mb-3">
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
    <div className="flex justify-between pt-3 border-t">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
      <div className="h-6 bg-gray-200 rounded w-20"></div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
)

const BalanceSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 shadow-md animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-40 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-24"></div>
  </div>
)

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()

  // State management
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null)
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    todayReturn: 0,
  })
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState({
    balance: true,
    portfolio: true,
    posts: true,
  })
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user balance
  const loadUserBalance = async () => {
    if (!user) return

    try {
      const balance = await tradingService.getUserBalance(user.id)
      setUserBalance(balance)
      console.log("✅ User balance loaded:", balance)
    } catch (error) {
      console.error("❌ Error loading balance:", error)
      setError("Failed to load balance")
    } finally {
      setLoading((prev) => ({ ...prev, balance: false }))
    }
  }

  // Load portfolio stats
  const loadPortfolioStats = async () => {
    if (!user) return

    try {
      const stats = await tradingService.calculatePortfolioValue(user.id)
      setPortfolioStats(stats)
      console.log("✅ Portfolio stats loaded:", stats)
    } catch (error) {
      console.error("❌ Error loading portfolio stats:", error)
    } finally {
      setLoading((prev) => ({ ...prev, portfolio: false }))
    }
  }

  // Load social posts
  const loadPosts = async () => {
    if (!user) return

    try {
      const { success, posts: fetchedPosts, error } = await getActivityPosts("november-2024", user.id)

      if (success && fetchedPosts) {
        setPosts(fetchedPosts)
        console.log("✅ Posts loaded:", fetchedPosts.length)
      } else {
        console.error("❌ Error loading posts:", error)
        setError(error || "Failed to load posts")
      }
    } catch (error) {
      console.error("❌ Error loading posts:", error)
      setError("Failed to load posts")
    } finally {
      setLoading((prev) => ({ ...prev, posts: false }))
    }
  }

  // Initial data loading
  useEffect(() => {
    if (user) {
      loadUserBalance()
      loadPortfolioStats()
      loadPosts()
    }
  }, [user])

  // Refresh all data
  const handleRefresh = async () => {
    if (!user || refreshing) return

    setRefreshing(true)
    setError(null)

    try {
      await Promise.all([loadUserBalance(), loadPortfolioStats(), loadPosts()])
      console.log("✅ All data refreshed")
    } catch (error) {
      console.error("❌ Error refreshing data:", error)
      setError("Failed to refresh data")
    } finally {
      setRefreshing(false)
    }
  }

  if (!user) {
    return (
      <MobileContainer>
        <div className="flex flex-col h-full bg-[#f7f7f7]">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#f7b104] rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Stock Trading</h2>
              <p className="text-gray-600 mb-6">Please log in to start trading and connect with other traders</p>
              <button
                onClick={() => router.push("/auth")}
                className="bg-[#f7b104] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#e6a004] transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
          <BottomNavigation />
        </div>
      </MobileContainer>
    )
  }

  return (
    <div className="flex flex-col min-h-[100vh] bg-[#f7f7f7]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-8 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-white text-2xl font-bold">Good morning!</h1>
            <p className="text-white/80 text-sm">
              {user.user_metadata?.full_name || user.email?.split("@")[0] || "Trader"}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <RefreshCw size={24} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Portfolio Summary */}
        {loading.balance || loading.portfolio ? (
          <BalanceSkeleton />
        ) : userBalance ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/80 text-sm">Portfolio Value</p>
                <p className="text-white text-xl font-bold">
                  $
                  {(userBalance.cash_balance + portfolioStats.totalValue).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <div className="flex items-center mt-1">
                  {portfolioStats.todayReturn >= 0 ? (
                    <TrendingUp size={14} className="text-green-300 mr-1" />
                  ) : (
                    <TrendingDown size={14} className="text-red-300 mr-1" />
                  )}
                  <span className={`text-sm ${portfolioStats.todayReturn >= 0 ? "text-green-300" : "text-red-300"}`}>
                    {portfolioStats.todayReturn >= 0 ? "+" : ""}${portfolioStats.todayReturn.toFixed(2)} today
                  </span>
                </div>
              </div>
              <div>
                <p className="text-white/80 text-sm">Buying Power</p>
                <p className="text-white text-xl font-bold">
                  $
                  {userBalance.cash_balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <div className="flex items-center mt-1">
                  <DollarSign size={14} className="text-white/60 mr-1" />
                  <span className="text-white/60 text-sm">Available to trade</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-20">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => router.push("/trade")}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center"
            >
              <Plus size={20} className="text-[#f7b104] mr-2" />
              <span className="font-medium">Trade</span>
            </button>
            <button
              onClick={() => router.push("/challenge")}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center"
            >
              <Users size={20} className="text-[#f7b104] mr-2" />
              <span className="font-medium">Challenges</span>
            </button>
          </div>

          {/* Trending Stocks */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Trending Stocks</h3>
              <button
                onClick={() => router.push("/explore")}
                className="text-[#f7b104] text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>
            <div className="flex overflow-x-auto -mx-4 px-4 pb-4 scrollbar-hidden">
              <div className="flex space-x-3">
                {trendingStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => router.push(`/stock/${stock.symbol}`)}
                    className="bg-white rounded-xl p-4 shadow-md w-32 flex-shrink-0 hover:shadow-lg transition-all active:scale-95"
                  >
                    <div className="text-center">
                      <p className="font-bold text-lg">{stock.symbol}</p>
                      <p className="text-gray-600 text-sm">${stock.price}</p>
                      <div className="flex items-center justify-center mt-1">
                        {stock.change >= 0 ? (
                          <TrendingUp size={12} className="text-green-500 mr-1" />
                        ) : (
                          <TrendingDown size={12} className="text-red-500 mr-1" />
                        )}
                        <span className={`text-xs ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {stock.changePercent >= 0 ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Post Creation */}
          <div className="mb-6">
            <CreatePostEnhanced
              gameId="november-2024"
              onPostCreated={() => loadPosts()}
              placeholder="Share your trading insights..."
            />
          </div>

          {/* Activity Feed */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Community Activity</h3>
              <button
                onClick={() => router.push("/challenge/activity?gameCode=112024")}
                className="text-[#f7b104] text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>

            <Suspense
              fallback={
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
              }
            >
              {loading.posts ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="bg-white rounded-2xl p-8 shadow-md text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-500 text-2xl">⚠️</span>
                  </div>
                  <h4 className="font-bold text-gray-600 mb-2">Error Loading Feed</h4>
                  <p className="text-gray-500 text-sm mb-4">{error}</p>
                  <button
                    onClick={() => loadPosts()}
                    className="bg-[#f7b104] text-white px-4 py-2 rounded-lg hover:bg-[#e6a004] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : posts.length > 0 ? (
                posts
                  .slice(0, 5)
                  .map((post) => <ActivityCardEnhanced key={post.id} post={post} onUpdate={() => loadPosts()} />)
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-md text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-2xl">📊</span>
                  </div>
                  <h4 className="font-bold text-gray-600 mb-2">No Activity Yet</h4>
                  <p className="text-gray-500 text-sm">Be the first to share your trading insights!</p>
                </div>
              )}
            </Suspense>
          </div>

          {/* Platform Stats */}
          <div className="bg-white rounded-2xl p-5 shadow-md">
            <h3 className="font-bold text-lg mb-4">Platform Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#f7b104]">{gameStats.totalPlayers.toLocaleString()}</p>
                <p className="text-gray-600 text-sm">Total Players</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#f7b104]">{gameStats.activeGames}</p>
                <p className="text-gray-600 text-sm">Active Games</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#f7b104]">${(gameStats.totalVolume / 1000000).toFixed(1)}M</p>
                <p className="text-gray-600 text-sm">Volume Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
