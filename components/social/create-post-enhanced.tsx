"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"
import { createPost } from "@/lib/social-interactions"
import { useAuth } from "@/contexts/auth-context"

interface CreatePostProps {
  gameId: string
  onPostCreated?: () => void
  placeholder?: string
}

export default function CreatePostEnhanced({
  gameId,
  onPostCreated,
  placeholder = "Share your thoughts...",
}: CreatePostProps) {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !content.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const result = await createPost(gameId, user.id, content)

      if (result.success) {
        setContent("")
        if (onPostCreated) onPostCreated()
      }
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url || "/placeholder.svg"}
                alt="User"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#f7b104] flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
                </span>
              </div>
            )}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="flex-1 border rounded-lg px-3 py-2 min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-[#f7b104]"
            disabled={!user || isSubmitting}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!user || !content.trim() || isSubmitting}
            className="bg-[#f7b104] text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            <span>Post</span>
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
