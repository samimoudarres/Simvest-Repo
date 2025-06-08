import { createClientSupabaseClient } from "./supabase"
import { getCurrentStockPrice } from "./stock-data-service"
import { createActivityPost } from "./social-interactions"

const supabase = createClientSupabaseClient()

export interface TradeData {
  symbol: string
  action: "BUY" | "SELL"
  quantity: number
  userId: string
  rationale?: string
}

export interface TradeResult {
  success: boolean
  trade?: any
  error?: string
  currentPrice?: number
  totalAmount?: number
}

export class TradingService {
  async executeTrade(tradeData: TradeData): Promise<TradeResult> {
    const { symbol, action, quantity, userId, rationale } = tradeData

    try {
      console.log(`🔄 Executing ${action} trade: ${quantity} shares of ${symbol}`)

      // Get REAL-TIME current price
      const currentPrice = await getCurrentStockPrice(symbol)
      const totalAmount = currentPrice * quantity

      console.log(`💰 Current price for ${symbol}: $${currentPrice}`)
      console.log(`💵 Total trade amount: $${totalAmount.toFixed(2)}`)

      // Validate userId is a proper UUID
      if (!userId || !this.isValidUUID(userId)) {
        throw new Error(`Invalid user ID: ${userId}. Must be a valid UUID.`)
      }

      // Create trade record with proper UUID
      const tradeId = this.generateUUID()
      const trade = {
        id: tradeId,
        user_id: userId,
        symbol: symbol.toUpperCase(),
        trade_type: action.toUpperCase(),
        quantity: Number(quantity),
        price_per_share: Number(currentPrice),
        total_amount: Number(totalAmount),
        rationale: rationale || "",
        executed_at: new Date().toISOString(),
      }

      // Save to Supabase
      const { data, error } = await supabase.from("trades").insert([trade]).select()

      if (error) {
        console.error("Trade insertion error:", error)
        throw new Error(`Failed to save trade: ${error.message}`)
      }

      console.log(`✅ Trade saved to database:`, data[0])

      // Update portfolio
      await this.updatePortfolio(userId, symbol, action, quantity, currentPrice)

      // Create social post if rationale provided
      if (rationale && rationale.trim()) {
        await this.createSocialPost(userId, trade.id, symbol, action, quantity, rationale, totalAmount)
      }

      console.log(`🎉 Trade executed successfully: ${action} ${quantity} ${symbol} @ $${currentPrice}`)

      return {
        success: true,
        trade: data[0],
        currentPrice,
        totalAmount,
      }
    } catch (error) {
      console.error("❌ Trade execution failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  async updatePortfolio(
    userId: string,
    symbol: string,
    action: "BUY" | "SELL",
    quantity: number,
    price: number,
  ): Promise<void> {
    try {
      console.log(`📊 Updating portfolio: ${action} ${quantity} ${symbol}`)

      // Get existing position
      const { data: existing, error: fetchError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", userId)
        .eq("symbol", symbol)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError
      }

      if (existing) {
        // Update existing position
        const currentQuantity = Number.parseFloat(existing.quantity.toString())
        const currentAvgCost = Number.parseFloat(existing.avg_cost_per_share.toString())

        let newQuantity: number
        let newAvgCost: number

        if (action === "BUY") {
          newQuantity = currentQuantity + quantity
          // Weighted average cost
          newAvgCost = (currentAvgCost * currentQuantity + price * quantity) / newQuantity
        } else {
          newQuantity = currentQuantity - quantity
          newAvgCost = currentAvgCost // Keep same average cost when selling
        }

        if (newQuantity <= 0) {
          // Remove position if quantity is zero or negative
          const { error: deleteError } = await supabase.from("portfolios").delete().eq("id", existing.id)

          if (deleteError) throw deleteError
          console.log(`🗑️ Removed position for ${symbol}`)
        } else {
          // Update position
          const { error: updateError } = await supabase
            .from("portfolios")
            .update({
              quantity: newQuantity,
              avg_cost_per_share: newAvgCost,
              total_cost: newQuantity * newAvgCost,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id)

          if (updateError) throw updateError
          console.log(`📈 Updated position for ${symbol}: ${newQuantity} shares @ $${newAvgCost.toFixed(2)}`)
        }
      } else if (action === "BUY") {
        // Create new position
        const newPosition = {
          id: this.generateUUID(),
          user_id: userId,
          symbol: symbol.toUpperCase(),
          quantity: Number(quantity),
          avg_cost_per_share: Number(price),
          total_cost: Number(quantity * price),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error: insertError } = await supabase.from("portfolios").insert([newPosition])

        if (insertError) throw insertError
        console.log(`🆕 Created new position for ${symbol}: ${quantity} shares @ $${price}`)
      } else {
        throw new Error(`Cannot sell ${symbol}: No existing position found`)
      }
    } catch (error) {
      console.error("Portfolio update error:", error)
      throw error
    }
  }

  async createSocialPost(
    userId: string,
    tradeId: string,
    symbol: string,
    action: "BUY" | "SELL",
    quantity: number,
    rationale: string,
    totalAmount: number,
  ): Promise<void> {
    try {
      console.log(`📱 Creating social post for trade: ${action} ${quantity} ${symbol}`)

      const { success, error } = await createActivityPost(
        userId,
        "112024", // Default game ID - you might want to make this dynamic
        {
          post_type: "trade_share",
          content: `${action.toUpperCase()} ${quantity} shares of $${symbol}: ${rationale}`,
          stock_symbol: symbol.toUpperCase(),
          trade_amount: totalAmount,
        },
      )

      if (!success) {
        console.warn("Failed to create social post:", error)
      } else {
        console.log(`✅ Social post created for ${symbol} trade`)
      }
    } catch (error) {
      console.warn("Social post creation failed:", error)
    }
  }

  async getUserPortfolio(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching portfolio:", error)
      return []
    }
  }

  async getUserTrades(userId: string, limit = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("executed_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching trades:", error)
      return []
    }
  }

  async calculatePortfolioValue(
    userId: string,
  ): Promise<{ totalValue: number; totalGainLoss: number; totalGainLossPercent: number; todayReturn: number }> {
    try {
      const portfolio = await this.getUserPortfolio(userId)
      let totalValue = 0
      let totalCost = 0
      let todayReturn = 0

      for (const position of portfolio) {
        try {
          const currentPrice = await getCurrentStockPrice(position.symbol)
          const currentValue = currentPrice * position.quantity
          const positionCost = position.total_cost

          totalValue += currentValue
          totalCost += positionCost

          // Calculate today's return (simplified - using 1% random change)
          const todayChange = currentPrice * 0.01 * (Math.random() - 0.5) * 2
          todayReturn += todayChange * position.quantity
        } catch (error) {
          console.warn(`Failed to get current price for ${position.symbol}:`, error)
          totalValue += position.total_cost
          totalCost += position.total_cost
        }
      }

      const totalGainLoss = totalValue - totalCost
      const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

      return {
        totalValue,
        totalGainLoss,
        totalGainLossPercent,
        todayReturn,
      }
    } catch (error) {
      console.error("Error calculating portfolio value:", error)
      return {
        totalValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        todayReturn: 0,
      }
    }
  }

  private generateUUID(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }
}

export const tradingService = new TradingService()
