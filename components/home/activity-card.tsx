"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Heart, MessageSquare, Share, Send } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  likePost,
  addComment,
  getPostComments,
  hasUserLikedPost,
  subscribeToPostComments,
  subscribeToPostLikes,
} from "@/lib/social-enhanced"
import type { Comment } from "@/lib/social-enhanced"

interface ActivityCardProps {
  activity: {
    id: string
    userName: string
    userEmoji: string
    time: string
    stockSymbol: string
    stockName: string
    title: string
    sharesBought: number
    orderTotal: number
    change: number
    marketCap: string
    revenue: string
    rationale: string
    likes_count?: number
    comments_count?: number
  }
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const isPositive = activity.change > 0

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(activity.likes_count || 0)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsCount, setCommentsCount] = useState(activity.comments_count || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  // Check if user has liked this post
  useEffect(() => {
    if (user) {
      checkLikeStatus()
    }
  }, [user, activity.id])

  // Load comments when comment section is opened
  useEffect(() => {
    if (showCommentInput && !isLoadingComments) {
      loadComments()
    }
  }, [showCommentInput])

  // Subscribe to real-time updates
  useEffect(() => {
    if (showCommentInput) {
      const commentsSubscription = subscribeToPostComments(activity.id, (updatedComments) => {
        setComments(updatedComments)
        setCommentsCount(updatedComments.length)
      })

      const likesSubscription = subscribeToPostLikes(activity.id, () => {
        // Refetch like count when likes change
        if (user) {
          checkLikeStatus()
        }
      })

      return () => {
        commentsSubscription.unsubscribe()
        likesSubscription.unsubscribe()
      }
    }
  }, [showCommentInput, activity.id, user])

  const checkLikeStatus = async () => {
    if (!user) return

    try {
      const { liked: userLiked } = await hasUserLikedPost(user.id, activity.id)
      setLiked(userLiked)
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  const loadComments = async () => {
    setIsLoadingComments(true)
    try {
      const { comments: postComments, error } = await getPostComments(activity.id)
      if (!error && postComments) {
        setComments(postComments)
        setCommentsCount(postComments.length)
      }
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleLike = async () => {
    if (!user || isLiking) return

    setIsLiking(true)
    try {
      const { success, liked: newLikedState, error } = await likePost(user.id, activity.id)

      if (success) {
        setLiked(newLikedState)
        if (newLikedState) {
          setLikeCount((prev) => prev + 1)
        } else {
          setLikeCount((prev) => Math.max(0, prev - 1))
        }
      } else {
        console.error("Error liking post:", error)
      }
    } catch (error) {
      console.error("Error liking post:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleComment = () => {
    setShowCommentInput(!showCommentInput)
  }

  const handleShare = async () => {
    const shareText = `Check out this trade: ${activity.userName} ${activity.change > 0 ? "gained" : "lost"} ${Math.abs(activity.change)}% on ${activity.stockSymbol}!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Stock Trade Update",
          text: shareText,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText)
        alert("Trade details copied to clipboard!")
      } catch (error) {
        console.error("Error copying to clipboard:", error)
      }
    }
  }

  const handleSubmitComment = async () => {
    if (!user || !commentText.trim() || isCommenting) return

    setIsCommenting(true)
    try {
      const { comment, error } = await addComment(user.id, activity.id, commentText.trim())

      if (comment && !error) {
        setCommentText("")
        setCommentsCount((prev) => prev + 1)
        // Comments will be updated via real-time subscription
      } else {
        console.error("Error adding comment:", error)
        alert("Failed to add comment. Please try again.")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Failed to add comment. Please try again.")
    } finally {
      setIsCommenting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  const handleUserClick = () => {
    const username = activity.userName.toLowerCase().replace(/\s+/g, "")
    router.push(`/profile/${username}`)
  }

  const handleStockClick = () => {
    router.push(`/challenge/stock/${activity.stockSymbol}`)
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md">
      {/* User Header Section */}
      <div className="flex justify-between items-start mb-4">
        <button className="flex transition-all duration-200 active:scale-95" onClick={handleUserClick}>
          <div className="w-11 h-11 rounded-full bg-gray-200 mr-3 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <span className="text-lg">{activity.userEmoji}</span>
          </div>
          <div>
            <p className="font-bold">{activity.userName}</p>
            <p className="text-gray-500 text-xs">shared a post in Nov. 2024 Stock Challenge</p>
            <p className="text-gray-500 text-xs">{activity.time}</p>
          </div>
        </button>
        <button className="p-1 transition-all duration-200 active:scale-95">
          <MoreVertical size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Post Body Section */}
      <div className="bg-[#edf4fa] rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <button
              className="flex items-center mb-3 transition-all duration-200 active:scale-95"
              onClick={handleStockClick}
            >
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center mr-2 shadow-sm">
                <span className="text-white text-xs font-bold">{activity.stockSymbol.charAt(0)}</span>
              </div>
              <h4 className="text-xl font-bold">{activity.title}</h4>
            </button>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-1">
              <div>
                <p className="text-gray-500 text-xs">Shares Bought:</p>
                <p className="font-medium text-sm">{activity.sharesBought}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Order Total:</p>
                <p className="font-medium text-sm">${activity.orderTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Market Cap:</p>
                <p className="font-medium text-sm">{activity.marketCap}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Revenue:</p>
                <p className="font-medium text-sm">{activity.revenue}</p>
              </div>
            </div>
          </div>

          <div className="ml-4 text-right">
            <p className={`font-bold text-lg ${isPositive ? "text-[#0fae37]" : "text-[#d93025]"}`}>
              {isPositive ? "▲" : "▼"} {Math.abs(activity.change)}%
            </p>
            <p className="text-gray-500 text-xs">Since Purchase</p>
          </div>
        </div>
      </div>

      {/* Rationale Section */}
      <div className="bg-[#f9f9f9] border border-gray-100 rounded-xl p-3 mb-4">
        <p className="text-sm text-gray-800">
          <span className="mr-1 font-medium">💡 Rationale:</span>
          {activity.rationale}
        </p>
      </div>

      {/* Like/Comment Counts */}
      {(likeCount > 0 || commentsCount > 0) && (
        <div className="flex items-center mb-3 text-sm text-gray-500">
          {likeCount > 0 && (
            <div className="flex items-center mr-4">
              <div className="w-5 h-5 rounded-full bg-[#0052cc] flex items-center justify-center mr-1">
                <Heart size={12} className="text-white" />
              </div>
              <span>{likeCount}</span>
            </div>
          )}
          {commentsCount > 0 && (
            <div className="flex items-center">
              <span>{commentsCount} comments</span>
            </div>
          )}
        </div>
      )}

      {/* Interaction buttons */}
      <div className="flex justify-between pt-3 border-t">
        <button
          className={`flex items-center text-gray-500 text-sm px-2 py-1 rounded-md hover:bg-gray-50 transition-all duration-200 active:scale-95 ${
            liked ? "text-[#0052cc] font-medium" : ""
          } ${isLiking ? "opacity-50" : ""}`}
          onClick={handleLike}
          disabled={isLiking || !user}
        >
          <Heart size={16} className={`mr-1 ${liked ? "fill-[#0052cc]" : ""}`} />
          <span>Like</span>
        </button>
        <button
          className={`flex items-center text-gray-500 text-sm px-2 py-1 rounded-md hover:bg-gray-50 transition-all duration-200 active:scale-95 ${
            showCommentInput ? "text-[#0052cc] font-medium" : ""
          }`}
          onClick={handleComment}
        >
          <MessageSquare size={16} className="mr-1" />
          <span>Comment</span>
        </button>
        <button
          className="flex items-center text-gray-500 text-sm px-2 py-1 rounded-md hover:bg-gray-50 transition-all duration-200 active:scale-95"
          onClick={handleShare}
        >
          <Share size={16} className="mr-1" />
          <span>Share</span>
        </button>
      </div>

      {/* Comment Section */}
      {showCommentInput && (
        <div className="mt-3 pt-3 border-t">
          {user && (
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                {user.user_metadata?.profile_picture_url ? (
                  <img
                    src={user.user_metadata.profile_picture_url || "/placeholder.svg"}
                    alt="Your profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm">👤</span>
                )}
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write a comment..."
                  className="w-full py-2 px-3 pr-10 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#0052cc] focus:bg-white"
                  disabled={isCommenting}
                />
                <button
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-[#0052cc] transition-all duration-200 active:scale-95 ${
                    !commentText.trim() || isCommenting ? "opacity-50" : ""
                  }`}
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || isCommenting}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-[#0052cc] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3 ml-10">
              {comments.map((comment) => (
                <div key={comment.id} className="flex">
                  <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex-shrink-0 flex items-center justify-center">
                    {comment.users?.profile_picture_url ? (
                      <img
                        src={comment.users.profile_picture_url || "/placeholder.svg"}
                        alt={comment.users.display_name || "User"}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm">👤</span>
                    )}
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2 flex-1">
                    <div className="flex justify-between items-center">
                      <button
                        className="font-medium text-sm transition-all duration-200 active:scale-95"
                        onClick={() => router.push(`/profile/${comment.users?.username}`)}
                      >
                        {comment.users?.display_name || "Unknown User"}
                      </button>
                      <p className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
