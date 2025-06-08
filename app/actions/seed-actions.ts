"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

// Seed user portfolios with realistic stock data
export async function seedUserPortfolios() {
  try {
    const supabase = createServerSupabaseClient()

    // Get all users
    const { data: users, error: usersError } = await supabase.from("users").select("id, username")

    if (usersError) throw usersError
    if (!users || users.length === 0) return { success: false, error: "No users found" }

    // Get active games
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, game_code")
      .eq("status", "active")
      .limit(5)

    if (gamesError) throw gamesError
    if (!games || games.length === 0) {
      // Create a default game if none exists
      const { data: newGame, error: newGameError } = await supabase
        .from("games")
        .insert({
          id: uuidv4(),
          title: "November 2024 Stock Challenge",
          game_code: "123456",
          host_id: users[0].id,
          status: "active",
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          buy_in_amount: 100000,
          prize_pool: 110000,
          max_players: 50,
          current_players: 0,
          description: "Monthly stock trading competition",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (newGameError) throw newGameError
      games.push(newGame)
    }

    // Stock data for portfolios
    const stocks = [
      { symbol: "AAPL", name: "Apple Inc", price: 250.99, logoBackground: "#000000" },
      { symbol: "MSFT", name: "Microsoft", price: 420.45, logoBackground: "#00a4ef" },
      { symbol: "GOOGL", name: "Alphabet Inc", price: 180.75, logoBackground: "#4285F4" },
      { symbol: "AMZN", name: "Amazon.com Inc", price: 178.25, logoBackground: "#ff9900" },
      { symbol: "META", name: "Meta Platforms", price: 478.22, logoBackground: "#0668E1" },
      { symbol: "TSLA", name: "Tesla Inc", price: 217.56, logoBackground: "#d93025" },
      { symbol: "NVDA", name: "NVIDIA Corp", price: 271.3, logoBackground: "#76B900" },
      { symbol: "JPM", name: "JPMorgan Chase", price: 187.45, logoBackground: "#2e285d" },
      { symbol: "V", name: "Visa Inc", price: 275.3, logoBackground: "#1a1f71" },
      { symbol: "JNJ", name: "Johnson & Johnson", price: 155.2, logoBackground: "#d31145" },
      { symbol: "WMT", name: "Walmart Inc", price: 68.75, logoBackground: "#0071ce" },
      { symbol: "PG", name: "Procter & Gamble", price: 162.3, logoBackground: "#004289" },
      { symbol: "BAC", name: "Bank of America", price: 38.45, logoBackground: "#012169" },
      { symbol: "KO", name: "Coca-Cola Co", price: 62.8, logoBackground: "#f40000" },
      { symbol: "DIS", name: "Walt Disney Co", price: 105.4, logoBackground: "#0063e6" },
      { symbol: "PFE", name: "Pfizer Inc", price: 28.15, logoBackground: "#0093d0" },
      { symbol: "NFLX", name: "Netflix Inc", price: 687.25, logoBackground: "#e50914" },
      { symbol: "CSCO", name: "Cisco Systems", price: 48.9, logoBackground: "#00bceb" },
      { symbol: "INTC", name: "Intel Corp", price: 32.75, logoBackground: "#0071c5" },
      { symbol: "ADBE", name: "Adobe Inc", price: 590.8, logoBackground: "#fa0f00" },
    ]

    // For each user, create game participation and portfolio
    for (const user of users) {
      // Add user to games
      for (const game of games) {
        // Check if user is already a participant
        const { data: existingParticipant } = await supabase
          .from("game_participants")
          .select("id")
          .eq("user_id", user.id)
          .eq("game_id", game.id)
          .maybeSingle()

        if (!existingParticipant) {
          // Add user as participant
          const initialBalance = 100000
          await supabase.from("game_participants").insert({
            id: uuidv4(),
            game_id: game.id,
            user_id: user.id,
            joined_at: new Date().toISOString(),
            initial_balance: initialBalance,
            current_balance: Math.random() * 20000 + 80000, // Random remaining balance
            total_return: Math.random() * 40 - 20, // Random return between -20% and +20%
            daily_return: Math.random() * 10 - 5, // Random daily return between -5% and +5%
            rank: Math.floor(Math.random() * 20) + 1, // Random rank
          })

          // Create 5-10 stock holdings for each user
          const numStocks = Math.floor(Math.random() * 6) + 5
          const selectedStocks = [...stocks].sort(() => 0.5 - Math.random()).slice(0, numStocks)

          for (const stock of selectedStocks) {
            // Calculate random purchase date in the last 30 days
            const purchaseDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)

            // Calculate random number of shares and purchase price
            const shares = Math.floor(Math.random() * 20) + 1
            const purchasePrice = stock.price * (1 + (Math.random() * 0.4 - 0.2)) // +/- 20% from current price

            // Insert portfolio holding
            await supabase.from("user_portfolios").insert({
              id: uuidv4(),
              user_id: user.id,
              game_id: game.id,
              stock_symbol: stock.symbol,
              shares_owned: shares,
              purchase_price: purchasePrice,
              purchase_date: purchaseDate.toISOString(),
              current_value: shares * stock.price,
            })
          }
        }
      }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error seeding user portfolios:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
