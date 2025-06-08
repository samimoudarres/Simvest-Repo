import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import MobileContainer from "@/components/mobile-container"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SimVest - Social Stock Trading Game",
  description: "Trade stocks with friends in competitive challenges",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <MobileContainer>{children}</MobileContainer>
        </AuthProvider>
      </body>
    </html>
  )
}
