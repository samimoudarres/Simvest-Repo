"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, MoreVertical, Search } from "lucide-react"
import BottomNavigation from "@/components/bottom-navigation"

export default function TradingApp() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#f7b104] to-[#d48f03] p-5 pb-8 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-3">
          <button className="text-white p-2">
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-white text-4xl font-bold">TRADE</h1>
          <button className="text-white p-2">
            <MoreVertical size={28} />
          </button>
        </div>
        <h2 className="text-white text-center text-xl font-medium mb-4">NOV. 2024 STOCK CHALLENGE</h2>

        {/* Search Bar */}
        <div className="relative rounded-full bg-[#252525]/20 flex items-center px-5 py-3">
          <Search className="text-white/70 mr-3" size={22} />
          <input
            type="text"
            placeholder="Search stocks, crypto, and ETFs"
            className="bg-transparent text-white placeholder-white/70 w-full outline-none text-lg"
          />
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 p-5 overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6">Start browsing</h3>

        {/* Category Cards - Horizontal Scrolling (Combined Rows) */}
        <div className="mb-8 overflow-x-auto -mx-5 px-5 pb-4 scrollbar-thin scrollbar-thumb-gray-300">
          <div className="inline-grid grid-cols-3 grid-rows-2 gap-4 min-w-[600px]">
            {/* Popular */}
            <div
              className="border-2 border-[#03480c] rounded-xl p-4 bg-white shadow-md relative overflow-hidden h-28"
              style={{ boxShadow: "0 4px 6px -1px rgba(3, 72, 12, 0.3)" }}
            >
              <h4 className="text-xl font-bold mb-3">Popular</h4>
              <div className="flex space-x-2">
                <div className="w-10 h-10 bg-[#ff0000] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">T</span>
                </div>
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🍎</span>
                </div>
              </div>
            </div>

            {/* Index Funds */}
            <div
              className="border-2 border-[#d6b600] rounded-xl p-4 bg-white shadow-md relative overflow-hidden h-28"
              style={{ boxShadow: "0 4px 6px -1px rgba(214, 182, 0, 0.3)" }}
            >
              <h4 className="text-xl font-bold mb-3">Index Funds</h4>
              <div className="flex space-x-2">
                <div className="w-10 h-10 bg-[#730586] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">FTSE</span>
                </div>
              </div>
            </div>

            {/* Top Gainers */}
            <div
              className="border-2 border-[#0fae37] rounded-xl p-4 bg-white shadow-md relative overflow-hidden h-28"
              style={{ boxShadow: "0 4px 6px -1px rgba(15, 174, 55, 0.3)" }}
            >
              <h4 className="text-xl font-bold mb-3">Top Gainers</h4>
              <div className="flex space-x-2">
                <div className="w-10 h-10 bg-[#0fae37] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">↑</span>
                </div>
              </div>
            </div>

            {/* ETFs */}
            <div
              className="border-2 border-[#c700c7] rounded-xl p-4 bg-white shadow-md relative overflow-hidden h-28"
              style={{ boxShadow: "0 4px 6px -1px rgba(199, 0, 199, 0.3)" }}
            >
              <h4 className="text-xl font-bold mb-3">ETFs</h4>
              <div className="flex space-x-2">
                <div className="w-10 h-10 bg-[#d93025] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">V</span>
                </div>
              </div>
            </div>

            {/* Top Losers */}
            <div
              className="border-2 border-[#d93025] rounded-xl p-4 bg-white shadow-md relative overflow-hidden h-28"
              style={{ boxShadow: "0 4px 6px -1px rgba(217, 48, 37, 0.3)" }}
            >
              <h4 className="text-xl font-bold mb-3">Top Losers</h4>
              <div className="flex space-x-2">
                <div className="w-10 h-10 bg-[#00accf] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">N</span>
                </div>
              </div>
            </div>

            {/* Crypto */}
            <div
              className="border-2 border-[#000fb3] rounded-xl p-4 bg-white shadow-md relative overflow-hidden h-28"
              style={{ boxShadow: "0 4px 6px -1px rgba(0, 15, 179, 0.3)" }}
            >
              <h4 className="text-xl font-bold mb-3">Crypto</h4>
              <div className="flex space-x-2">
                <div className="w-10 h-10 bg-[#ff9500] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">₿</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Cards - First Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* NVDA */}
          <div
            className="bg-white rounded-xl p-5 shadow-lg"
            style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                <div className="w-14 h-10 bg-[#0fae37]"></div>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-center mb-1">NVDA</h4>
            <p className="text-center text-gray-500 text-sm mb-2">NVIDIA CORP</p>
            <p className="text-center text-[#0fae37] text-xl font-bold mb-2">+6.91%</p>
            <div className="h-8 mt-2">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,15 Q10,5 20,20 T40,10 T60,15 T80,5 L100,10" fill="none" stroke="#0fae37" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* BRK.A */}
          <div
            className="bg-white rounded-xl p-5 shadow-lg"
            style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-[#000fb3] rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">BH</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-center mb-1">BRK.A</h4>
            <p className="text-center text-gray-500 text-sm truncate mb-2">BERKSHIRE HATHAW...</p>
            <p className="text-center text-[#0fae37] text-xl font-bold mb-2">+1.92%</p>
            <div className="h-8 mt-2">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,10 Q10,5 30,15 T50,10 T70,20 L100,25" fill="none" stroke="#0fae37" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* AMC */}
          <div
            className="bg-white rounded-xl p-5 shadow-lg"
            style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-[#d93025] rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">AMC</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-center mb-1">AMC</h4>
            <p className="text-center text-gray-500 text-sm truncate mb-2">AMC ENTERTAINM...</p>
            <p className="text-center text-[#d93025] text-xl font-bold mb-2">-2.73%</p>
            <div className="h-8 mt-2">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,10 Q20,15 40,20 T60,25 T80,15 L100,30" fill="none" stroke="#d93025" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* TSLA */}
          <div
            className="bg-white rounded-xl p-5 shadow-lg"
            style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-[#d93025] rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">T</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-center mb-1">TSLA</h4>
            <p className="text-center text-gray-500 text-sm mb-2">TESLA INC</p>
            <p className="text-center text-[#0fae37] text-xl font-bold mb-2">+2.06%</p>
            <div className="h-8 mt-2">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,20 Q10,10 30,15 T50,5 T70,20 L100,15" fill="none" stroke="#0fae37" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Additional Stock Cards - For Vertical Scrolling */}
        <h3 className="text-2xl font-bold mb-6">More Stocks</h3>
        <div className="grid grid-cols-2 gap-4 mb-20">
          {/* AAPL */}
          <div
            className="bg-white rounded-xl p-5 shadow-lg"
            style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">🍎</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-center mb-1">AAPL</h4>
            <p className="text-center text-gray-500 text-sm mb-2">APPLE INC</p>
            <p className="text-center text-[#0fae37] text-xl font-bold mb-2">+1.45%</p>
            <div className="h-8 mt-2">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,15 Q20,10 40,20 T60,5 T80,15 L100,10" fill="none" stroke="#0fae37" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* MSFT */}
          <div
            className="bg-white rounded-xl p-5 shadow-lg"
            style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-[#00a4ef] rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">M</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-center mb-1">MSFT</h4>
            <p className="text-center text-gray-500 text-sm mb-2">MICROSOFT CORP</p>
            <p className="text-center text-[#0fae37] text-xl font-bold mb-2">+2.31%</p>
            <div className="h-8 mt-2">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,20 Q20,15 40,5 T60,15 T80,10 L100,5" fill="none" stroke="#0fae37" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* GOOG */}
          <div
            className="bg-white rounded-xl p-5 shadow-lg"
            style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-white rounded-full border flex items-center justify-center">
                <span className="text-[#4285F4] text-2xl font-bold">G</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-center mb-1">GOOG</h4>
            <p className="text-center text-gray-500 text-sm mb-2">ALPHABET INC</p>
            <p className="text-center text-[#0fae37] text-xl font-bold mb-2">+0.87%</p>
            <div className="h-8 mt-2">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,15 Q10,20 30,10 T50,15 T70,5 L100,10" fill="none" stroke="#0fae37" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* META */}
          <div
            className="bg-white rounded-xl p-5 shadow-lg"
            style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-[#0668E1] rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">META</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-center mb-1">META</h4>
            <p className="text-center text-gray-500 text-sm mb-2">META PLATFORMS</p>
            <p className="text-center text-[#d93025] text-xl font-bold mb-2">-0.53%</p>
            <div className="h-8 mt-2">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,10 Q20,15 40,10 T60,20 T80,15 L100,20" fill="none" stroke="#d93025" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
