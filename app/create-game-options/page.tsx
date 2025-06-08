"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import { useState, useRef } from "react"

export default function CreateGameOptionsPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(0)
  const touchStartXRef = useRef<number | null>(null)

  const options = [
    {
      id: "create",
      title: "Create New Game",
      description: "Set up a new investment challenge with friends",
      icon: "📈",
      bgColor: "#0052cc",
      action: () => router.push("/create-game"),
    },
    {
      id: "join",
      title: "Join Existing Game",
      description: "Enter an invite code to join a game",
      icon: "🤝",
      bgColor: "#9C27B0",
      action: () => router.push("/join-game"),
    },
  ]

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return

    const touchEndX = e.changedTouches[0].clientX
    const diffX = touchEndX - touchStartXRef.current

    // Swipe threshold
    if (Math.abs(diffX) > 50) {
      if (diffX > 0 && currentPage > 0) {
        // Swipe right
        setCurrentPage(currentPage - 1)
      } else if (diffX < 0 && currentPage < 3) {
        // Swipe left
        setCurrentPage(currentPage + 1)
      }
    }

    touchStartXRef.current = null
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-[#f7f7f7]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0052cc] via-[#2684ff] to-[#4c9aff] p-5 pb-6">
        <div className="flex items-center">
          <TouchFeedback className="text-white p-2" onClick={() => router.push("/")}>
            <ArrowLeft size={24} />
          </TouchFeedback>
          <h1 className="text-white text-xl font-bold ml-2">Game Options</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">What would you like to do?</h2>
          <p className="text-gray-600 mt-2">Choose an option to get started</p>
        </div>

        <div className="space-y-4">
          {options.map((option) => (
            <TouchFeedback
              key={option.id}
              className="bg-white rounded-2xl p-5 shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              onClick={option.action}
            >
              <div className="flex items-center">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-3xl mr-4"
                  style={{ backgroundColor: option.bgColor }}
                >
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{option.title}</h3>
                  <p className="text-gray-600">{option.description}</p>
                </div>
              </div>
            </TouchFeedback>
          ))}
        </div>

        {/* Page indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {[0, 1, 2, 3].map((pageIdx) => (
            <div
              key={pageIdx}
              className={`w-2 h-2 rounded-full ${pageIdx === currentPage ? "bg-[#0052cc]" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
