"use client"

import { useRouter } from "next/navigation"
import { Bell, Settings, Search } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"

export default function AppHomePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <div className="bg-white p-5 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Home</h1>
          <div className="flex space-x-4">
            <TouchFeedback className="p-2">
              <Bell size={24} />
            </TouchFeedback>
            <TouchFeedback className="p-2">
              <Settings size={24} />
            </TouchFeedback>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative rounded-full bg-gray-100 flex items-center px-4 py-2">
          <Search className="text-gray-500 mr-2" size={20} />
          <input
            type="text"
            placeholder="Search stocks, ETFs, and more..."
            className="bg-transparent w-full outline-none text-base"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Welcome back, Alex!</h2>
          <p className="text-gray-600">Your portfolio is up 3.2% this week.</p>
        </div>

        {/* Active Challenges */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">Active Challenges</h3>

          <TouchFeedback
            className="bg-gradient-to-r from-[#f7b104] to-[#d48f03] rounded-xl p-4 shadow-md mb-3 text-white"
            onClick={() => router.push("/")}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-lg">November 2024 Stock Challenge</h4>
                <p className="text-sm text-white/80">Hosted by John Smith</p>
              </div>
              <div className="bg-white/20 px-2 py-1 rounded-full text-xs">24 days left</div>
            </div>

            <div className="flex items-center mt-3">
              <div className="flex -space-x-2 mr-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
                  >
                    <span className="text-xs">👤</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/80">You and 34 others</p>
            </div>
          </TouchFeedback>

          <TouchFeedback className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#0fae37]">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-lg">Tech Stocks Only</h4>
                <p className="text-sm text-gray-500">Hosted by Emma Lawrence</p>
              </div>
              <div className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">12 days left</div>
            </div>

            <div className="flex items-center mt-3">
              <div className="flex -space-x-2 mr-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
                  >
                    <span className="text-xs">👤</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">You and 12 others</p>
            </div>
          </TouchFeedback>
        </div>

        {/* Your Watchlists */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">Your Watchlists</h3>
            <TouchFeedback className="text-[#f7b104] text-sm font-medium">See All</TouchFeedback>
          </div>

          <div className="flex overflow-x-auto -mx-4 px-4 pb-4 scrollbar-hidden">
            <div className="flex space-x-3">
              <TouchFeedback className="bg-white rounded-xl p-4 shadow-md w-40 flex-shrink-0">
                <h4 className="font-bold mb-3">Tech Giants</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-[#000000] text-white text-xs px-2 py-1 rounded-full">AAPL</div>
                  <div className="bg-[#00a4ef] text-white text-xs px-2 py-1 rounded-full">MSFT</div>
                  <div className="bg-[#4285F4] text-white text-xs px-2 py-1 rounded-full">GOOG</div>
                  <div className="bg-[#0668E1] text-white text-xs px-2 py-1 rounded-full">META</div>
                </div>
              </TouchFeedback>

              <TouchFeedback className="bg-white rounded-xl p-4 shadow-md w-40 flex-shrink-0">
                <h4 className="font-bold mb-3">Crypto</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-[#ff9500] text-white text-xs px-2 py-1 rounded-full">BTC</div>
                  <div className="bg-[#627eea] text-white text-xs px-2 py-1 rounded-full">ETH</div>
                  <div className="bg-[#00ffbd] text-white text-xs px-2 py-1 rounded-full">SOL</div>
                </div>
              </TouchFeedback>

              <TouchFeedback className="bg-white rounded-xl p-4 shadow-md w-40 flex-shrink-0">
                <h4 className="font-bold mb-3">ETFs</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-[#d93025] text-white text-xs px-2 py-1 rounded-full">VOO</div>
                  <div className="bg-[#4831d4] text-white text-xs px-2 py-1 rounded-full">QQQ</div>
                  <div className="bg-[#00a79d] text-white text-xs px-2 py-1 rounded-full">ARKK</div>
                </div>
              </TouchFeedback>
            </div>
          </div>
        </div>

        {/* Market News */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">Market News</h3>
            <TouchFeedback className="text-[#f7b104] text-sm font-medium">See All</TouchFeedback>
          </div>

          <div className="space-y-3">
            <TouchFeedback className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex">
                <div className="flex-1 pr-3">
                  <h4 className="font-bold mb-1">Fed Signals Potential Rate Cut in December Meeting</h4>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                    The Federal Reserve has indicated it may consider cutting interest rates at its upcoming December
                    meeting...
                  </p>
                  <p className="text-xs text-gray-400">Bloomberg • 2 hours ago</p>
                </div>
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
              </div>
            </TouchFeedback>

            <TouchFeedback className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex">
                <div className="flex-1 pr-3">
                  <h4 className="font-bold mb-1">NVIDIA Surges 7% After Beating Earnings Expectations</h4>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                    NVIDIA shares jumped after the company reported quarterly results that exceeded analyst
                    projections...
                  </p>
                  <p className="text-xs text-gray-400">CNBC • 5 hours ago</p>
                </div>
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
              </div>
            </TouchFeedback>
          </div>
        </div>

        {/* Discover */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">Discover</h3>
            <TouchFeedback className="text-[#f7b104] text-sm font-medium">See All</TouchFeedback>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TouchFeedback className="bg-white rounded-xl p-4 shadow-md">
              <div className="w-10 h-10 rounded-full bg-[#0fae37] flex items-center justify-center mb-2">
                <span className="text-white text-lg">↑</span>
              </div>
              <h4 className="font-bold">Top Gainers</h4>
              <p className="text-gray-500 text-sm">Stocks on the rise today</p>
            </TouchFeedback>

            <TouchFeedback className="bg-white rounded-xl p-4 shadow-md">
              <div className="w-10 h-10 rounded-full bg-[#d93025] flex items-center justify-center mb-2">
                <span className="text-white text-lg">↓</span>
              </div>
              <h4 className="font-bold">Top Losers</h4>
              <p className="text-gray-500 text-sm">Stocks on the decline</p>
            </TouchFeedback>

            <TouchFeedback className="bg-white rounded-xl p-4 shadow-md">
              <div className="w-10 h-10 rounded-full bg-[#ff9500] flex items-center justify-center mb-2">
                <span className="text-white text-lg">₿</span>
              </div>
              <h4 className="font-bold">Crypto</h4>
              <p className="text-gray-500 text-sm">Digital currencies</p>
            </TouchFeedback>

            <TouchFeedback className="bg-white rounded-xl p-4 shadow-md">
              <div className="w-10 h-10 rounded-full bg-[#4831d4] flex items-center justify-center mb-2">
                <span className="text-white text-lg">Q</span>
              </div>
              <h4 className="font-bold">ETFs</h4>
              <p className="text-gray-500 text-sm">Exchange-traded funds</p>
            </TouchFeedback>
          </div>
        </div>
      </div>
    </div>
  )
}
