import type React from "react"
import ChallengeBottomNavigation from "@/components/challenge-bottom-navigation"

export default function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { gameCode: string }
}) {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative">
      {children}
      <ChallengeBottomNavigation gameCode={params.gameCode} />
    </div>
  )
}
