"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"

export default function JoinGameSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const gameCode = searchParams.get("gameCode")
  const gameTitle = searchParams.get("gameTitle") || "Stock Challenge"

  useEffect(() => {
    // Auto-redirect to activity screen after 3 seconds
    const timer = setTimeout(() => {
      if (gameCode === "112024") {
        router.push("/activity")
      } else {
        router.push(`/activity?gameCode=${gameCode}`)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [router, gameCode])

  const handleContinue = () => {
    if (gameCode === "112024") {
      router.push("/activity")
    } else {
      router.push(`/activity?gameCode=${gameCode}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold mb-4">Welcome to the Challenge!</h1>

          <p className="text-gray-600 mb-2">You've successfully joined</p>
          <p className="text-xl font-bold text-[#f7b104] mb-6">{gameTitle}</p>

          <p className="text-gray-500 text-sm mb-8">
            Game Code: <span className="font-bold">{gameCode}</span>
          </p>

          <TouchFeedback
            className="w-full bg-[#f7b104] text-white font-bold py-4 px-6 rounded-full mb-4"
            onClick={handleContinue}
          >
            Start Trading
          </TouchFeedback>

          <p className="text-gray-400 text-xs">Redirecting automatically in 3 seconds...</p>
        </div>
      </div>
    </div>
  )
}
