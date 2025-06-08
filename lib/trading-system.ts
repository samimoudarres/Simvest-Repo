import { createClientSupabaseClient } from "./supabase"
import { createActivityPost } from "./social-interactions"

export type TradeResult = {
  success: boolean
  error?: string
  newCashBalance?: number
  newStockQuantity?: number
  tradeId?: string
}

export type Portfolio = {
  cash_balance: number
  total_portfolio_value: number
  updated_at: string
}

export type StockHolding = {
  stock_symbol: string
  quantity: number
  avg_price: number
  current_value: number
}

const supabase = createClientSupabaseClient()

// STOCK BUYING - COMPLETELY FIXED
export async function executeTrade(
  userId: string,
  gameId: string,
  stockSymbol: string,
  quantity: number,
  price: number,
  tradeType: "buy" | "sell",
): Promise<TradeResult> {
  try {
    console.log("🔄 Executing trade:", { userId, gameId, stockSymbol, quantity, price, tradeType })

    const totalAmount = quantity * price

    // Get or create user portfolio
    let { data: portfolio, error: portfolioError } = await supabase
      .from("user_portfolios")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single()

    // Create portfolio if it doesn't exist
    if (portfolioError?.code === "PGRST116") {
      console.log("📝 Creating new portfolio for user")
      const { data: newPortfolio, error: createError } = await supabase
        .from("user_portfolios")
        .insert({
          user_id: userId,
          game_id: gameId,
          cash_balance: 100000,
          total_portfolio_value: 100000,
        })
        .select()
        .single()

      if (createError) {
        console.error("❌ Error creating portfolio:", createError)
        return { success: false, error: "Failed to create portfolio" }
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

    // Record the trade first
    const { data: trade, error: tradeError } = await supabase
      .from("trades")
      .insert({
        user_id: userId,
        game_id: gameId,
        stock_symbol: stockSymbol,
        quantity: quantity,
        price: price,
        trade_type: tradeType,
      })
      .select()
      .single()

    if (tradeError) {
      console.error("❌ Error recording trade:", tradeError)
      return { success: false, error: "Failed to record trade" }
    }

    // Update cash balance
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

    // Update stock holdings
    let newStockQuantity = 0
    const { data: existingStock, error: stockError } = await supabase
      .from("user_stocks")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .eq("stock_symbol", stockSymbol)
      .single()

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
      tradeId: trade.id,
      newCashBalance,
      newStockQuantity,
    })

    return {
      success: true,
      tradeId: trade.id,
      newCashBalance,
      newStockQuantity,
    }
  } catch (error) {
    console.error("💥 Unexpected error in executeTrade:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error occurred",
    }
  }
}

// Get user portfolio
export async function getUserPortfolio(
  userId: string,
  gameId: string,
): Promise<{ portfolio: Portfolio | null; error?: string }> {
  try {
    const { data: portfolio, error } = await supabase
      .from("user_portfolios")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching portfolio:", error)
      return { portfolio: null, error: error.message }
    }

    return { portfolio: portfolio || null }
  } catch (error) {
    console.error("Error getting portfolio:", error)
    return { portfolio: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Get user stock holdings
export async function getUserStocks(
  userId: string,
  gameId: string,
): Promise<{ stocks: StockHolding[]; error?: string }> {
  try {
    const { data: stocks, error } = await supabase
      .from("user_stocks")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .gt("quantity", 0)

    if (error) {
      console.error("Error fetching stocks:", error)
      return { stocks: [], error: error.message }
    }

    const formattedStocks: StockHolding[] = (stocks || []).map((stock) => ({
      stock_symbol: stock.stock_symbol,
      quantity: stock.quantity,
      avg_price: stock.avg_price,
      current_value: stock.quantity * stock.avg_price,
    }))

    return { stocks: formattedStocks }
  } catch (error) {
    console.error("Error getting stocks:", error)
    return { stocks: [], error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Execute trade and create activity post
export async function executeTradeAndPost(
  userId: string,
  gameId: string,
  stockSymbol: string,
  stockName: string,
  quantity: number,
  price: number,
  tradeType: "buy" | "sell",
  rationale?: string,
): Promise<{ success: boolean; error?: string; tradeId?: string; postId?: string }> {
  try {
    console.log("🔄 Executing trade and creating post:", { stockSymbol, quantity, price, tradeType })

    // Execute the trade
    const tradeResult = await executeTrade(userId, gameId, stockSymbol, quantity, price, tradeType)

    if (!tradeResult.success) {
      return { success: false, error: tradeResult.error }
    }

    // Create activity post
    const totalAmount = quantity * price
    const postContent = rationale
      ? `${tradeType === "buy" ? "Bought" : "Sold"} ${quantity} shares of ${stockSymbol} (${stockName}) for $${price.toFixed(2)} each. Total: $${totalAmount.toFixed(2)}

💡 Rationale: ${rationale}`
      : `${tradeType === "buy" ? "Bought" : "Sold"} ${quantity} shares of ${stockSymbol} for $${price.toFixed(2)} each. Total: $${totalAmount.toFixed(2)}`

    const {
      success: postSuccess,
      post,
      error: postError,
    } = await createActivityPost(userId, gameId, {
      post_type: "trade",
      content: postContent,
      stock_symbol: stockSymbol,
      trade_amount: totalAmount,
    })

    if (!postSuccess) {
      console.error("❌ Error creating activity post:", postError)
      // Trade succeeded but post failed - still return success
      return {
        success: true,
        tradeId: tradeResult.tradeId,
        error: "Trade completed but failed to share",
      }
    }

    console.log("✅ Trade and post completed successfully")
    return {
      success: true,
      tradeId: tradeResult.tradeId,
      postId: post?.id,
    }
  } catch (error) {
    console.error("💥 Error in executeTradeAndPost:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
