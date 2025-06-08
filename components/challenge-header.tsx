"use client"

import { memo } from "react"
import { ArrowLeft, MoreVertical, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import TouchFeedback from "@/components/touch-feedback"

interface ChallengeHeaderProps {
  title?: string
  gameCode?: string
  hostName?: string
  playerCount?: number
  showBackButton?: boolean
}

const ChallengeHeader = memo(function ChallengeHeader({
  title = "Nov. 2024 Stock Challenge",
  gameCode = "112024",
  hostName = "John Smith",
  playerCount = 35,
  showBackButton = false,
}: ChallengeHeaderProps) {
  const router = useRouter()

  return (
    <div className="bg-gradient-to-b from-[#f7b104] to-[#d48f03] p-5 pb-8 sticky top-0 z-10">
      <div className="flex justify-between items-center mb-3">
        {showBackButton ? (
          <TouchFeedback className="text-white p-2" onClick={() => router.back()}>
            <ArrowLeft size={28} />
          </TouchFeedback>
        ) : (
          <div className="w-10"></div>
        )}
        <div className="flex">
          <TouchFeedback className="text-white p-2 mr-1">
            <Bell size={24} />
          </TouchFeedback>
          <TouchFeedback className="text-white p-2">
            <MoreVertical size={24} />
          </TouchFeedback>
        </div>
      </div>

      <h1 className="text-white text-center text-3xl font-bold mb-2">{title}</h1>
      <h2 className="text-white text-center text-lg font-medium mb-4">Hosted by {hostName}</h2>

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
        <TouchFeedback className="bg-white text-[#d48f03] font-bold px-4 py-1.5 rounded-full shadow-md">
          + Invite
        </TouchFeedback>
      </div>

      <p className="text-white text-sm mb-4 truncate">
        {playerCount} players • Game Code: {gameCode}
      </p>
    </div>
  )
})

export default ChallengeHeader
