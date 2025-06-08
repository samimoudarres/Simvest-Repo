import { createClientSupabaseClient } from "./supabase"

export type ActivityPost = {
  id: string
  user_id: string
  game_id: string
  post_type: string
  content: string
  stock_symbol?: string
  trade_amount?: number
  likes_count: number
  comments_count: number
  created_at: string
  users?: {
    username: string
    display_name: string
    profile_picture_url: string | null
  }
}

export type Comment = {
  id: string
  post_id: string
  user_id: string
  comment_text: string
  created_at: string
  users?: {
    username: string
    display_name: string
    profile_picture_url: string | null
  }
}

export type Trade = {
  id: string
  user_id: string
  game_id: string
  stock_symbol: string
  quantity: number
  price: number
  trade_type: "buy" | "sell"
  timestamp: string
}

export type UserPortfolio = {
  user_id: string
  game_id: string
  cash_balance: number
  total_portfolio_value: number
  updated_at: string
}

export type UserStock = {
  id: string
  user_id: string
  game_id: string
  stock_symbol: string
  quantity: number
  avg_price: number
  updated_at: string
}

const supabase = createClientSupabaseClient()

// Create activity post
export async function createActivityPost(
  userId: string,
  gameId: string,
  postData: {
    post_type: string
    content: string
    stock_symbol?: string
    trade_amount?: number
  },
): Promise<{ post: ActivityPost | null; error: Error | null }> {
  try {
    console.log("📝 Creating activity post:", postData)

    const { data, error } = await supabase
      .from("activity_posts")
      .insert({
        user_id: userId,
        game_id: gameId,
        post_type: postData.post_type,
        content: postData.content,
        stock_symbol: postData.stock_symbol,
        trade_amount: postData.trade_amount,
        likes_count: 0,
        comments_count: 0,
      })
      .select(`
        *,
        users (
          username,
          display_name,
          profile_picture_url
        )
      `)
      .single()

    if (error) {
      console.error("❌ Error creating activity post:", error)
      throw error
    }

    console.log("✅ Activity post created successfully:", data.id)
    return { post: data, error: null }
  } catch (error) {
    console.error("💥 Error creating activity post:", error)
    return { post: null, error: error as Error }
  }
}

// Get activity posts for a game
export async function getActivityPosts(
  gameId: string,
  limit = 20,
  offset = 0,
): Promise<{ posts: ActivityPost[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("activity_posts")
      .select(`
        *,
        users (
          username,
          display_name,
          profile_picture_url
        )
      `)
      .eq("game_id", gameId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { posts: data || [], error: null }
  } catch (error) {
    console.error("Error fetching activity posts:", error)
    return { posts: [], error: error as Error }
  }
}

// Add comment to post
export async function addComment(
  userId: string,
  postId: string,
  commentText: string,
): Promise<{ comment: Comment | null; error: Error | null }> {
  try {
    console.log("💬 Adding comment to post:", postId)

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        comment_text: commentText.trim(),
      })
      .select(`
        *,
        users (
          username,
          display_name,
          profile_picture_url
        )
      `)
      .single()

    if (error) throw error

    console.log("✅ Comment added successfully:", data.id)
    return { comment: data, error: null }
  } catch (error) {
    console.error("Error adding comment:", error)
    return { comment: null, error: error as Error }
  }
}

// Get comments for a post
export async function getPostComments(postId: string): Promise<{ comments: Comment[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        users (
          username,
          display_name,
          profile_picture_url
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) throw error

    return { comments: data || [], error: null }
  } catch (error) {
    console.error("Error fetching comments:", error)
    return { comments: [], error: error as Error }
  }
}

// Like/unlike a post
export async function toggleLike(userId: string, postId: string): Promise<{ liked: boolean; error: Error | null }> {
  try {
    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError
    }

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase.from("likes").delete().eq("user_id", userId).eq("post_id", postId)

      if (deleteError) throw deleteError
      return { liked: false, error: null }
    } else {
      // Like
      const { error: insertError } = await supabase.from("likes").insert({
        user_id: userId,
        post_id: postId,
      })

      if (insertError) throw insertError
      return { liked: true, error: null }
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return { liked: false, error: error as Error }
  }
}

// Execute a trade
export async function executeTrade(
  userId: string,
  gameId: string,
  tradeData: {
    stock_symbol: string
    quantity: number
    price: number
    trade_type: "buy" | "sell"
  },
): Promise<{ success: boolean; error: Error | null }> {
  try {
    console.log("💰 Executing trade:", tradeData)

    const totalAmount = tradeData.quantity * tradeData.price

    // Start transaction-like operations
    // 1. Get current portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from("user_portfolios")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single()

    if (portfolioError && portfolioError.code !== "PGRST116") {
      throw portfolioError
    }

    // Initialize portfolio if doesn't exist
    if (!portfolio) {
      const { error: createError } = await supabase.from("user_portfolios").insert({
        user_id: userId,
        game_id: gameId,
        cash_balance: 100000,
        total_portfolio_value: 100000,
      })

      if (createError) throw createError

      // Retry getting portfolio
      const { data: newPortfolio, error: retryError } = await supabase
        .from("user_portfolios")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameId)
        .single()

      if (retryError) throw retryError
      const portfolio = newPortfolio
    }

    // 2. Check if user has enough cash for buy orders
    if (tradeData.trade_type === "buy" && portfolio.cash_balance < totalAmount) {
      throw new Error("Insufficient cash balance")
    }

    // 3. Record the trade
    const { error: tradeError } = await supabase.from("trades").insert({
      user_id: userId,
      game_id: gameId,
      stock_symbol: tradeData.stock_symbol,
      quantity: tradeData.quantity,
      price: tradeData.price,
      trade_type: tradeData.trade_type,
    })

    if (tradeError) throw tradeError

    // 4. Update cash balance
    const newCashBalance =
      tradeData.trade_type === "buy" ? portfolio.cash_balance - totalAmount : portfolio.cash_balance + totalAmount

    const { error: updatePortfolioError } = await supabase
      .from("user_portfolios")
      .update({
        cash_balance: newCashBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("game_id", gameId)

    if (updatePortfolioError) throw updatePortfolioError

    // 5. Update user stocks
    const { data: existingStock, error: stockError } = await supabase
      .from("user_stocks")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .eq("stock_symbol", tradeData.stock_symbol)
      .single()

    if (stockError && stockError.code !== "PGRST116") {
      throw stockError
    }

    if (existingStock) {
      // Update existing stock position
      const newQuantity =
        tradeData.trade_type === "buy"
          ? existingStock.quantity + tradeData.quantity
          : existingStock.quantity - tradeData.quantity

      const newAvgPrice =
        tradeData.trade_type === "buy"
          ? (existingStock.avg_price * existingStock.quantity + tradeData.price * tradeData.quantity) / newQuantity
          : existingStock.avg_price

      const { error: updateStockError } = await supabase
        .from("user_stocks")
        .update({
          quantity: Math.max(0, newQuantity),
          avg_price: newAvgPrice,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingStock.id)

      if (updateStockError) throw updateStockError
    } else if (tradeData.trade_type === "buy") {
      // Create new stock position
      const { error: createStockError } = await supabase.from("user_stocks").insert({
        user_id: userId,
        game_id: gameId,
        stock_symbol: tradeData.stock_symbol,
        quantity: tradeData.quantity,
        avg_price: tradeData.price,
      })

      if (createStockError) throw createStockError
    }

    console.log("✅ Trade executed successfully")
    return { success: true, error: null }
  } catch (error) {
    console.error("💥 Error executing trade:", error)
    return { success: false, error: error as Error }
  }
}

// Get user portfolio
export async function getUserPortfolio(
  userId: string,
  gameId: string,
): Promise<{ portfolio: UserPortfolio | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("user_portfolios")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return { portfolio: data, error: null }
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return { portfolio: null, error: error as Error }
  }
}

// Get user stocks
export async function getUserStocks(
  userId: string,
  gameId: string,
): Promise<{ stocks: UserStock[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("user_stocks")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .gt("quantity", 0)
      .order("updated_at", { ascending: false })

    if (error) throw error

    return { stocks: data || [], error: null }
  } catch (error) {
    console.error("Error fetching user stocks:", error)
    return { stocks: [], error: error as Error }
  }
}

// Subscribe to real-time updates
export function subscribeToActivityPosts(gameId: string, callback: (posts: ActivityPost[]) => void) {
  const subscription = supabase
    .channel(`activity-${gameId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "activity_posts",
        filter: `game_id=eq.${gameId}`,
      },
      () => {
        getActivityPosts(gameId).then(({ posts }) => {
          callback(posts)
        })
      },
    )
    .subscribe()

  return subscription
}

export function subscribeToComments(postId: string, callback: (comments: Comment[]) => void) {
  const subscription = supabase
    .channel(`comments-${postId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "comments",
        filter: `post_id=eq.${postId}`,
      },
      () => {
        getPostComments(postId).then(({ comments }) => {
          callback(comments)
        })
      },
    )
    .subscribe()

  return subscription
}
