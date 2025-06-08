// Define types
export interface UserBalance {
  user_id: string
  cash_balance: number
  last_updated: string
}

export interface StockPosition {
  user_id: string
  symbol: string
  quantity: number
  average_price: number
  current_price: number
}

export interface TradeResult {
  success: boolean
  message: string
  trade_id?: string
  error?: string
}

// Mock data
const mockBalances: Record<string, UserBalance> = {}
const mockPositions: Record<string, StockPosition[]> = {}

// Trading service
export const tradingService = {
  // Get user balance
  getUserBalance: async (userId: string): Promise<UserBalance> => {
    // Return mock balance or create a new one
    if (!mockBalances[userId]) {
      mockBalances[userId] = {
        user_id: userId,
        cash_balance: 10000, // Start with $10,000
        last_updated: new Date().toISOString(),
      }
    }
    return mockBalances[userId]
  },

  // Get user positions
  getUserPositions: async (userId: string): Promise<StockPosition[]> => {
    // Return mock positions or empty array
    return mockPositions[userId] || []
  },

  // Execute a trade
  executeTrade: async (
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
    action: "buy" | "sell",
  ): Promise<TradeResult> => {
    try {
      // Get user balance
      const balance = await tradingService.getUserBalance(userId)

      // Calculate trade value
      const tradeValue = quantity * price

      if (action === "buy") {
        // Check if user has enough funds
        if (balance.cash_balance < tradeValue) {
          return {
            success: false,
            message: "Insufficient funds",
            error: "Your cash balance is too low for this trade",
          }
        }

        // Update balance
        balance.cash_balance -= tradeValue
        mockBalances[userId] = balance

        // Update positions
        const positions = await tradingService.getUserPositions(userId)
        const existingPosition = positions.find((p) => p.symbol === symbol)

        if (existingPosition) {
          // Update existing position
          const totalShares = existingPosition.quantity + quantity
          const totalCost = existingPosition.average_price * existingPosition.quantity + price * quantity
          existingPosition.average_price = totalCost / totalShares
          existingPosition.quantity = totalShares
          existingPosition.current_price = price
        } else {
          // Create new position
          positions.push({
            user_id: userId,
            symbol,
            quantity,
            average_price: price,
            current_price: price,
          })
        }

        mockPositions[userId] = positions

        return {
          success: true,
          message: `Successfully bought ${quantity} shares of ${symbol}`,
          trade_id: `trade_${Date.now()}`,
        }
      } else {
        // Selling logic
        const positions = await tradingService.getUserPositions(userId)
        const existingPosition = positions.find((p) => p.symbol === symbol)

        if (!existingPosition || existingPosition.quantity < quantity) {
          return {
            success: false,
            message: "Insufficient shares",
            error: "You don't have enough shares to sell",
          }
        }

        // Update balance
        balance.cash_balance += tradeValue
        mockBalances[userId] = balance

        // Update position
        existingPosition.quantity -= quantity

        // Remove position if quantity is 0
        if (existingPosition.quantity === 0) {
          mockPositions[userId] = positions.filter((p) => p.symbol !== symbol)
        } else {
          mockPositions[userId] = positions
        }

        return {
          success: true,
          message: `Successfully sold ${quantity} shares of ${symbol}`,
          trade_id: `trade_${Date.now()}`,
        }
      }
    } catch (error) {
      console.error("Error executing trade:", error)
      return {
        success: false,
        message: "Trade failed",
        error: "An unexpected error occurred",
      }
    }
  },

  // Calculate portfolio value
  calculatePortfolioValue: async (userId: string) => {
    try {
      const positions = await tradingService.getUserPositions(userId)

      let totalValue = 0
      let totalCost = 0

      positions.forEach((position) => {
        totalValue += position.current_price * position.quantity
        totalCost += position.average_price * position.quantity
      })

      const totalGainLoss = totalValue - totalCost
      const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

      // Mock today's return (random value between -5% and +5% of total value)
      const todayReturn = totalValue * (Math.random() * 0.1 - 0.05)

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
  },
}
