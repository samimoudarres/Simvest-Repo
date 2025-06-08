import { createClientSupabaseClient } from "./supabase"

export type TradeResult = {
  success: boolean
  error?: string
  newCashBalance?: number
  newStockQuantity?: number
}

export type PortfolioData = {
  cash_balance: number
  total_portfolio_value: number
  stocks: Array<{
    symbol: string
    quantity: number
    avg_price: number
    current_value: number
  }>
}

const supabase = createClientSupabaseClient()

// Execute trade with proper cash balance updates
export async function executeTradeWithCashUpdate(
  userId: string,
  gameId: string,
  stockSymbol: string,
  quantity: number,
  price: number,
  tradeType: "buy" | "sell",
): Promise<TradeResult> {
  try {
    console.log("🔄 Starting trade execution:", { userId, gameId, stockSymbol, quantity, price, tradeType })

    const totalAmount = quantity * price

    // Get current portfolio
    let { data: portfolio, error: portfolioError } = await supabase
      .from("user_portfolios")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single()

    // Create portfolio if it doesn't exist
    if (portfolioError?.code === "PGRST116") {
      console.log("📝 Creating new portfolio for user")
      const { error: createError } = await supabase.from("user_portfolios").insert({
        user_id: userId,
        game_id: gameId,
        cash_balance: 100000,
        total_portfolio_value: 100000,
      })

      if (createError) {
        console.error("❌ Error creating portfolio:", createError)
        return { success: false, error: "Failed to create portfolio" }
      }

      // Fetch the newly created portfolio
      const { data: newPortfolio, error: fetchError } = await supabase
        .from("user_portfolios")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameId)
        .single()

      if (fetchError) {
        console.error("❌ Error fetching new portfolio:", fetchError)
        return { success: false, error: "Failed to fetch portfolio" }
      }

      portfolio = newPortfolio
    } else if (portfolioError) {
      console.error("❌ Error fetching portfolio:", portfolioError)
      return { success: false, error: "Failed to fetch portfolio" }
    }

    // Check if user has enough cash for buy orders
    if (tradeType === "buy" && portfolio.cash_balance < totalAmount) {
      console.error("❌ Insufficient funds:", { available: portfolio.cash_balance, required: totalAmount })
      return {
        success: false,
        error: `Insufficient funds. You have $${portfolio.cash_balance.toFixed(2)} but need $${totalAmount.toFixed(2)}`,
      }
    }

    // Calculate new cash balance
    const newCashBalance =
      tradeType === "buy" ? portfolio.cash_balance - totalAmount : portfolio.cash_balance + totalAmount

    console.log("💰 Cash balance update:", {
      current: portfolio.cash_balance,
      change: tradeType === "buy" ? -totalAmount : totalAmount,
      new: newCashBalance,
    })

    // Update cash balance first
    const { error: updateCashError } = await supabase
      .from("user_portfolios")
      .update({
        cash_balance: newCashBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("game_id", gameId)

    if (updateCashError) {
      console.error("❌ Error updating cash balance:", updateCashError)
      return { success: false, error: "Failed to update cash balance" }
    }

    // Record the trade
    const { error: tradeError } = await supabase.from("trades").insert({
      user_id: userId,
      game_id: gameId,
      stock_symbol: stockSymbol,
      quantity: quantity,
      price: price,
      trade_type: tradeType,
    })

    if (tradeError) {
      console.error("❌ Error recording trade:", tradeError)
      // Rollback cash balance
      await supabase
        .from("user_portfolios")
        .update({ cash_balance: portfolio.cash_balance })
        .eq("user_id", userId)
        .eq("game_id", gameId)
      return { success: false, error: "Failed to record trade" }
    }

    // Update stock holdings
    const { data: existingStock, error: stockError } = await supabase
      .from("user_stocks")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .eq("stock_symbol", stockSymbol)
      .single()

    let newStockQuantity = 0

    if (stockError?.code === "PGRST116") {
      // Create new stock holding for buy orders
      if (tradeType === "buy") {
        const { error: createStockError } = await supabase.from("user_stocks").insert({
          user_id: userId,
          game_id: gameId,
          stock_symbol: stockSymbol,
          quantity: quantity,
          avg_price: price,
        })

        if (createStockError) {
          console.error("❌ Error creating stock holding:", createStockError)
          return { success: false, error: "Failed to create stock holding" }
        }
        newStockQuantity = quantity
      }
    } else if (stockError) {
      console.error("❌ Error fetching stock:", stockError)
      return { success: false, error: "Failed to fetch stock data" }
    } else {
      // Update existing stock holding
      newStockQuantity =
        tradeType === "buy" ? existingStock.quantity + quantity : Math.max(0, existingStock.quantity - quantity)

      const newAvgPrice =
        tradeType === "buy" && existingStock.quantity > 0
          ? (existingStock.avg_price * existingStock.quantity + price * quantity) / newStockQuantity
          : existingStock.avg_price

      const { error: updateStockError } = await supabase
        .from("user_stocks")
        .update({
          quantity: newStockQuantity,
          avg_price: newAvgPrice,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingStock.id)

      if (updateStockError) {
        console.error("❌ Error updating stock holding:", updateStockError)
        return { success: false, error: "Failed to update stock holding" }
      }
    }

    console.log("✅ Trade executed successfully:", {
      newCashBalance,
      newStockQuantity,
      tradeType,
      stockSymbol,
    })

    return {
      success: true,
      newCashBalance,
      newStockQuantity,
    }
  } catch (error) {
    console.error("💥 Unexpected error in trade execution:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error occurred",
    }
  }
}

// Get user portfolio with real-time data
export async function getUserPortfolioData(userId: string, gameId: string): Promise<PortfolioData | null> {
  try {
    // Get portfolio summary
    const { data: portfolio, error: portfolioError } = await supabase
      .from("user_portfolios")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single()

    if (portfolioError) {
      console.error("Error fetching portfolio:", portfolioError)
      return null
    }

    // Get stock holdings
    const { data: stocks, error: stocksError } = await supabase
      .from("user_stocks")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .gt("quantity", 0)

    if (stocksError) {
      console.error("Error fetching stocks:", stocksError)
      return null
    }

    // Format stock data (you'd normally get current prices from an API)
    const formattedStocks = stocks.map((stock) => ({
      symbol: stock.stock_symbol,
      quantity: stock.quantity,
      avg_price: stock.avg_price,
      current_value: stock.quantity * stock.avg_price, // This would use current market price
    }))

    return {
      cash_balance: portfolio.cash_balance,
      total_portfolio_value: portfolio.total_portfolio_value,
      stocks: formattedStocks,
    }
  } catch (error) {
    console.error("Error getting portfolio data:", error)
    return null
  }
}

// Subscribe to portfolio changes
export function subscribeToPortfolioChanges(
  userId: string,
  gameId: string,
  callback: (portfolio: PortfolioData | null) => void,
) {
  const subscription = supabase
    .channel(`portfolio-${userId}-${gameId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_portfolios",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        getUserPortfolioData(userId, gameId).then(callback)
      },
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_stocks",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        getUserPortfolioData(userId, gameId).then(callback)
      },
    )
    .subscribe()

  return subscription
}
