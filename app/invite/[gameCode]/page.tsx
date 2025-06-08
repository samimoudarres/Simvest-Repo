"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Copy, Share, QrCode, Check, MessageCircle, Mail } from "lucide-react"

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const gameCode = params.gameCode as string
  const [copied, setCopied] = useState(false)
  const [gameLink, setGameLink] = useState("")

  useEffect(() => {
    const link = `${window.location.origin}/join-game?code=${gameCode}`
    setGameLink(link)
  }, [gameCode])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(gameLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = gameLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: "Join my Stock Trading Game!",
      text: `Join my stock trading challenge with code: ${gameCode}`,
      url: gameLink,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error("Error sharing:", error)
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`Join my stock trading challenge! Use code: ${gameCode} or click: ${gameLink}`)
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const handleSMSShare = () => {
    const message = encodeURIComponent(`Join my stock trading challenge! Use code: ${gameCode} or click: ${gameLink}`)
    window.open(`sms:?body=${message}`, "_blank")
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Join my Stock Trading Game!")
    const body = encodeURIComponent(
      `Join my stock trading challenge!\n\nGame Code: ${gameCode}\nDirect Link: ${gameLink}`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")
  }

  const generateQRCode = (text: string) => {
    // Using QR Server API for QR code generation
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=000000&margin=10`
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#f7b104] to-[#d48f03]">
      {/* Header */}
      <div className="p-5 pt-12 safe-area-top">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="text-white p-2 transition-transform duration-100 active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white text-xl font-bold">Invite Players</h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-t-3xl p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Join My Trading Game!</h2>
          <p className="text-gray-600">Share this code or scan the QR code to join the challenge</p>
        </div>

        {/* Game Code */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-center">
          <p className="text-gray-600 text-sm mb-2">Game Code</p>
          <p className="text-4xl font-bold text-gray-900 tracking-wider mb-4">{gameCode}</p>
          <p className="text-gray-500 text-sm">Players can enter this code to join your game</p>
        </div>

        {/* QR Code */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 mb-6 text-center">
          <div className="flex justify-center mb-4">
            <img
              src={generateQRCode(gameLink) || "/placeholder.svg"}
              alt="QR Code"
              className="w-48 h-48 rounded-xl"
              onError={(e) => {
                // Fallback if QR code fails to load
                e.currentTarget.src = "/placeholder.svg?height=192&width=192&text=QR+Code"
              }}
            />
          </div>
          <div className="flex items-center justify-center text-gray-600 mb-2">
            <QrCode size={18} className="mr-2" />
            <span className="text-sm">Scan to join instantly</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center py-4 bg-[#0052cc] text-white font-bold rounded-xl transition-all duration-200 active:scale-[0.98] hover:bg-[#0041a3]"
          >
            {copied ? (
              <>
                <Check size={20} className="mr-2" />
                Link Copied!
              </>
            ) : (
              <>
                <Copy size={20} className="mr-2" />
                Copy Game Link
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center py-4 bg-gray-100 text-gray-900 font-bold rounded-xl transition-all duration-200 active:scale-[0.98] hover:bg-gray-200"
          >
            <Share size={20} className="mr-2" />
            Share Game
          </button>
        </div>

        {/* Social Sharing Options */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Share via</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center p-4 bg-green-50 border border-green-200 rounded-xl transition-all duration-200 active:scale-95 hover:bg-green-100"
            >
              <MessageCircle size={24} className="text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-700">WhatsApp</span>
            </button>

            <button
              onClick={handleSMSShare}
              className="flex flex-col items-center p-4 bg-blue-50 border border-blue-200 rounded-xl transition-all duration-200 active:scale-95 hover:bg-blue-100"
            >
              <MessageCircle size={24} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-700">SMS</span>
            </button>

            <button
              onClick={handleEmailShare}
              className="flex flex-col items-center p-4 bg-purple-50 border border-purple-200 rounded-xl transition-all duration-200 active:scale-95 hover:bg-purple-100"
            >
              <Mail size={24} className="text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-700">Email</span>
            </button>
          </div>
        </div>

        {/* Game Link Display */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-600 text-xs mb-2">Game Link:</p>
          <p className="text-gray-800 text-sm break-all font-mono">{gameLink}</p>
        </div>
      </div>
    </div>
  )
}
