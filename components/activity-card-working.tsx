"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart, MessageSquare, Share, Send, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  toggleLike,
  addComment,
  getPostComments,
  hasUserLikedPost,
  type ActivityPost,
  type Comment,
} from "@/lib/social-interactions"

type ActivityCardProps = {
  post: ActivityPost
  onUpdate?: () => void
}

export default function ActivityCardWorking({ post, onUpdate }: ActivityCardProps) {
  const router = useRouter()
  const { user } = useAuth()

  // State management
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  const [isLiked, setIsLiked] = useState(false)
  const [likingPost, setLikingPost] = useState(false)

  // Check if user has liked this post
  useEffect(() => {
    if (user) {
      hasUserLikedPost(user.id, post.id).then(({ liked }) => {
        setIsLiked(liked)
      })
    }
  }, [user, post.id])

  // LIKE FUNCTIONALITY - COMPLETELY WORKING
  const handleLike = async () => {
    if (!user || likingPost) return

    setLikingPost(true)
    console.log("👍 Handling like click:", { postId: post.id, currentlyLiked: isLiked })

    try {
      const { success, liked, error } = await toggleLike(user.id, post.id)

      if (success) {
        setIsLiked(liked)
        setLikesCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)))
        console.log("✅ Like toggled successfully:", { liked, newCount: likesCount })
        onUpdate?.()
      } else {
        console.error("❌ Failed to toggle like:", error)
        alert("Failed to like post. Please try again.")
      }
    } catch (error) {
      console.error("💥 Error in handleLike:", error)
      alert("Failed to like post. Please try again.")
    } finally {
      setLikingPost(false)
    }
  }

  // COMMENT FUNCTIONALITY - COMPLETELY WORKING
  const loadComments = async () => {
    if (loadingComments) return

    setLoadingComments(true)
    console.log("🔄 Loading comments for post:", post.id)

    try {
      const { comments: fetchedComments, error } = await getPostComments(post.id)

      if (error) {
        console.error("❌ Error loading comments:", error)
        alert("Failed to load comments. Please try again.")
      } else {
        setComments(fetchedComments)
        setCommentsCount(fetchedComments.length)
        console.log("✅ Comments loaded successfully:", fetchedComments.length)
      }
    } catch (error) {
      console.error("💥 Error in loadComments:", error)
      alert("Failed to load comments. Please try again.")
    } finally {
      setLoadingComments(false)
    }
  }

  const handleShowComments = async () => {
    if (!showComments) {
      await loadComments()
    }
    setShowComments(!showComments)
  }

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || submittingComment) return

    setSubmittingComment(true)
    console.log("💬 Adding comment:", { postId: post.id, comment: newComment.trim() })

    try {
      const { success, comment, error } = await addComment(user.id, post.id, newComment.trim())

      if (success && comment) {
        setComments((prev) => [...prev, comment])
        setCommentsCount((prev) => prev + 1)
        setNewComment("")
        console.log("✅ Comment added successfully:", comment)
        onUpdate?.()
      } else {
        console.error("❌ Failed to add comment:", error)
        alert("Failed to add comment. Please try again.")
      }
    } catch (error) {
      console.error("💥 Error in handleAddComment:", error)
      alert("Failed to add comment. Please try again.")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAddComment()
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md mb-4 hover:shadow-lg transition-shadow">
      {/* Post Header */}
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
              className="font-bold hover:text-[#f7b104] transition-colors"
              onClick={() => router.push(`/profile/${post.users?.username}`)}
            >
              {post.users?.display_name || "Unknown User"}
            </button>{" "}
            <span className="text-gray-600">{post.post_type === "trade" ? "made a trade" : "shared a post"}</span>
          </p>
          <p className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleString()}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="bg-[#edf4fa] rounded-xl p-4 shadow-sm mb-3">
        <p className="text-gray-800 mb-2 whitespace-pre-wrap">{post.content}</p>
        {post.stock_symbol && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">{post.stock_symbol.charAt(0)}</span>
              </div>
              <span className="font-bold">{post.stock_symbol}</span>
            </div>
            {post.trade_amount && <span className="text-sm text-gray-600">${post.trade_amount.toFixed(2)}</span>}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex justify-between mt-3 pt-3 border-t">
        <button
          className={`text-sm flex items-center transition-all duration-200 active:scale-95 ${
            isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
          } ${likingPost ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleLike}
          disabled={likingPost}
        >
          {likingPost ? (
            <Loader2 size={16} className="mr-1 animate-spin" />
          ) : (
            <Heart size={16} className={`mr-1 ${isLiked ? "fill-current" : ""}`} />
          )}
          Like ({likesCount})
        </button>

        <button
          className="text-gray-500 text-sm flex items-center transition-all duration-200 active:scale-95 hover:text-blue-500"
          onClick={handleShowComments}
        >
          <MessageSquare size={16} className="mr-1" />
          Comment ({commentsCount})
        </button>

        <button className="text-gray-500 text-sm flex items-center transition-all duration-200 active:scale-95 hover:text-green-500">
          <Share size={16} className="mr-1" />
          Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t">
          {loadingComments ? (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Existing Comments */}
              {comments.length > 0 && (
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex">
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
                        <p className="text-gray-700 text-sm">{comment.comment_text}</p>
                        <p className="text-gray-500 text-xs mt-1">{new Date(comment.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url || "/placeholder.svg"}
                        alt="Your profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-xs">
                        {user.user_metadata?.display_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a comment..."
                    className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-sm focus:outline-none focus:border-[#f7b104]"
                    disabled={submittingComment}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="bg-[#f7b104] text-white p-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                  >
                    {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
