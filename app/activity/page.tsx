"use client"

import { Suspense, useState, useEffect, useMemo, useCallback } from "react"
import {
  DollarSign,
  ChevronDown,
  ImageIcon,
  VoteIcon as Poll,
  Send,
  ArrowLeft,
  Search,
  Heart,
  MessageSquare,
  Share,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import MobileContainer from "@/components/mobile-container"
import BottomNavigation from "@/components/bottom-navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import {
  getGamePosts,
  addComment,
  likePost,
  subscribeToGamePosts,
  type Post,
  type Comment,
} from "@/lib/social-enhanced"

// Types for real data
type GameContext = {
  id: string
  title: string
  game_code: string
  host_name: string
  current_players: number
}

type PlayerGain = {
  id: string
  username: string
  display_name: string
  profile_picture_url: string | null
  total_return: number
  daily_return: number
  rank: number
}

// Skeleton components for loading states
const PlayerGainSkeleton = () => (
  <div className="bg-white rounded-xl p-4 shadow-md w-28 flex-shrink-0 animate-pulse">
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 rounded-full bg-gray-200 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-12"></div>
    </div>
  </div>
)

const ActivitySkeleton = () => (
  <div className="bg-white rounded-2xl p-4 shadow-md mb-4 animate-pulse">
    <div className="flex mb-3">
      <div className="w-12 h-12 rounded-full bg-gray-200 mr-3"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="h-20 bg-gray-200 rounded mb-3"></div>
    <div className="flex justify-between">
      <div className="h-8 bg-gray-200 rounded w-16"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
)

// Comment Modal Component
const CommentModal = ({
  post,
  isOpen,
  onClose,
  onAddComment,
}: {
  post: Post | null
  isOpen: boolean
  onClose: () => void
  onAddComment: (postId: string, content: string) => void
}) => {
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const { user } = useAuth()

  const handleSubmit = () => {
    if (commentText.trim() && post) {
      onAddComment(post.id, commentText.trim())
      setCommentText("")
    }
  }

  if (!isOpen || !post) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-2xl w-full max-w-[430px] max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Comments</h3>
          <button onClick={onClose} className="text-gray-500 text-xl transition-transform duration-100 active:scale-95">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex-shrink-0">
                  {comment.users?.profile_picture_url ? (
                    <img
                      src={comment.users.profile_picture_url || "/placeholder.svg"}
                      alt={comment.users.display_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-xs">
                      {comment.users?.display_name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{comment.users?.display_name || "Unknown User"}</p>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                  <p className="text-gray-500 text-xs mt-1">{new Date(comment.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url || "/placeholder.svg"}
                  alt="Your profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-xs">
                  {user?.user_metadata?.display_name?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#f7b104]"
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={!commentText.trim()}
              className="bg-[#f7b104] text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-100 active:scale-95"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ActivityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // State management
  const [gameContext, setGameContext] = useState<GameContext | null>(null)
  const [topPlayers, setTopPlayers] = useState<PlayerGain[]>([])
  const [activityPosts, setActivityPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [playersLoading, setPlayersLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showCommentModal, setShowCommentModal] = useState(false)

  // Get game code
  const gameCode = useMemo(() => {
    return searchParams.get("gameCode") || "112024"
  }, [searchParams])

  // Fetch game context from Supabase
  const fetchGameContext = useCallback(async () => {
    try {
      const supabase = createClientSupabaseClient()

      if (gameCode === "112024") {
        // Default November 2024 challenge
        setGameContext({
          id: "november-2024",
          title: "Nov. 2024 Stock Challenge",
          game_code: "112024",
          host_name: "John Smith",
          current_players: 35,
        })
        return
      }

      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select(`
          id, title, game_code, current_players,
          users:host_id (display_name)
        `)
        .eq("game_code", gameCode)
        .single()

      if (gameError || !gameData) {
        throw new Error("Game not found")
      }

      setGameContext({
        id: gameData.id,
        title: gameData.title,
        game_code: gameData.game_code,
        host_name: gameData.users?.display_name || "Unknown Host",
        current_players: gameData.current_players || 1,
      })
    } catch (err) {
      console.error("Error fetching game context:", err)
      setError("Failed to load game data")
      // Fallback to November 2024
      setGameContext({
        id: "november-2024",
        title: "Nov. 2024 Stock Challenge",
        game_code: "112024",
        host_name: "John Smith",
        current_players: 35,
      })
    }
  }, [gameCode])

  // Fetch top performing players from Supabase
  const fetchTopPlayers = useCallback(async () => {
    setPlayersLoading(true)
    try {
      // For November 2024, use mock data with 35 players
      if (gameCode === "112024" || !gameContext || gameContext.id === "november-2024") {
        const mockPlayers: PlayerGain[] = [
          {
            id: "1",
            username: "johnsmith",
            display_name: "John Smith",
            profile_picture_url: "/thoughtful-man-glasses.png",
            total_return: 24.31,
            daily_return: 7.91,
            rank: 1,
          },
          {
            id: "2",
            username: "sarahjohnson",
            display_name: "Sarah Johnson",
            profile_picture_url: "/diverse-woman-portrait.png",
            total_return: 18.45,
            daily_return: 5.23,
            rank: 2,
          },
          {
            id: "3",
            username: "mikechen",
            display_name: "Mike Chen",
            profile_picture_url: "/young-man-contemplative.png",
            total_return: 15.67,
            daily_return: 4.12,
            rank: 3,
          },
          {
            id: "4",
            username: "emilydavis",
            display_name: "Emily Davis",
            profile_picture_url: "/woman-brown-hair.png",
            total_return: 12.89,
            daily_return: 3.45,
            rank: 4,
          },
          {
            id: "5",
            username: "alexwilson",
            display_name: "Alex Wilson",
            profile_picture_url: "/asian-man-glasses.png",
            total_return: 10.23,
            daily_return: 2.87,
            rank: 5,
          },
        ]
        setTopPlayers(mockPlayers)
        setPlayersLoading(false)
        return
      }

      const supabase = createClientSupabaseClient()

      const { data: playersData, error: playersError } = await supabase
        .from("game_participants")
        .select(`
        user_id,
        total_return,
        daily_return,
        rank,
        users (
          username,
          display_name,
          profile_picture_url
        )
      `)
        .eq("game_id", gameContext.id)
        .order("daily_return", { ascending: false })
        .limit(5)

      if (playersError) {
        console.error("Error fetching players:", playersError)
        // Use mock data as fallback
        setTopPlayers([
          {
            id: "1",
            username: "johnsmith",
            display_name: "John Smith",
            profile_picture_url: "/thoughtful-man-glasses.png",
            total_return: 24.31,
            daily_return: 7.91,
            rank: 1,
          },
          {
            id: "2",
            username: "sarahjohnson",
            display_name: "Sarah Johnson",
            profile_picture_url: "/diverse-woman-portrait.png",
            total_return: 18.45,
            daily_return: 5.23,
            rank: 2,
          },
        ])
        setPlayersLoading(false)
        return
      }

      const formattedPlayers = playersData.map((player) => ({
        id: player.user_id,
        username: player.users?.username || "unknown",
        display_name: player.users?.display_name || "Unknown Player",
        profile_picture_url: player.users?.profile_picture_url,
        total_return: player.total_return,
        daily_return: player.daily_return,
        rank: player.rank,
      }))

      setTopPlayers(formattedPlayers)
    } catch (err) {
      console.error("Error fetching top players:", err)
      // Use mock data as fallback
      setTopPlayers([
        {
          id: "1",
          username: "johnsmith",
          display_name: "John Smith",
          profile_picture_url: "/thoughtful-man-glasses.png",
          total_return: 24.31,
          daily_return: 7.91,
          rank: 1,
        },
      ])
    } finally {
      setPlayersLoading(false)
    }
  }, [gameContext, gameCode])

  // Fetch activity posts from Supabase with enhanced social features
  const fetchActivityPosts = useCallback(async () => {
    setPostsLoading(true)
    try {
      // For November 2024, use mock data
      if (gameCode === "112024" || !gameContext || gameContext.id === "november-2024") {
        const mockPosts: Post[] = [
          {
            id: "1",
            user_id: "user1",
            game_id: "november-2024",
            content: "Just bought 10 shares of NVDA! Bullish on AI growth 🚀",
            stock_symbol: "NVDA",
            trade_type: "buy",
            created_at: new Date().toISOString(),
            likes_count: 12,
            comments_count: 3,
            users: {
              username: "johnsmith",
              display_name: "John Smith",
              profile_picture_url: "/thoughtful-man-glasses.png",
            },
          },
          {
            id: "2",
            user_id: "user2",
            game_id: "november-2024",
            content: "Market looking strong today! Time to make some moves 📈",
            stock_symbol: null,
            trade_type: null,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            likes_count: 8,
            comments_count: 5,
            users: {
              username: "sarahjohnson",
              display_name: "Sarah Johnson",
              profile_picture_url: "/diverse-woman-portrait.png",
            },
          },
          {
            id: "3",
            user_id: "user3",
            game_id: "november-2024",
            content: "Sold my TSLA position for a nice profit. Thanks for the tip @sarahjohnson!",
            stock_symbol: "TSLA",
            trade_type: "sell",
            created_at: new Date(Date.now() - 7200000).toISOString(),
            likes_count: 15,
            comments_count: 7,
            users: {
              username: "mikechen",
              display_name: "Mike Chen",
              profile_picture_url: "/young-man-contemplative.png",
            },
          },
        ]
        setActivityPosts(mockPosts)
        setPostsLoading(false)
        return
      }

      // Use enhanced social features for real games
      const { posts, error: postsError } = await getGamePosts(gameContext.id)

      if (postsError) {
        console.error("Error fetching posts:", postsError)
        // Use mock data as fallback
        setActivityPosts([
          {
            id: "1",
            user_id: "user1",
            game_id: gameContext.id,
            content: "Just bought 10 shares of NVDA! Bullish on AI growth 🚀",
            stock_symbol: "NVDA",
            trade_type: "buy",
            created_at: new Date().toISOString(),
            likes_count: 12,
            comments_count: 3,
            users: {
              username: "johnsmith",
              display_name: "John Smith",
              profile_picture_url: "/thoughtful-man-glasses.png",
            },
          },
        ])
        setPostsLoading(false)
        return
      }

      setActivityPosts(posts)
    } catch (err) {
      console.error("Error fetching activity posts:", err)
      // Use mock data as fallback
      setActivityPosts([
        {
          id: "1",
          user_id: "user1",
          game_id: gameContext?.id || "november-2024",
          content: "Just bought 10 shares of NVDA! Bullish on AI growth 🚀",
          stock_symbol: "NVDA",
          trade_type: "buy",
          created_at: new Date().toISOString(),
          likes_count: 12,
          comments_count: 3,
          users: {
            username: "johnsmith",
            display_name: "John Smith",
            profile_picture_url: "/thoughtful-man-glasses.png",
          },
        },
      ])
    } finally {
      setPostsLoading(false)
    }
  }, [gameContext, gameCode])

  // Handle search functionality
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return

      // For November 2024, filter mock data
      if (gameCode === "112024" || !gameContext || gameContext.id === "november-2024") {
        const mockPosts: Post[] = [
          {
            id: "1",
            user_id: "user1",
            game_id: "november-2024",
            content: "Just bought 10 shares of NVDA! Bullish on AI growth 🚀",
            stock_symbol: "NVDA",
            trade_type: "buy",
            created_at: new Date().toISOString(),
            likes_count: 12,
            comments_count: 3,
            users: {
              username: "johnsmith",
              display_name: "John Smith",
              profile_picture_url: "/thoughtful-man-glasses.png",
            },
          },
          {
            id: "2",
            user_id: "user2",
            game_id: "november-2024",
            content: "Market looking strong today! Time to make some moves 📈",
            stock_symbol: null,
            trade_type: null,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            likes_count: 8,
            comments_count: 5,
            users: {
              username: "sarahjohnson",
              display_name: "Sarah Johnson",
              profile_picture_url: "/diverse-woman-portrait.png",
            },
          },
        ]

        const filteredPosts = mockPosts.filter(
          (post) =>
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            post.users?.display_name.toLowerCase().includes(query.toLowerCase()) ||
            (post.stock_symbol && post.stock_symbol.toLowerCase().includes(query.toLowerCase())),
        )

        setActivityPosts(filteredPosts)
        return
      }

      try {
        const supabase = createClientSupabaseClient()

        // Search in posts and users
        const { data: searchResults, error: searchError } = await supabase
          .from("user_posts")
          .select(`
          id,
          user_id,
          game_id,
          content,
          stock_symbol,
          trade_type,
          created_at,
          likes_count,
          comments_count,
          users (
            username,
            display_name,
            profile_picture_url
          )
        `)
          .eq("game_id", gameContext.id)
          .or(`content.ilike.%${query}%,stock_symbol.ilike.%${query}%`)
          .order("created_at", { ascending: false })
          .limit(10)

        if (searchError) {
          console.error("Search error:", searchError)
          return
        }

        setActivityPosts(searchResults || [])
      } catch (err) {
        console.error("Search error:", err)
      }
    },
    [gameContext, gameCode],
  )

  // Handle like post
  const handleLikePost = async (postId: string) => {
    if (!user) return

    try {
      await likePost(user.id, postId)
      // Refresh posts to show updated like count
      fetchActivityPosts()
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  // Handle add comment
  const handleAddComment = async (postId: string, content: string) => {
    if (!user) return

    try {
      await addComment(user.id, postId, content)
      // Refresh posts to show updated comment count
      fetchActivityPosts()
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  // Handle comment modal
  const handleOpenComments = (post: Post) => {
    setSelectedPost(post)
    setShowCommentModal(true)
  }

  // Auto-join user to game
  const autoJoinGame = useCallback(async () => {
    if (!user || !gameContext || gameCode === "112024") return

    try {
      const supabase = createClientSupabaseClient()

      const { data: existing } = await supabase
        .from("game_participants")
        .select("id")
        .eq("game_id", gameContext.id)
        .eq("user_id", user.id)
        .maybeSingle()

      if (existing) return

      await supabase.from("game_participants").insert({
        game_id: gameContext.id,
        user_id: user.id,
        joined_at: new Date().toISOString(),
        initial_balance: 100000,
        current_balance: 100000,
        total_return: 0,
        daily_return: 0,
        rank: gameContext.current_players + 1,
      })

      console.log("✅ Auto-joined game successfully")
    } catch (err) {
      console.error("Error auto-joining game:", err)
    }
  }, [user, gameContext, gameCode])

  // Set up real-time subscriptions
  useEffect(() => {
    // Skip subscriptions for November 2024 mock data
    if (gameCode === "112024" || !gameContext?.id || gameContext.id === "november-2024") return

    const postsSubscription = subscribeToGamePosts(gameContext.id, (posts) => {
      setActivityPosts(posts)
    })

    return () => {
      postsSubscription.unsubscribe()
    }
  }, [gameContext?.id, gameCode])

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchGameContext()
      setLoading(false)
    }
    loadData()
  }, [fetchGameContext])

  useEffect(() => {
    if (gameContext) {
      fetchTopPlayers()
      fetchActivityPosts()
      if (user) {
        autoJoinGame()
      }
    }
  }, [gameContext, fetchTopPlayers, fetchActivityPosts, user, autoJoinGame])

  // Handle back button - return to original home screen
  const handleBack = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
          <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-16">
            <h1 className="text-white text-center text-3xl font-bold">Loading...</h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#f7b104] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <BottomNavigation />
        </div>
      </MobileContainer>
    )
  }

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen bg-[#f7f7f7] pb-20">
        {/* Scrollable Header - Yellow box that moves with content */}
        <div className="bg-gradient-to-b from-[#f7b104] to-[#b26f03] p-5 pb-8">
          <div className="flex justify-between items-center mb-3">
            <button className="text-white p-2 transition-transform duration-100 active:scale-95" onClick={handleBack}>
              <ArrowLeft size={28} />
            </button>
            <div className="w-10"></div>
          </div>

          <h1 className="text-white text-center text-3xl font-bold mb-2">
            {gameContext?.title || "Nov. 2024 Stock Challenge"}
          </h1>
          <h2 className="text-white text-center text-lg font-medium mb-4">
            Hosted by {gameContext?.host_name || "John Smith"}
          </h2>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
                  >
                    <span className="text-sm">👤</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="bg-white text-[#b26f03] font-bold px-4 py-1.5 rounded-full shadow-md transition-transform duration-100 active:scale-95">
              + Invite
            </button>
          </div>

          <button
            className="text-white text-sm mb-4 truncate hover:underline transition-transform duration-100 active:scale-95"
            onClick={() => router.push(`/players?gameCode=${gameContext?.game_code || "112024"}`)}
          >
            {gameContext?.current_players || 35} players • Game Code: {gameContext?.game_code || "112024"}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 -mt-5 relative z-10">
          {/* Search Bar - Functional */}
          <div className="bg-white rounded-xl p-4 shadow-md mb-6">
            <div className="relative rounded-full bg-gray-100 flex items-center px-4 py-2">
              <Search className="text-gray-500 mr-2" size={20} />
              <input
                type="text"
                placeholder="Search posts, stocks, players..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value.length > 2) {
                    handleSearch(e.target.value)
                  } else if (e.target.value.length === 0) {
                    fetchActivityPosts()
                  }
                }}
                className="bg-transparent w-full outline-none text-base"
              />
            </div>
          </div>

          {/* Post Creation Card */}
          <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 flex items-center justify-center overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg">👤</span>
                )}
              </div>
              <div className="flex-1 p-3 rounded-xl bg-[#f1f3f5] text-gray-500">What are you trading today?</div>
              <button className="ml-2 p-2 bg-[#0052cc] rounded-full text-white transition-transform duration-100 active:scale-95">
                <Send size={18} />
              </button>
            </div>

            <div className="flex justify-between border-t pt-4">
              <button className="flex items-center text-[#4285F4] px-3 py-2 rounded-lg hover:bg-[#4285F4]/10 transition-colors">
                <ImageIcon size={18} className="mr-2" />
                <span className="text-sm font-medium">Photo</span>
              </button>
              <button className="flex items-center text-[#9C27B0] px-3 py-2 rounded-lg hover:bg-[#9C27B0]/10 transition-colors">
                <Poll size={18} className="mr-2" />
                <span className="text-sm font-medium">Poll</span>
              </button>
              <button className="flex items-center text-[#0fae37] px-3 py-2 rounded-lg hover:bg-[#0fae37]/10 transition-colors">
                <DollarSign size={18} className="mr-2" />
                <span className="text-sm font-medium">Stocks</span>
              </button>
            </div>
          </div>

          {/* Today's Top Gains - PLAYERS not stocks */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[#f7b104] font-bold text-sm uppercase ml-1">TODAY'S TOP PERFORMERS</h3>
              <button
                className="text-[#f7b104] text-sm font-medium hover:underline transition-transform duration-100 active:scale-95"
                onClick={() => router.push(`/players?gameCode=${gameCode}`)}
              >
                View All ({gameContext?.current_players || 35})
              </button>
            </div>

            <div className="flex overflow-x-auto -mx-4 px-4 pb-4 scrollbar-hidden">
              <div className="flex space-x-3">
                {playersLoading
                  ? [1, 2, 3, 4, 5].map((i) => <PlayerGainSkeleton key={i} />)
                  : topPlayers.map((player, index) => (
                      <button
                        key={player.id}
                        className="bg-white rounded-xl p-4 shadow-md w-28 flex-shrink-0 hover:shadow-lg transition-shadow"
                        onClick={() => router.push(`/profile/${player.username}`)}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 rounded-full bg-gray-200 mb-2 flex items-center justify-center overflow-hidden shadow-sm">
                            {player.profile_picture_url ? (
                              <img
                                src={player.profile_picture_url || "/placeholder.svg"}
                                alt={player.display_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-gray-600">
                                {player.display_name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-center text-xs">{player.display_name}</p>
                          <p className="text-[#0fae37] font-medium text-xs">+{player.daily_return.toFixed(2)}%</p>
                          <p className="text-gray-500 text-xs">#{player.rank}</p>
                        </div>
                      </button>
                    ))}
              </div>
            </div>
          </div>

          {/* Activity Feed - Real data from Supabase */}
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-bold text-lg ml-1">Activity</h3>
            <button className="flex items-center text-gray-600 text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm transition-transform duration-100 active:scale-95">
              Most Recent
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>

          {/* Activity Posts */}
          <Suspense
            fallback={
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <ActivitySkeleton key={i} />
                ))}
              </div>
            }
          >
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <ActivitySkeleton key={i} />
                ))}
              </div>
            ) : activityPosts.length > 0 ? (
              activityPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl p-4 shadow-md mb-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex mb-3">
                    <button
                      className="w-12 h-12 rounded-full bg-gray-200 mr-3 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm transition-transform duration-100 active:scale-95"
                      onClick={() => router.push(`/profile/${post.users?.username}`)}
                    >
                      {post.users?.profile_picture_url ? (
                        <img
                          src={post.users.profile_picture_url || "/placeholder.svg"}
                          alt={post.users.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-600">
                          {post.users?.display_name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      )}
                    </button>
                    <div>
                      <p>
                        <button
                          className="font-bold hover:text-[#f7b104] transition-transform duration-100 active:scale-95"
                          onClick={() => router.push(`/profile/${post.users?.username}`)}
                        >
                          {post.users?.display_name || "Unknown User"}
                        </button>{" "}
                        <span className="text-gray-600">
                          shared a post in {gameContext?.title || "Nov. 2024 Stock Challenge"}
                        </span>
                      </p>
                      <p className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-[#edf4fa] rounded-xl p-4 shadow-sm mb-3">
                    <p className="text-gray-800 mb-2">{post.content}</p>
                    {post.stock_symbol && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-bold">{post.stock_symbol.charAt(0)}</span>
                          </div>
                          <span className="font-bold">{post.stock_symbol}</span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            post.trade_type === "buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {post.trade_type?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-3 pt-3 border-t">
                    <button
                      className="text-gray-500 text-sm flex items-center transition-transform duration-100 active:scale-95"
                      onClick={() => handleLikePost(post.id)}
                    >
                      <Heart size={16} className="mr-1" />
                      Like ({post.likes_count || 0})
                    </button>
                    <button
                      className="text-gray-500 text-sm flex items-center transition-transform duration-100 active:scale-95"
                      onClick={() => handleOpenComments(post)}
                    >
                      <MessageSquare size={16} className="mr-1" />
                      Comment ({post.comments_count || 0})
                    </button>
                    <button className="text-gray-500 text-sm flex items-center transition-transform duration-100 active:scale-95">
                      <Share size={16} className="mr-1" />
                      Share
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-md text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">📊</span>
                </div>
                <h4 className="font-bold text-gray-600 mb-2">No Activity Yet</h4>
                <p className="text-gray-500 text-sm">Be the first to share something!</p>
              </div>
            )}
          </Suspense>
        </div>

        {/* Comment Modal */}
        <CommentModal
          post={selectedPost}
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          onAddComment={handleAddComment}
        />

        {/* Fixed Bottom Navigation - Always visible */}
        <BottomNavigation />
      </div>
    </MobileContainer>
  )
}
