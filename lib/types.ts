export interface Category {
  id: string
  name: string
  borderColor: string
  shadowColor: string
  icons: {
    bgColor: string
    textColor: string
    symbol: string
  }[]
}

export interface Stock {
  symbol: string
  name: string
  price: number
  changePercent: number
  logoBackground: string
  logoType: "text" | "image" | "emoji"
  logoText?: string
  logoColor?: string
  logoEmoji?: string
  chartPath: string
  category: string[]
  historicalData?: {
    date: string
    price: number
  }[]
}
