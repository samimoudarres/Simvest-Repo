"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Camera } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import { useEffect, useState } from "react"

export default function ScanQRCodePage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)

  // Simulate scanning process
  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        // Simulate successful scan
        router.push("/join-game/info")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [scanning, router])

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center">
          <TouchFeedback className="text-white p-2" onClick={() => router.push("/join-game")}>
            <ArrowLeft size={24} />
          </TouchFeedback>
          <h1 className="text-white text-xl font-bold ml-2">Scan QR Code</h1>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 flex flex-col items-center justify-center p-5">
        <div className="w-full aspect-square max-w-md bg-black/50 rounded-lg relative mb-8">
          {/* Simulated camera view */}
          <div className="absolute inset-0 flex items-center justify-center">
            {scanning ? (
              <div className="w-16 h-16 border-4 border-[#0052cc] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Camera size={64} className="text-white/50" />
            )}
          </div>

          {/* Scan area overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 border-2 border-[#0052cc] rounded-lg"></div>
          </div>
        </div>

        <p className="text-white text-center mb-8">Position the QR code within the frame to scan</p>

        <TouchFeedback
          className="w-full max-w-xs py-4 bg-gradient-to-r from-[#0052cc] to-[#2684ff] text-white font-bold rounded-xl text-center shadow-md"
          onClick={() => setScanning(true)}
        >
          {scanning ? "Scanning..." : "Start Scanning"}
        </TouchFeedback>
      </div>
    </div>
  )
}
