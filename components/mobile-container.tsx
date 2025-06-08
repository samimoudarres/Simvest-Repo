"use client"

import type { ReactNode } from "react"

interface MobileContainerProps {
  children: ReactNode
  className?: string
}

export default function MobileContainer({ children, className = "" }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start">
      {/* Mobile App Container - CRITICAL FIX */}
      <div
        className={`w-full bg-white shadow-2xl relative overflow-hidden ${className}`}
        style={{
          maxWidth: "430px",
          minHeight: "100vh",
          margin: "0 auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>
    </div>
  )
}
