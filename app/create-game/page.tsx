"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronDown,
  Users,
  DollarSign,
  Clock,
  ChevronRight,
  Copy,
  Search,
  X,
  Check,
  Loader2,
} from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import { createClientSupabaseClient } from "@/lib/supabase"
import { createGameAction } from "@/app/actions/game-actions"
import { useAuth } from "@/contexts/auth-context"

type UserSearchResult = {
  id: string
  username: string
  display_name: string
  profile_picture_url: string | null
}

export default function CreateGamePage() {
  const router = useRouter()
  const { user, profile, isAuthenticated, debugAuthState } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [gameType, setGameType] = useState("stock")
  const [visibility, setVisibility] = useState("public")
  const [duration, setDuration] = useState("1 month")
  const [startingBalance, setStartingBalance] = useState("$100,000")
  const [showGameTypeDropdown, setShowGameTypeDropdown] = useState(false)
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false)
  const [showDurationDropdown, setShowDurationDropdown] = useState(false)
  const [showBalanceDropdown, setShowBalanceDropdown] = useState(false)
  const [gameName, setGameName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [createdGame, setCreatedGame] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const gameTypes = ["Stock", "Crypto", "Mixed"]
  const visibilityOptions = ["Public", "Private", "Friends Only"]
  const durationOptions = ["1 week", "2 weeks", "1 month", "3 months", "6 months"]
  const balanceOptions = ["$10,000", "$50,000", "$100,000", "$500,000", "$1,000,000"]

  const gameTemplates = [
    {
      id: "stock-challenge",
      name: "Stock Challenge",
      description: "Trade stocks with your friends in a competitive environment",
      icon: "📈",
      color: "#0052cc",
      type: "stock",
    },
    {
      id: "crypto-challenge",
      name: "Crypto Challenge",
      description: "Dive into the world of cryptocurrency trading",
      icon: "₿",
      color: "#f7931a",
      type: "crypto",
    },
    {
      id: "mixed-portfolio",
      name: "Mixed Portfolio",
      description: "Create a diversified portfolio with stocks, ETFs and crypto",
      icon: "🔄",
      color: "#8e44ad",
      type: "mixed",
    },
    {
      id: "beginners-game",
      name: "Beginner's Game",
      description: "Learn the basics of investing in a risk-free environment",
      icon: "🎓",
      color: "#27ae60",
      type: "stock",
    },
  ]

  // Debug authentication state on component mount
  useEffect(() => {
    console.log("🎮 CreateGame: Component mounted")
    debugAuthState()
  }, [debugAuthState])

  // Search for users
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([])
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const supabase = createClientSupabaseClient()
        const { data, error } = await supabase
          .from("users")
          .select("id, username, display_name, profile_picture_url")
          .ilike("username", `%${searchTerm}%`)
          .limit(5)

        if (error) throw error
        setSearchResults(data || [])
      } catch (err) {
        console.error("❌ Error searching users:", err)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2)
    }
  }

  const handleCreateGame = async () => {
    console.log("🎮 Starting game creation process...")

    // Debug authentication state before creating game
    debugAuthState()

    if (!isAuthenticated) {
      console.error("❌ User not authenticated for game creation")
      setError("You must be logged in to create a game. Please refresh the page and try again.")
      return
    }

    if (!user || !profile) {
      console.error("❌ Missing user or profile data:", { hasUser: !!user, hasProfile: !!profile })
      setError("Authentication data is incomplete. Please refresh the page and try again.")
      return
    }

    if (!gameName.trim()) {
      setError("Please enter a game name")
      return
    }

    if (!selectedType) {
      setError("Please select a game template")
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const template = gameTemplates.find((t) => t.id === selectedType)
      if (!template) {
        throw new Error("Invalid game template selected")
      }

      console.log("📊 Creating game with authenticated user:", {
        userId: user.id,
        username: profile.username,
        template: template.name,
      })

      // Create FormData for server action
      const formData = new FormData()
      formData.append("title", gameName.trim())
      formData.append("description", template.description)
      formData.append("gameType", gameType)
      formData.append("maxPlayers", "20")
      formData.append("buyInAmount", startingBalance.replace(/[^0-9.-]+/g, ""))
      formData.append("duration", duration)

      console.log("🚀 Calling server action with form data and user ID:", user.id)

      // Call server action with user ID as fallback
      const result = await createGameAction(formData, user.id)

      if (!result.success) {
        console.error("❌ Game creation failed:", result.error)
        throw new Error(result.error || "Failed to create game")
      }

      console.log("✅ Game created successfully:", result.game)
      setCreatedGame(result.game)
      setStep(3)
    } catch (err) {
      console.error("💥 Error creating game:", err)
      setError(err instanceof Error ? err.message : "Failed to create game")
    } finally {
      setIsCreating(false)
    }
  }

  const handleBackStep = () => {
    if (step === 3) {
      router.push("/")
      return
    }

    if (step === 2) {
      setStep(1)
    } else {
      router.push("/create-game-options")
    }
  }

  const handleAddUser = (user: UserSearchResult) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    }
    setSearchTerm("")
    setSearchResults([])
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId))
  }

  const handleCopyLink = () => {
    if (!createdGame) return

    const gameLink = `${window.location.origin}/join-game?code=${createdGame.game_code}`
    navigator.clipboard.writeText(gameLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] max-w-[430px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0052cc] via-[#2684ff] to-[#4c9aff] p-4 pb-6">
        <div className="flex items-center">
          <TouchFeedback className="text-white p-2" onClick={handleBackStep}>
            <ArrowLeft size={24} />
          </TouchFeedback>
          <h1 className="text-white text-xl font-bold ml-2">
            {step === 1 ? "Choose Game Type" : step === 2 ? "Create New Game" : "Game Created"}
          </h1>
        </div>
      </div>

      {/* Authentication Status Debug */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 mx-4 mt-4 rounded-lg text-xs">
          <p>
            🔍 Auth Debug: User: {user?.id ? "✅" : "❌"} | Profile: {profile?.username ? "✅" : "❌"} | Authenticated:{" "}
            {isAuthenticated ? "✅" : "❌"}
          </p>
          {user && <p>User ID: {user.id}</p>}
          {profile && <p>Username: {profile.username}</p>}
        </div>
      )}

      {/* Authentication Warning */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 mx-4 mt-4 rounded-lg">
          <p className="text-sm">⚠️ Authentication required. Please log in to create a game.</p>
        </div>
      )}

      {/* Form Content */}
      <div className="flex-1 p-4 pb-16 overflow-y-auto">
        {step === 1 ? (
          /* Step 1: Game Type Selection */
          <div className="space-y-5">
            <p className="text-gray-600 px-4 mb-6">
              Choose a game template to get started with your investment challenge
            </p>

            {gameTemplates.map((template) => (
              <TouchFeedback
                key={template.id}
                className={`bg-white rounded-2xl p-5 shadow-md transition-all ${
                  selectedType === template.id ? "border-2 border-blue-500" : "border border-gray-100"
                }`}
                onClick={() => setSelectedType(template.id)}
              >
                <div className="flex items-start">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl mr-4 shadow-sm"
                    style={{ backgroundColor: template.color }}
                  >
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-left">{template.name}</h3>
                    <p className="text-gray-600 text-sm text-left">{template.description}</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      selectedType === template.id ? "bg-blue-500 border-blue-500" : "border-gray-300"
                    }`}
                  >
                    {selectedType === template.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                </div>
              </TouchFeedback>
            ))}

            <TouchFeedback
              className={`w-full py-4 bg-[#0052cc] text-white font-bold rounded-xl text-center mt-6 shadow-md ${
                !selectedType ? "opacity-50" : ""
              }`}
              onClick={selectedType ? handleNextStep : undefined}
            >
              Continue
            </TouchFeedback>
          </div>
        ) : step === 2 ? (
          /* Step 2: Game Details Form */
          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4 text-sm">
                <strong>Error:</strong> {error}
                <button onClick={() => setError(null)} className="ml-2 text-red-800 hover:text-red-900 font-medium">
                  ✕
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
              <h2 className="text-lg font-bold mb-4 text-left">Game Details</h2>

              {/* Game Name */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2 text-left">
                  Game Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter a name for your game"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Game Type */}
              <div className="mb-4 relative">
                <label className="block text-gray-700 text-sm font-medium mb-2 text-left">Game Type</label>
                <TouchFeedback
                  className="w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center"
                  onClick={() => setShowGameTypeDropdown(!showGameTypeDropdown)}
                >
                  <div className="flex items-center">
                    <DollarSign size={18} className="text-blue-500 mr-2" />
                    <span className="capitalize">{gameType} Trading</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform ${showGameTypeDropdown ? "rotate-180" : ""}`}
                  />
                </TouchFeedback>

                {showGameTypeDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    {gameTypes.map((type) => (
                      <TouchFeedback
                        key={type}
                        className="p-3 hover:bg-gray-100 block w-full text-left"
                        onClick={() => {
                          setGameType(type.toLowerCase())
                          setShowGameTypeDropdown(false)
                        }}
                      >
                        <div className="flex items-center">
                          <DollarSign size={18} className="text-blue-500 mr-2" />
                          <span>{type} Trading</span>
                        </div>
                      </TouchFeedback>
                    ))}
                  </div>
                )}
              </div>

              {/* Visibility */}
              <div className="mb-4 relative">
                <label className="block text-gray-700 text-sm font-medium mb-2 text-left">Visibility</label>
                <TouchFeedback
                  className="w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center"
                  onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                >
                  <div className="flex items-center">
                    <Users size={18} className="text-blue-500 mr-2" />
                    <span className="capitalize">{visibility}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform ${showVisibilityDropdown ? "rotate-180" : ""}`}
                  />
                </TouchFeedback>

                {showVisibilityDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    {visibilityOptions.map((option) => (
                      <TouchFeedback
                        key={option}
                        className="p-3 hover:bg-gray-100 block w-full text-left"
                        onClick={() => {
                          setVisibility(option.toLowerCase())
                          setShowVisibilityDropdown(false)
                        }}
                      >
                        <div className="flex items-center">
                          <Users size={18} className="text-blue-500 mr-2" />
                          <span>{option}</span>
                        </div>
                      </TouchFeedback>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
              <h2 className="text-lg font-bold mb-4 text-left">Game Rules</h2>

              {/* Duration */}
              <div className="mb-4 relative">
                <label className="block text-gray-700 text-sm font-medium mb-2 text-left">Duration</label>
                <TouchFeedback
                  className="w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center"
                  onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                >
                  <div className="flex items-center">
                    <Clock size={18} className="text-blue-500 mr-2" />
                    <span>{duration}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform ${showDurationDropdown ? "rotate-180" : ""}`}
                  />
                </TouchFeedback>

                {showDurationDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    {durationOptions.map((option) => (
                      <TouchFeedback
                        key={option}
                        className="p-3 hover:bg-gray-100 block w-full text-left"
                        onClick={() => {
                          setDuration(option)
                          setShowDurationDropdown(false)
                        }}
                      >
                        <div className="flex items-center">
                          <Clock size={18} className="text-blue-500 mr-2" />
                          <span>{option}</span>
                        </div>
                      </TouchFeedback>
                    ))}
                  </div>
                )}
              </div>

              {/* Starting Balance */}
              <div className="mb-4 relative">
                <label className="block text-gray-700 text-sm font-medium mb-2 text-left">Starting Balance</label>
                <TouchFeedback
                  className="w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center"
                  onClick={() => setShowBalanceDropdown(!showBalanceDropdown)}
                >
                  <div className="flex items-center">
                    <DollarSign size={18} className="text-blue-500 mr-2" />
                    <span>{startingBalance}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform ${showBalanceDropdown ? "rotate-180" : ""}`}
                  />
                </TouchFeedback>

                {showBalanceDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    {balanceOptions.map((option) => (
                      <TouchFeedback
                        key={option}
                        className="p-3 hover:bg-gray-100 block w-full text-left"
                        onClick={() => {
                          setStartingBalance(option)
                          setShowBalanceDropdown(false)
                        }}
                      >
                        <div className="flex items-center">
                          <DollarSign size={18} className="text-blue-500 mr-2" />
                          <span>{option}</span>
                        </div>
                      </TouchFeedback>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
              <h2 className="text-lg font-bold mb-4 text-left">Invite Friends</h2>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2 text-left">Add Participants</label>
                <div className="relative">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search by username"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 focus:outline-none"
                      />
                    </div>
                    <div className="px-3 text-gray-400">
                      {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </div>
                  </div>

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((user) => (
                        <TouchFeedback
                          key={user.id}
                          className="p-3 hover:bg-gray-100 block w-full text-left"
                          onClick={() => handleAddUser(user)}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 overflow-hidden">
                              {user.profile_picture_url ? (
                                <img
                                  src={user.profile_picture_url || "/placeholder.svg"}
                                  alt={user.display_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white">
                                  {user.display_name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-left">{user.display_name}</div>
                              <div className="text-sm text-gray-500 text-left">@{user.username}</div>
                            </div>
                          </div>
                        </TouchFeedback>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center bg-blue-50 text-blue-700 rounded-full pl-2 pr-1 py-1"
                      >
                        <span className="text-sm mr-1">{user.display_name}</span>
                        <TouchFeedback
                          className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <X size={12} />
                        </TouchFeedback>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Create Game Button */}
            <TouchFeedback
              className={`w-full py-4 bg-[#0052cc] text-white font-bold rounded-xl text-center mb-4 shadow-md ${
                isCreating || !isAuthenticated ? "opacity-70" : ""
              }`}
              onClick={!isCreating && isAuthenticated ? handleCreateGame : undefined}
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Creating Game...
                </div>
              ) : !isAuthenticated ? (
                "Please Log In First"
              ) : (
                "Create Game"
              )}
            </TouchFeedback>
          </div>
        ) : (
          /* Step 3: Success Screen */
          <div className="text-center">
            <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-500" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Game Created!</h2>
            <p className="text-gray-600 mb-8">Your investment challenge has been created successfully.</p>

            {createdGame && (
              <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
                <h3 className="text-lg font-bold mb-4 text-left">{createdGame.title}</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Game Code:</span>
                    <span className="font-medium">{createdGame.game_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{gameType} Trading</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Balance:</span>
                    <span className="font-medium">{startingBalance}</span>
                  </div>
                </div>

                {/* Invite Link */}
                <div className="mb-6">
                  <p className="text-gray-700 text-sm mb-2 text-left">
                    Share this link with friends to join your game:
                  </p>
                  <TouchFeedback
                    className="flex items-center justify-between bg-gray-100 p-3 rounded-lg"
                    onClick={handleCopyLink}
                  >
                    <span className="text-gray-600 text-sm truncate mr-2">
                      {typeof window !== "undefined" &&
                        `${window.location.origin}/join-game?code=${createdGame.game_code}`}
                    </span>
                    <div className="flex items-center text-blue-600">
                      {linkCopied ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <Copy size={18} className="text-blue-500" />
                      )}
                    </div>
                  </TouchFeedback>
                  {linkCopied && <p className="text-green-500 text-xs mt-1 text-left">Link copied to clipboard!</p>}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <TouchFeedback
                    className="w-full py-3 bg-[#0052cc] text-white font-bold rounded-xl text-center"
                    onClick={() => router.push(`/game/${createdGame.game_code}`)}
                  >
                    Continue to Game
                  </TouchFeedback>
                  <TouchFeedback
                    className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl text-center"
                    onClick={() => router.push("/")}
                  >
                    Back to Home
                  </TouchFeedback>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation - Only show on step 1 */}
      {step === 1 && (
        <div className="bg-white p-4 border-t border-gray-200 flex justify-between shadow-md">
          <TouchFeedback
            className="text-gray-500 px-3 py-2 rounded-lg flex items-center hover:bg-gray-100"
            onClick={() => router.push("/create-game-options")}
          >
            Cancel
          </TouchFeedback>

          <TouchFeedback
            className={`flex items-center px-4 py-2 rounded-lg ${
              selectedType ? "bg-[#0052cc] text-white" : "bg-gray-200 text-gray-500"
            }`}
            onClick={selectedType ? handleNextStep : undefined}
          >
            Next <ChevronRight size={18} className="ml-1" />
          </TouchFeedback>
        </div>
      )}
    </div>
  )
}
