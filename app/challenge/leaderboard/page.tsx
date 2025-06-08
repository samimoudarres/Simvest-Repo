"use client"

import { useState } from "react"
import { ArrowLeft, MoreVertical, ChevronDown } from "lucide-react"
import TouchFeedback from "@/components/touch-feedback"
import { useRouter } from "next/navigation"

export default function LeaderboardPage() {
  const router = useRouter()
  const [sortBy, setSortBy] = useState("Overall Return")
  const [sortOptions, setSortOptions] = useState(false)

  // Sort options
  const sortOptionsList = [
    { id: "overallReturn", label: "Overall Return" },
    { id: "todayReturn", label: "Today's Return" },
    { id: "totalValue", label: "Total Value" },
    { id: "alphabetical", label: "Alphabetical" },
  ]

  // Expanded leaderboard data with 35 players and diverse performance
  const leaderboardData = [
    {
      name: "Mike Ross",
      username: "@Mikeross9012",
      value: 124980,
      return: 24.98,
      avatar: "/diverse-group.png",
    },
    {
      name: "Jessica Marquez",
      username: "@jcmarquez",
      value: 121762,
      return: 21.76,
      avatar: "/diverse-woman-portrait.png",
    },
    {
      name: "Patrick Riordan",
      username: "@Pman15890",
      value: 118204,
      return: 18.2,
      avatar: "/thoughtful-man-glasses.png",
    },
    {
      name: "Matilda Shane",
      username: "@Matilda6213",
      value: 117391,
      return: 17.39,
      avatar: "/woman-with-glasses.png",
    },
    {
      name: "Jerry Klover",
      username: "@4leafklover",
      value: 115122,
      return: 15.12,
      avatar: "/bearded-man-portrait.png",
    },
    {
      name: "PJ Skidoo",
      username: "@Pjskidooooo",
      value: 115019,
      return: 15.02,
      avatar: "/young-man-contemplative.png",
    },
    {
      name: "Felix Jerome",
      username: "@Thefelixi",
      value: 106975,
      return: 6.98,
      avatar: "/smiling-man.png",
    },
    {
      name: "Sarah Johnson",
      username: "@sarahj",
      value: 105432,
      return: 5.43,
      avatar: "/woman-brown-hair.png",
    },
    {
      name: "David Chen",
      username: "@dchen",
      value: 104876,
      return: 4.88,
      avatar: "/asian-man-glasses.png",
    },
    {
      name: "Olivia Williams",
      username: "@oliviaw",
      value: 103215,
      return: 3.22,
      avatar: "/blonde-woman-portrait.png",
    },
    {
      name: "Marcus Brown",
      username: "@mbrown",
      value: 102543,
      return: 2.54,
      avatar: "/black-man-with-beard.png",
    },
    {
      name: "Emma Thompson",
      username: "@ethompson",
      value: 101876,
      return: 1.88,
      avatar: "/red-haired-woman.png",
    },
    {
      name: "James Wilson",
      username: "@jwilson",
      value: 100932,
      return: 0.93,
      avatar: "/short-haired-man.png",
    },
    {
      name: "Sophia Garcia",
      username: "@sgarcia",
      value: 100421,
      return: 0.42,
      avatar: "/latina-woman-smiling.png",
    },
    {
      name: "Ethan Miller",
      username: "@emiller",
      value: 100087,
      return: 0.09,
      avatar: "/young-man-glasses.png",
    },
    {
      name: "Ava Martinez",
      username: "@amartinez",
      value: 99876,
      return: -0.12,
      avatar: "/young-latina-woman.png",
    },
    {
      name: "Noah Davis",
      username: "@ndavis",
      value: 99543,
      return: -0.46,
      avatar: "/curly-haired-man.png",
    },
    {
      name: "Isabella Lopez",
      username: "@ilopez",
      value: 99102,
      return: -0.9,
      avatar: "/woman-long-dark-hair.png",
    },
    {
      name: "William Taylor",
      username: "@wtaylor",
      value: 98765,
      return: -1.24,
      avatar: "/older-man-gray-hair.png",
    },
    {
      name: "Mia Anderson",
      username: "@manderson",
      value: 98321,
      return: -1.68,
      avatar: "/short-haired-woman.png",
    },
    {
      name: "Benjamin Thomas",
      username: "@bthomas",
      value: 97654,
      return: -2.35,
      avatar: "/bearded-man-portrait.png",
    },
    {
      name: "Charlotte White",
      username: "@cwhite",
      value: 97123,
      return: -2.88,
      avatar: "/woman-with-glasses.png",
    },
    {
      name: "Daniel Harris",
      username: "@dharris",
      value: 96543,
      return: -3.46,
      avatar: "/dark-haired-man.png",
    },
    {
      name: "Amelia Clark",
      username: "@aclark",
      value: 95876,
      return: -4.12,
      avatar: "/curly-haired-woman.png",
    },
    {
      name: "Henry Lewis",
      username: "@hlewis",
      value: 95234,
      return: -4.77,
      avatar: "/young-man-blonde-hair.png",
    },
    {
      name: "Evelyn Walker",
      username: "@ewalker",
      value: 94567,
      return: -5.43,
      avatar: "/older-woman-gray-hair.png",
    },
    {
      name: "Alexander Hall",
      username: "@ahall",
      value: 93876,
      return: -6.12,
      avatar: "/placeholder.svg?height=60&width=60&query=man with glasses",
    },
    {
      name: "Abigail Young",
      username: "@ayoung",
      value: 93210,
      return: -6.79,
      avatar: "/woman-brown-hair.png",
    },
    {
      name: "Michael King",
      username: "@mking",
      value: 92543,
      return: -7.46,
      avatar: "/placeholder.svg?height=60&width=60&query=older man with beard",
    },
    {
      name: "Emily Wright",
      username: "@ewright",
      value: 91876,
      return: -8.12,
      avatar: "/blonde-woman-portrait.png",
    },
    {
      name: "Jacob Scott",
      username: "@jscott",
      value: 90543,
      return: -9.46,
      avatar: "/placeholder.svg?height=60&width=60&query=young man with dark hair",
    },
    {
      name: "Madison Green",
      username: "@mgreen",
      value: 89765,
      return: -10.24,
      avatar: "/red-haired-woman.png",
    },
    {
      name: "Ethan Adams",
      username: "@eadams",
      value: 88432,
      return: -11.57,
      avatar: "/short-haired-man.png",
    },
    {
      name: "Olivia Baker",
      username: "@obaker",
      value: 87654,
      return: -12.35,
      avatar: "/woman-with-glasses.png",
    },
    {
      name: "Ryan Nelson",
      username: "@rnelson",
      value: 85432,
      return: -14.57,
      avatar: "/curly-haired-man.png",
    },
  ]

  // Handle sort selection
  const handleSortChange = (option: string) => {
    setSortBy(option)
    setSortOptions(false)

    // Sort logic would go here in a real app
  }

  // Handle user profile navigation
  const handleUserClick = (username: string) => {
    router.push(`/profile/${username.replace("@", "")}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F7F7] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#F7B104] to-[#B26F03] p-4">
        <div className="flex items-center justify-between mb-3">
          <TouchFeedback onClick={() => router.push("/challenge")}>
            <ArrowLeft size={24} className="text-white" />
          </TouchFeedback>
          <TouchFeedback>
            <MoreVertical size={24} className="text-white" />
          </TouchFeedback>
        </div>

        <h1 className="text-white text-3xl font-bold mb-1">Nov. 2024 Stock Challenge</h1>
        <p className="text-white text-lg mb-4">Hosted by John Smith</p>

        <div className="flex -space-x-2 mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
            >
              <img
                src={`/diverse-group.png?height=40&width=40&query=person ${i}`}
                alt="Player"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <TouchFeedback className="ml-4 bg-white text-[#F7B104] font-bold px-4 py-1 rounded-full flex items-center">
            <span className="mr-1">+</span> Invite
          </TouchFeedback>
        </div>

        <p className="text-white text-sm">Charlie Brown, Marley Woodson, Devin Michaels, and 32 others</p>
      </div>

      {/* Leaderboard Content */}
      <div className="flex justify-between items-center p-4 bg-white">
        <h2 className="text-black text-xl font-bold">35 PLAYERS</h2>
        <TouchFeedback className="flex items-center" onClick={() => setSortOptions(!sortOptions)}>
          <span className="mr-1 font-medium">{sortBy}</span>
          <ChevronDown size={18} className={`transition-transform ${sortOptions ? "rotate-180" : ""}`} />
        </TouchFeedback>

        {/* Sort Options Dropdown */}
        {sortOptions && (
          <div className="absolute right-4 top-[13.5rem] bg-white shadow-lg rounded-lg z-30 w-48">
            {sortOptionsList.map((option) => (
              <TouchFeedback
                key={option.id}
                className={`w-full text-left p-3 hover:bg-gray-100 ${sortBy === option.label ? "font-bold bg-gray-50" : ""}`}
                onClick={() => handleSortChange(option.label)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{option.label}</span>
                </div>
              </TouchFeedback>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard List - Now with all 35 players */}
      <div className="flex-1 bg-white overflow-y-auto">
        {leaderboardData.map((player, index) => (
          <TouchFeedback
            key={index}
            className="border-b border-gray-100 last:border-b-0"
            onClick={() => handleUserClick(player.username)}
          >
            <div className="flex items-center p-4">
              <div className="relative">
                <img
                  src={player.avatar || "/placeholder.svg"}
                  alt={player.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#F7B104]"
                />
                {index < 3 && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#F7B104] flex items-center justify-center text-white font-bold text-xs">
                    {index + 1}
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="font-bold text-lg">{player.name}</h3>
                <p className="text-gray-500">{player.username}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${player.value.toLocaleString()}</p>
                <div
                  className={`${
                    player.return >= 0 ? "bg-[#0fae37] text-white" : "bg-[#d93025] text-white"
                  } font-bold px-2 py-1 rounded-md inline-block`}
                >
                  {player.return >= 0 ? "+" : ""}
                  {player.return}%
                </div>
              </div>
            </div>
          </TouchFeedback>
        ))}
      </div>
    </div>
  )
}
