import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"

export default function PerformancePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#f7b104] to-[#d48f03] p-5 pb-8 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-3">
          <Link href="/" className="text-white p-2">
            <ArrowLeft size={28} />
          </Link>
          <h1 className="text-white text-4xl font-bold">PERFORMANCE</h1>
          <div className="w-10"></div>
        </div>
        <h2 className="text-white text-center text-xl font-medium mb-4">NOV. 2024 STOCK CHALLENGE</h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6">Your Performance</h3>

        {/* Performance content would go here */}
        <div className="bg-white rounded-xl p-5 shadow-md mb-4">
          <p className="text-lg font-medium">Performance metrics coming soon!</p>
          <p className="text-gray-500">Check back later for detailed performance analytics.</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
