import { createServerSupabaseClient } from "./supabase"

export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume?: number
  marketCap?: number
  logo?: string
}

// Mock stock data for fallback
const mockStocks: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 175.43,
    change: 2.15,
    changePercent: 1.24,
    volume: 45678900,
    marketCap: 2800000000000,
    logo: "🍎",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.56,
    change: -1.23,
    changePercent: -0.85,
    volume: 23456789,
    marketCap: 1800000000000,
    logo: "🔍",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 378.85,
    change: 4.67,
    changePercent: 1.25,
    volume: 34567890,
    marketCap: 2900000000000,
    logo: "🪟",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 248.42,
    change: -8.15,
    changePercent: -3.18,
    volume: 67890123,
    marketCap: 790000000000,
    logo: "🚗",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 875.28,
    change: 15.67,
    changePercent: 1.82,
    volume: 45123678,
    marketCap: 2200000000000,
    logo: "🎮",
  },
]

export async function getStocks(): Promise<Stock[]> {
  try {
    const supabase = createServerSupabaseClient()

    // Try to get stocks from database
    const { data: stocks, error } = await supabase.from("stock_cache").select("*").order("symbol")

    if (error) {
      console.warn("Failed to fetch stocks from database:", error)
      return mockStocks
    }

    if (!stocks || stocks.length === 0) {
      return mockStocks
    }

    // Transform database data to Stock interface
    return stocks.map((stock) => ({
      symbol: stock.symbol,
      name: stock.name || stock.symbol,
      price: Number.parseFloat(stock.price) || 0,
      change: Number.parseFloat(stock.change) || 0,
      changePercent: Number.parseFloat(stock.change_percent) || 0,
      volume: stock.volume ? Number.parseInt(stock.volume) : undefined,
      marketCap: stock.market_cap ? Number.parseInt(stock.market_cap) : undefined,
      logo: getStockLogo(stock.symbol),
    }))
  } catch (error) {
    console.error("Error fetching stocks:", error)
    return mockStocks
  }
}

export async function getStock(symbol: string): Promise<Stock | null> {
  try {
    const supabase = createServerSupabaseClient()

    const { data: stock, error } = await supabase
      .from("stock_cache")
      .select("*")
      .eq("symbol", symbol.toUpperCase())
      .single()

    if (error || !stock) {
      // Return mock data for the requested symbol
      const mockStock = mockStocks.find((s) => s.symbol === symbol.toUpperCase())
      return mockStock || null
    }

    return {
      symbol: stock.symbol,
      name: stock.name || stock.symbol,
      price: Number.parseFloat(stock.price) || 0,
      change: Number.parseFloat(stock.change) || 0,
      changePercent: Number.parseFloat(stock.change_percent) || 0,
      volume: stock.volume ? Number.parseInt(stock.volume) : undefined,
      marketCap: stock.market_cap ? Number.parseInt(stock.market_cap) : undefined,
      logo: getStockLogo(stock.symbol),
    }
  } catch (error) {
    console.error("Error fetching stock:", error)
    return null
  }
}

function getStockLogo(symbol: string): string {
  const logos: Record<string, string> = {
    AAPL: "🍎",
    GOOGL: "🔍",
    GOOG: "🔍",
    MSFT: "🪟",
    TSLA: "🚗",
    NVDA: "🎮",
    AMZN: "📦",
    META: "👥",
    NFLX: "🎬",
    AMD: "💻",
    INTC: "🔧",
    CRM: "☁️",
    ORCL: "🗄️",
    ADBE: "🎨",
  }

  return logos[symbol] || "📈"
}
