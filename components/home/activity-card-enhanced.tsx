"use client"

import type React from "react"

import { useState } from "react"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { likePost, addComment, getPostComments } from "@/lib/social-interactions"
import { useAuth } from "@/contexts/auth-context"

interface ActivityCardProps {
  post: {
    id: string
    user: {
      name: string
      avatar?: string
    }
    content: string
    created_at: string
    likes: number
    comments: number
    liked_by_user: boolean
  }
  onUpdate?: () => void
}

export default function ActivityCardEnhanced({ post, onUpdate }: ActivityCardProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(post.liked_by_user)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [commentCount, setCommentCount] = useState(post.comments)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Format the post date
  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  // Handle like button click
  const handleLike = async () => {
    if (!user) return

    try {
      const result = await likePost(post.id, user.id)

      if (result.success) {
        setIsLiked(result.liked)
        setLikeCount(result.likes)
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  // Load comments
  const loadComments = async () => {
    if (!showComments) {
      setIsLoading(true)
      try {
        const result = await getPostComments(post.id)

        if (result.success) {
          setComments(result.comments)
        }
      } catch (error) {
        console.error("Error loading comments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    setShowComments(!showComments)
  }

  // Submit a new comment
  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !commentText.trim()) return

    try {
      const result = await addComment(post.id, user.id, commentText)

      if (result.success) {
        setCommentText("")
        setCommentCount((prev) => prev + 1)
        setComments((prev) => [...prev, result.comment])
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
      {/* User info */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          {post.user.avatar ? (
            <img
              src={post.user.avatar || "/placeholder.svg"}
              alt={post.user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium">{post.user.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-medium">{post.user.name}</h4>
          <p className="text-gray-500 text-xs">{formattedDate}</p>
        </div>
      </div>

      {/* Post content */}
      <div className="bg-gray-50 rounded-xl p-4 mb-3">
        <p className="text-gray-800">{post.content}</p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between pt-2">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
            isLiked ? "text-red-500" : "text-gray-500"
          } hover:bg-gray-100`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          <span>{likeCount}</span>
        </button>
        <button
          onClick={loadComments}
          className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <MessageCircle size={18} />
          <span>{commentCount}</span>
        </button>
        <button className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-100">
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t">
          {isLoading ? (
            <div className="text-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mx-auto"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3 mb-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {comment.user.avatar ? (
                      <img
                        src={comment.user.avatar || "/placeholder.svg"}
                        alt={comment.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 text-xs font-medium">{comment.user.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2 flex-1">
                    <p className="text-xs font-medium">{comment.user.name}</p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-2">No comments yet</p>
          )}

          {/* Comment form */}
          <form onSubmit={submitComment} className="flex space-x-2 mt-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#f7b104]"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="bg-[#f7b104] text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
