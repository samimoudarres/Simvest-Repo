"use client"

import { useRouter } from "next/navigation"
import { categories } from "@/lib/data"
import TouchFeedback from "@/components/touch-feedback"

export default function CategorySection() {
  const router = useRouter()

  return (
    <div className="mb-8 overflow-x-auto -mx-5 px-5 pb-4 scrollbar-thin scrollbar-thumb-gray-300">
      <div className="inline-grid grid-cols-3 grid-rows-2 gap-4 min-w-[600px]">
        {categories.map((category) => (
          <TouchFeedback
            key={category.id}
            className="border-2 rounded-xl p-4 bg-white shadow-md relative overflow-hidden h-28 cursor-pointer"
            onClick={() => router.push(`/category/${category.id}`)}
          >
            <div
              className="absolute inset-0 border-2 rounded-xl pointer-events-none"
              style={{ borderColor: category.borderColor }}
            ></div>
            <h4 className="text-xl font-bold mb-3">{category.name}</h4>
            <div className="flex items-center">
              {category.icons.slice(0, 3).map((icon, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 1 ? "-mt-2" : ""
                  } ${index > 0 ? "-ml-2" : ""}`}
                  style={{ backgroundColor: icon.bgColor, zIndex: 3 - index }}
                >
                  <span className={`text-${icon.textColor} text-sm`}>{icon.symbol}</span>
                </div>
              ))}
            </div>
          </TouchFeedback>
        ))}
      </div>
    </div>
  )
}
