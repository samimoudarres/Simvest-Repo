"use client"

import type { PropsWithChildren } from "react"

const MobileContainer = ({ children }: PropsWithChildren) => {
  return <div className="max-w-[375px] mx-auto">{children}</div>
}

export default MobileContainer
