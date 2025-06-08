"use client"

import type React from "react"

import { useState } from "react"
import { Send, Loader2, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { createActivityPost } from "@/lib/social-interactions"

interface CreatePostProps {
  gameId: string
  onPostCreated?: () => void
  placeholder?: string
  className?: string
}

export default function CreatePost({
  gameId,
  onPostCreated,
  placeholder = "What are you trading today?",
  className = "",
}: CreatePostProps) {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = async () => {
    if (!user || !content.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const {
        success,
        post,
        error: postError,
      } = await createActivityPost(user.id, gameId, {
        post_type: "general",
        content: content.trim(),
      })

      if (success && post) {
        setContent("")
        setIsExpanded(false)
        onPostCreated?.()
      } else {
        setError(postError || "Failed to create post")
      }
    } catch (error) {
      console.error("Error creating post:", error)
      setError("Failed to create post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className={`bg-white rounded-xl shadow-md p-4 mb-6 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url || "/placeholder.svg"}
              alt="Your profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {user.user_metadata?.display_name?.charAt(0) || "?"}
            </div>
          )}
        </div>

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f7b104] resize-none"
            rows={isExpanded ? 3 : 1}
            disabled={isSubmitting}
          />

          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {isExpanded && (
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => {
                  setIsExpanded(false)
                  setContent("")
                  setError(null)
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>

              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="bg-[#f7b104] text-white px-4 py-2 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 active:scale-95 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Post
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
