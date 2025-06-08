export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatarUrl?: string
  createdAt: string
  updatedAt?: string
}

export interface Game {
  id: string
  gameCode: string
  name: string
  description?: string
  creatorId: string
  status: "waiting" | "active" | "completed"
  startingBalance: number
  createdAt: string
  participants?: GameParticipant[]
}

export interface GameParticipant {
  id: string
  gameId: string
  userId: string
  joinedAt: string
  currentBalance: number
  user?: User
}

export interface Portfolio {
  id: string
  userId: string
  gameId: string
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  stocks?: PortfolioStock[]
  updatedAt: string
}

export interface PortfolioStock {
  id: string
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number
}

export interface Trade {
  id: string
  userId: string
  gameId: string
  symbol: string
  type: "buy" | "sell"
  quantity: number
  price: number
  totalValue: number
  createdAt: string
}

export interface ActivityPost {
  id: string
  userId: string
  gameId: string
  content: string
  type: "trade" | "achievement" | "general"
  metadata?: Record<string, any>
  createdAt: string
  user?: User
  likes?: Like[]
  comments?: Comment[]
}

export interface Like {
  id: string
  postId: string
  userId: string
  createdAt: string
}

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: string
  user?: User
}

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume?: number
  marketCap?: number
  peRatio?: number
  dividendYield?: number
  high52Week?: number
  low52Week?: number
  updatedAt: string
}

export interface LeaderboardEntry {
  id: string
  userId: string
  currentBalance: number
  totalGainLoss: number
  totalGainLossPercent: number
  rank: number
  user?: User
}

// Input types for mutations
export interface CreateUserInput {
  username: string
  email: string
  displayName: string
  avatarUrl?: string
}

export interface UpdateUserInput {
  username?: string
  email?: string
  displayName?: string
  avatarUrl?: string
}

export interface CreateGameInput {
  gameCode: string
  name: string
  description?: string
  creatorId: string
  startingBalance: number
}

export interface CreateTradeInput {
  userId: string
  gameId: string
  symbol: string
  type: "buy" | "sell"
  quantity: number
  price: number
  totalValue: number
}

export interface CreatePostInput {
  userId: string
  gameId: string
  content: string
  type: "trade" | "achievement" | "general"
  metadata?: Record<string, any>
}

export interface CreateCommentInput {
  postId: string
  userId: string
  content: string
}

export interface UpdatePortfolioInput {
  userId: string
  gameId: string
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
}
