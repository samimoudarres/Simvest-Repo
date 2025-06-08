import type React from "react"
import ChallengeBottomNavigation from "@/components/challenge-bottom-navigation"
import GameInfoBanner from "@/components/game-info-banner"

export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative">
      <div className="px-4 pt-4">
        <GameInfoBanner />
      </div>
      {children}
      <ChallengeBottomNavigation />
    </div>
  )
}
