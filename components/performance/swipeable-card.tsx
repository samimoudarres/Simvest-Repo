"use client"

import type React from "react"
import { useState, useRef } from "react"

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export default function SwipeableCard({ children, onSwipeLeft, onSwipeRight }: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSwiping) {
      const diff = e.touches[0].clientX - startX
      setCurrentX(diff)

      if (diff > 0) {
        setDirection("right")
      } else if (diff < 0) {
        setDirection("left")
      }
    }
  }

  const handleTouchEnd = () => {
    if (isSwiping) {
      if (currentX > 50 && onSwipeRight) {
        setIsAnimating(true)
        onSwipeRight()
      } else if (currentX < -50 && onSwipeLeft) {
        setIsAnimating(true)
        onSwipeLeft()
      }

      setCurrentX(0)
      setIsSwiping(false)

      // Reset direction after animation completes
      setTimeout(() => {
        setDirection(null)
        setIsAnimating(false)
      }, 300)
    }
  }

  // Add mouse event handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX)
    setIsSwiping(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSwiping) {
      const diff = e.clientX - startX
      setCurrentX(diff)

      if (diff > 0) {
        setDirection("right")
      } else if (diff < 0) {
        setDirection("left")
      }
    }
  }

  const handleMouseUp = () => {
    handleTouchEnd()
  }

  const handleMouseLeave = () => {
    if (isSwiping) {
      setCurrentX(0)
      setIsSwiping(false)
      setDirection(null)
    }
  }

  return (
    <div
      ref={cardRef}
      className={`
        ${isAnimating && direction === "left" ? "swipe-out-left" : ""}
        ${isAnimating && direction === "right" ? "swipe-out-right" : ""}
      `}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isSwiping ? `translateX(${currentX}px)` : "translateX(0)",
        transition: isSwiping ? "none" : "transform 0.3s ease-out",
      }}
    >
      {children}
    </div>
  )
}
