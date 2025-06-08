"use client"

import { useState } from "react"
import type React from "react"

interface TouchFeedbackProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

export default function TouchFeedback({
  children,
  className = "",
  onClick,
  type,
  disabled = false,
}: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return

    if (onClick) {
      onClick()
    }
  }

  // Use button element for proper semantics and accessibility
  return (
    <button
      type={type || "button"}
      className={`${className} transition-transform duration-100 ${isPressed && !disabled ? "scale-95 opacity-90" : ""}`}
      onTouchStart={() => !disabled && setIsPressed(true)}
      onTouchEnd={() => !disabled && setIsPressed(false)}
      onTouchCancel={() => !disabled && setIsPressed(false)}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => !disabled && setIsPressed(false)}
      onMouseLeave={() => !disabled && setIsPressed(false)}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
