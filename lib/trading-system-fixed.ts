import { createClientSupabaseClient } from "./supabase"
import { createActivityPost } from "./social-interactions"
import { v4 as uuidv4 } from "uuid"

export type TradeResult = {
  success: boolean
  error?: string
  newCashBalance?: number
  newStockQuantity?: number
  tradeId?: string
  errorDetails?: any
}

export type Portfolio = {
  id: string
  user_id: string
  game_id: string
  cash_balance: number
  total_portfolio_value: number
  updated_at: string
}

export type StockHolding = {
  id: string
  user_id: string
  game_id: string
  stock_symbol: string
  quantity: number
  avg_price: number
  current_value: number
  updated_at: string
}

const supabase = createClientSupabaseClient()

// COMPLETELY FIXED TRADE EXECUTION
export async function executeTrade(
  userId: string,
  gameId: string,
  stockSymbol: string,
  quantity: number,
  price: number,
  tradeType: "buy" | "sell",
): Promise<TradeResult> {
  console.log("🔄 Starting trade execution:", { userId, gameId, stockSymbol, quantity, price, tradeType })

  try {
    // Validate inputs
    if (!userId || !gameId || !stockSymbol || quantity <= 0 || price <= 0) {
      return {
        success: false,
        error: "Invalid trade parameters",
        errorDetails: { userId, gameId, stockSymbol, quantity, price, tradeType },
      }
    }

    const totalAmount = quantity * price

    // Step 1: Get or create user portfolio with detailed error handling
    console.log("📊 Fetching user portfolio...")
    let portfolio: Portfolio | null = null

    try {
      const { data: portfolioData, error: portfolioError } = await supabase
        .from("user_portfolios")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameId)
        .single()

      if (portfolioError && portfolioError.code !== "PGRST116") {
        console.error("❌ Portfolio fetch error:", portfolioError)
        return {
          success: false,
          error: `Database error: ${portfolioError.message}`,
          errorDetails: portfolioError,
        }
      }

      portfolio = portfolioData
    } catch (error) {
      console.error("❌ Portfolio fetch exception:", error)
      return {
        success: false,
        error: "Failed to fetch portfolio",
        errorDetails: error,
      }
    }

    // Create portfolio if it doesn't exist
    if (!portfolio) {
      console.log("📝 Creating new portfolio for user")
      try {
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
          console.error("❌ Portfolio creation error:", createError)
          return {
            success: false,
            error: `Failed to create portfolio: ${createError.message}`,
            errorDetails: createError,
          }
        }

        portfolio = newPortfolio
        console.log("✅ Portfolio created successfully")
      } catch (error) {
        console.error("❌ Portfolio creation exception:", error)
        return {
          success: false,
          error: "Failed to create portfolio",
          errorDetails: error,
        }
      }
    }

    // Step 2: Validate sufficient funds for buy orders
    if (tradeType === "buy" && portfolio.cash_balance < totalAmount) {
      console.error("❌ Insufficient funds:", {
        available: portfolio.cash_balance,
        required: totalAmount,
      })
      return {
        success: false,
        error: `Insufficient funds. You have $${portfolio.cash_balance.toFixed(2)} but need $${totalAmount.toFixed(2)}`,
        errorDetails: { available: portfolio.cash_balance, required: totalAmount },
      }
    }

    // Step 3: Calculate new cash balance
    const newCashBalance =
      tradeType === "buy" ? portfolio.cash_balance - totalAmount : portfolio.cash_balance + totalAmount

    console.log("💰 Cash balance calculation:", {
      current: portfolio.cash_balance,
      change: tradeType === "buy" ? -totalAmount : totalAmount,
      new: newCashBalance,
    })

    // Step 4: Record the trade first
    console.log("📝 Recording trade...")
    let tradeId: string | null = null

    try {
      const newTradeId = uuidv4()
      const { data: trade, error: tradeError } = await supabase
        .from("trades")
        .insert({
          id: newTradeId, // Use generated UUID
          user_id: userId,
          game_id: gameId,
          stock_symbol: stockSymbol,
          quantity: quantity,
          price: price,
          trade_type: tradeType,
          total_cost: totalAmount,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single()

      if (tradeError) {
        console.error("❌ Trade recording error:", tradeError)
        return {
          success: false,
          error: `Failed to record trade: ${tradeError.message}`,
          errorDetails: tradeError,
        }
      }

      tradeId = trade.id
      console.log("✅ Trade recorded successfully:", tradeId)
    } catch (error) {
      console.error("❌ Trade recording exception:", error)
      return {
        success: false,
        error: "Failed to record trade",
        errorDetails: error,
      }
    }

    // Step 5: Update cash balance
    console.log("💰 Updating cash balance...")
    try {
      const { error: updateCashError } = await supabase
        .from("user_portfolios")
        .update({
          cash_balance: newCashBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("game_id", gameId)

      if (updateCashError) {
        console.error("❌ Cash balance update error:", updateCashError)
        // Try to rollback trade record
        await supabase.from("trades").delete().eq("id", tradeId)
        return {
          success: false,
          error: `Failed to update cash balance: ${updateCashError.message}`,
          errorDetails: updateCashError,
        }
      }

      console.log("✅ Cash balance updated successfully")
    } catch (error) {
      console.error("❌ Cash balance update exception:", error)
      // Try to rollback trade record
      if (tradeId) {
        await supabase.from("trades").delete().eq("id", tradeId)
      }
      return {
        success: false,
        error: "Failed to update cash balance",
        errorDetails: error,
      }
    }

    // Step 6: Update stock holdings
    console.log("📈 Updating stock holdings...")
    let newStockQuantity = 0

    try {
      const { data: existingStock, error: stockError } = await supabase
        .from("user_stocks")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameId)
        .eq("stock_symbol", stockSymbol)
        .single()

      if (stockError && stockError.code !== "PGRST116") {
        console.error("❌ Stock fetch error:", stockError)
        return {
          success: false,
          error: `Failed to fetch stock data: ${stockError.message}`,
          errorDetails: stockError,
        }
      }

      if (!existingStock) {
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
            console.error("❌ Stock creation error:", createStockError)
            return {
              success: false,
              error: `Failed to create stock holding: ${createStockError.message}`,
              errorDetails: createStockError,
            }
          }
          newStockQuantity = quantity
          console.log("✅ New stock holding created")
        }
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
          console.error("❌ Stock update error:", updateStockError)
          return {
            success: false,
            error: `Failed to update stock holding: ${updateStockError.message}`,
            errorDetails: updateStockError,
          }
        }
        console.log("✅ Stock holding updated")
      }
    } catch (error) {
      console.error("❌ Stock holdings exception:", error)
      return {
        success: false,
        error: "Failed to update stock holdings",
        errorDetails: error,
      }
    }

    console.log("✅ Trade executed successfully:", {
      tradeId,
      newCashBalance,
      newStockQuantity,
    })

    return {
      success: true,
      tradeId,
      newCashBalance,
      newStockQuantity,
    }
  } catch (error) {
    console.error("💥 Unexpected error in executeTrade:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error occurred",
      errorDetails: error,
    }
  }
}

// Execute trade and create activity post with comprehensive error handling
export async function executeTradeAndPost(
  userId: string,
  gameId: string,
  stockSymbol: string,
  stockName: string,
  quantity: number,
  price: number,
  tradeType: "buy" | "sell",
  rationale?: string,
): Promise<{ success: boolean; error?: string; tradeId?: string; postId?: string; errorDetails?: any }> {
  console.log("🔄 Executing trade and creating post:", { stockSymbol, quantity, price, tradeType })

  try {
    // Execute the trade
    const tradeResult = await executeTrade(userId, gameId, stockSymbol, quantity, price, tradeType)

    if (!tradeResult.success) {
      console.error("❌ Trade execution failed:", tradeResult.error)
      return {
        success: false,
        error: tradeResult.error,
        errorDetails: tradeResult.errorDetails,
      }
    }

    console.log("✅ Trade executed successfully, creating activity post...")

    // Create activity post
    const totalAmount = quantity * price
    const postContent = rationale
      ? `${tradeType === "buy" ? "Bought" : "Sold"} ${quantity} shares of ${stockSymbol} (${stockName}) for $${price.toFixed(2)} each. Total: $${totalAmount.toFixed(2)}

💡 Rationale: ${rationale}`
      : `${tradeType === "buy" ? "Bought" : "Sold"} ${quantity} shares of ${stockSymbol} for $${price.toFixed(2)} each. Total: $${totalAmount.toFixed(2)}`

    try {
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
          errorDetails: { postError },
        }
      }

      console.log("✅ Trade and post completed successfully")
      return {
        success: true,
        tradeId: tradeResult.tradeId,
        postId: post?.id,
      }
    } catch (postError) {
      console.error("❌ Activity post creation exception:", postError)
      return {
        success: true,
        tradeId: tradeResult.tradeId,
        error: "Trade completed but failed to share",
        errorDetails: { postError },
      }
    }
  } catch (error) {
    console.error("💥 Error in executeTradeAndPost:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorDetails: error,
    }
  }
}

// Get user portfolio with error handling
export async function getUserPortfolioo(
  userId: string,
  gameId: string,
): Promise<{ portfolio: Portfolio | null; error?: string }> {
  try {
    console.log("📊 Fetching user portfolio:", { userId, gameId })

    const { data: portfolio, error } = await supabase
      .from("user_portfolios")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("❌ Error fetching portfolio:", error)
      return { portfolio: null, error: error.message }
    }

    console.log("✅ Portfolio fetched successfully")
    return { portfolio: portfolio || null }
  } catch (error) {
    console.error("💥 Error getting portfolio:", error)
    return { portfolio: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Get user stock holdings with error handling
export async function getUserStocks(
  userId: string,
  gameId: string,
): Promise<{ stocks: StockHolding[]; error?: string }> {
  try {
    console.log("📈 Fetching user stocks:", { userId, gameId })

    const { data: stocks, error } = await supabase
      .from("user_stocks")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .gt("quantity", 0)

    if (error) {
      console.error("❌ Error fetching stocks:", error)
      return { stocks: [], error: error.message }
    }

    console.log("✅ Stocks fetched successfully:", stocks?.length || 0)
    return { stocks: stocks || [] }
  } catch (error) {
    console.error("💥 Error getting stocks:", error)
    return { stocks: [], error: error instanceof Error ? error.message : "Unknown error" }
  }
}
