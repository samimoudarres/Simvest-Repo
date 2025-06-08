"use client"

import { useState } from "react"

interface PortfolioItem {
  symbol: string
  percentOfAccount: number
  totalValue: number
  logoBackground: string
  category?: string
}

interface PortfolioDiversificationChartProps {
  portfolioData: PortfolioItem[]
}

export default function PortfolioDiversificationChart({ portfolioData }: PortfolioDiversificationChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  // Add a state for the clicked segment
  const [clickedSegment, setClickedSegment] = useState<string | null>(null)

  // Sort data by percentage (descending)
  const sortedData = [...portfolioData].sort((a, b) => b.percentOfAccount - a.percentOfAccount)

  // Group by category if available
  const categoryData: Record<string, { totalValue: number; percentOfAccount: number; items: PortfolioItem[] }> = {}

  sortedData.forEach((item) => {
    const category = item.category || "Other"
    if (!categoryData[category]) {
      categoryData[category] = {
        totalValue: 0,
        percentOfAccount: 0,
        items: [],
      }
    }
    categoryData[category].totalValue += item.totalValue
    categoryData[category].percentOfAccount += item.percentOfAccount
    categoryData[category].items.push(item)
  })

  // Generate chart segments with solid colors
  const generateChartSegments = () => {
    let cumulativePercent = 0
    const segments = []

    // Define solid color blues
    const solidBlues = [
      "#0052cc",
      "#1a67d2",
      "#3373d9",
      "#4d85e0",
      "#66a3e6",
      "#80c0ec",
      "#0747a6",
      "#2148ac",
      "#3b49b2",
      "#554bb9",
      "#704dbf",
      "#8a50c5",
    ]

    // Create segments
    Object.entries(categoryData).forEach(([category, data], index) => {
      const startPercent = cumulativePercent
      cumulativePercent += data.percentOfAccount

      // Calculate angles for the segment
      const startAngle = (startPercent / 100) * 360
      const endAngle = (cumulativePercent / 100) * 360

      // Calculate SVG arc path
      const startRad = ((startAngle - 90) * Math.PI) / 180
      const endRad = ((endAngle - 90) * Math.PI) / 180

      const x1 = 50 + 40 * Math.cos(startRad)
      const y1 = 50 + 40 * Math.sin(startRad)
      const x2 = 50 + 40 * Math.cos(endRad)
      const y2 = 50 + 40 * Math.sin(endRad)

      // Determine if the arc should be drawn as a large arc
      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

      // Create the path for the segment
      const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

      // Calculate label position
      const midAngle = (startAngle + endAngle) / 2
      const midRad = ((midAngle - 90) * Math.PI) / 180
      const labelX = 50 + 30 * Math.cos(midRad)
      const labelY = 50 + 30 * Math.sin(midRad)

      segments.push({
        path,
        solidColor: solidBlues[index % solidBlues.length],
        labelX,
        labelY,
        category,
        percent: data.percentOfAccount,
        totalValue: data.totalValue,
        items: data.items,
      })
    })

    return { segments }
  }

  const { segments } = generateChartSegments()

  // Calculate total portfolio value
  const totalValue = portfolioData.reduce((sum, item) => sum + item.totalValue, 0)

  return (
    <div className="w-full relative">
      <h3 className="text-xl font-bold tracking-wider mb-4">PORTFOLIO DIVERSIFICATION</h3>

      <div className="relative w-full aspect-square max-w-md mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Chart segments */}
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.path}
                fill={segment.solidColor}
                stroke="white"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredSegment(segment.category)}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => setClickedSegment(segment.category === clickedSegment ? null : segment.category)}
                className="transition-opacity duration-200 cursor-pointer"
                style={{ opacity: hoveredSegment && hoveredSegment !== segment.category ? 0.7 : 1 }}
              />

              {/* Labels for larger segments */}
              {segment.percent >= 8 && (
                <text
                  x={segment.labelX}
                  y={segment.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="3"
                  fontWeight="bold"
                  fill="white"
                  className="pointer-events-none"
                >
                  {segment.category}
                </text>
              )}
            </g>
          ))}

          {/* Center circle (donut hole) */}
          <circle cx="50" cy="50" r="22" fill="white" />

          {/* Center text */}
          <text x="50" y="48" textAnchor="middle" fontSize="6" fontWeight="bold" fill="black">
            ${totalValue.toLocaleString()}
          </text>
          <text x="50" y="54" textAnchor="middle" fontSize="3" fontWeight="500" fill="#666" letterSpacing="0.2">
            TOTAL VALUE
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {segments.map((segment, index) => (
          <div
            key={index}
            className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => setClickedSegment(segment.category === clickedSegment ? null : segment.category)}
          >
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.solidColor }}></div>
            <p className="text-sm font-medium">{segment.category}</p>
            <p className="text-xs text-gray-500 ml-auto">{segment.percent.toFixed(1)}%</p>
          </div>
        ))}
      </div>

      {/* Tooltip that appears when a segment is clicked */}
      {clickedSegment && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-xl shadow-lg border border-gray-200 z-10">
          <button
            className="absolute top-2 right-2 text-gray-500"
            onClick={(e) => {
              e.stopPropagation()
              setClickedSegment(null)
            }}
          >
            ✕
          </button>
          <h4 className="font-bold text-lg mb-2">{clickedSegment}</h4>
          <p className="text-sm text-gray-600 mb-1">
            {segments.find((s) => s.category === clickedSegment)?.percent.toFixed(2)}% of portfolio
          </p>
          <p className="text-sm font-medium">
            ${segments.find((s) => s.category === clickedSegment)?.totalValue.toLocaleString()}
          </p>

          <div className="mt-3 pt-3 border-t">
            <h5 className="font-medium text-sm mb-2">Holdings</h5>
            <div className="max-h-40 overflow-y-auto">
              {segments
                .find((s) => s.category === clickedSegment)
                ?.items.map((item, idx) => (
                  <div key={idx} className="flex items-center py-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                      style={{ backgroundColor: item.logoBackground }}
                    >
                      <span className="text-white text-xs font-bold">{item.symbol.charAt(0)}</span>
                    </div>
                    <span className="text-sm">{item.symbol}</span>
                    <span className="text-xs text-gray-500 ml-auto">${item.totalValue.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
