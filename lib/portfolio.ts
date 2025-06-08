import { supabase } from "./supabase"
import type { Tables } from "./database.types"

export type Portfolio = Tables<"user_portfolios">

// Get user portfolio
export async function getUserPortfolio(
  userId: string,
  gameId: string,
): Promise<{ holdings: Portfolio[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("user_portfolios")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)

    if (error) throw error

    return { holdings: data || [], error: null }
  } catch (error) {
    console.error("Error fetching user portfolio:", error)
    return { holdings: [], error: error as Error }
  }
}

// Add stock to portfolio
export async function addStockToPortfolio(
  userId: string,
  gameId: string,
  stockData: {
    stock_symbol: string
    shares_owned: number
    purchase_price: number
    current_value?: number
  },
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Check if the stock already exists in the portfolio
    const { data: existingHolding, error: checkError } = await supabase
      .from("user_portfolios")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .eq("stock_symbol", stockData.stock_symbol)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError
    }

    if (existingHolding) {
      // Update existing holding
      const newShares = existingHolding.shares_owned + stockData.shares_owned
      const newAvgPrice =
        (existingHolding.shares_owned * existingHolding.purchase_price +
          stockData.shares_owned * stockData.purchase_price) /
        newShares

      const { error: updateError } = await supabase
        .from("user_portfolios")
        .update({
          shares_owned: newShares,
          purchase_price: newAvgPrice,
          current_value: stockData.current_value || newShares * stockData.purchase_price,
        })
        .eq("id", existingHolding.id)

      if (updateError) throw updateError
    } else {
      // Create new holding
      const { error: insertError } = await supabase.from("user_portfolios").insert({
        user_id: userId,
        game_id: gameId,
        ...stockData,
        current_value: stockData.current_value || stockData.shares_owned * stockData.purchase_price,
      })

      if (insertError) throw insertError
    }

    // Update participant's current balance
    const totalCost = stockData.shares_owned * stockData.purchase_price

    const { data: participant, error: participantError } = await supabase
      .from("game_participants")
      .select("current_balance")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single()

    if (participantError) throw participantError

    const { error: updateBalanceError } = await supabase
      .from("game_participants")
      .update({
        current_balance: participant.current_balance - totalCost,
      })
      .eq("user_id", userId)
      .eq("game_id", gameId)

    if (updateBalanceError) throw updateBalanceError

    return { success: true, error: null }
  } catch (error) {
    console.error("Error adding stock to portfolio:", error)
    return { success: false, error: error as Error }
  }
}

// Update portfolio holding
export async function updatePortfolioHolding(
  holdingId: string,
  updates: Partial<Portfolio>,
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase.from("user_portfolios").update(updates).eq("id", holdingId)

    if (error) throw error

    return { success: true, error: null }
  } catch (error) {
    console.error("Error updating portfolio holding:", error)
    return { success: false, error: error as Error }
  }
}

// Sell stock from portfolio
export async function sellStockFromPortfolio(
  userId: string,
  gameId: string,
  stockData: {
    stock_symbol: string
    shares_to_sell: number
    sell_price: number
  },
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Get the current holding
    const { data: holding, error: holdingError } = await supabase
      .from("user_portfolios")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .eq("stock_symbol", stockData.stock_symbol)
      .single()

    if (holdingError) throw holdingError
    if (!holding) throw new Error("Stock not found in portfolio")

    // Check if trying to sell more shares than owned
    if (stockData.shares_to_sell > holding.shares_owned) {
      throw new Error("Cannot sell more shares than owned")
    }

    const remainingShares = holding.shares_owned - stockData.shares_to_sell
    const saleValue = stockData.shares_to_sell * stockData.sell_price

    if (remainingShares > 0) {
      // Update the holding if shares remain
      const { error: updateError } = await supabase
        .from("user_portfolios")
        .update({
          shares_owned: remainingShares,
          current_value: remainingShares * stockData.sell_price,
        })
        .eq("id", holding.id)

      if (updateError) throw updateError
    } else {
      // Delete the holding if no shares remain
      const { error: deleteError } = await supabase.from("user_portfolios").delete().eq("id", holding.id)

      if (deleteError) throw deleteError
    }

    // Update participant's current balance
    const { data: participant, error: participantError } = await supabase
      .from("game_participants")
      .select("current_balance")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single()

    if (participantError) throw participantError

    const { error: updateBalanceError } = await supabase
      .from("game_participants")
      .update({
        current_balance: participant.current_balance + saleValue,
      })
      .eq("user_id", userId)
      .eq("game_id", gameId)

    if (updateBalanceError) throw updateBalanceError

    return { success: true, error: null }
  } catch (error) {
    console.error("Error selling stock from portfolio:", error)
    return { success: false, error: error as Error }
  }
}

// Calculate portfolio performance
export async function calculatePortfolioPerformance(
  userId: string,
  gameId: string,
): Promise<{
  totalValue: number
  totalReturn: number
  totalReturnPercentage: number
  error: Error | null
}> {
  try {
    // Get all holdings
    const { holdings, error: holdingsError } = await getUserPortfolio(userId, gameId)
    if (holdingsError) throw holdingsError

    // Get participant data
    const { data: participant, error: participantError } = await supabase
      .from("game_participants")
      .select("initial_balance, current_balance")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single()

    if (participantError) throw participantError

    // Calculate total portfolio value (holdings + cash)
    const holdingsValue = holdings.reduce((sum, holding) => sum + (holding.current_value || 0), 0)
    const totalValue = holdingsValue + participant.current_balance

    // Calculate returns
    const totalReturn = totalValue - participant.initial_balance
    const totalReturnPercentage = (totalReturn / participant.initial_balance) * 100

    // Update participant data
    const { error: updateError } = await supabase
      .from("game_participants")
      .update({
        total_return: totalReturnPercentage,
      })
      .eq("user_id", userId)
      .eq("game_id", gameId)

    if (updateError) throw updateError

    return {
      totalValue,
      totalReturn,
      totalReturnPercentage,
      error: null,
    }
  } catch (error) {
    console.error("Error calculating portfolio performance:", error)
    return {
      totalValue: 0,
      totalReturn: 0,
      totalReturnPercentage: 0,
      error: error as Error,
    }
  }
}
