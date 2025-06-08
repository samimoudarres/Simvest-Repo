"use client"

import { useRouter } from "next/navigation"
import type { Category } from "@/lib/types"

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/category/${category.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className="border-2 rounded-xl p-4 bg-white shadow-md relative overflow-hidden h-28 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
      style={{
        borderColor: category.borderColor,
        boxShadow: `0 4px 6px -1px ${category.shadowColor}`,
      }}
    >
      <h4 className="text-xl font-bold mb-3">{category.name}</h4>
      <div className="flex space-x-2">
        {category.icons.map((icon, index) => (
          <div
            key={index}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: icon.bgColor }}
          >
            <span className={`text-${icon.textColor} text-sm`}>{icon.symbol}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
