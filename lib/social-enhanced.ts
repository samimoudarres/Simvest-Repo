import { createClientSupabaseClient } from "./supabase"

export type Post = {
  id: string
  user_id: string
  game_id: string
  content: string
  stock_symbol?: string
  trade_type?: string
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
  content: string
  created_at: string
  users?: {
    username: string
    display_name: string
    profile_picture_url: string | null
  }
}

export type Like = {
  id: string
  post_id: string
  user_id: string
  created_at: string
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
  total_value: number
}

const supabase = createClientSupabaseClient()

// Create a post with automatic trade integration
export async function createPost(
  userId: string,
  gameId: string,
  postData: {
    content: string
    stock_symbol?: string
    trade_type?: string
    trade_quantity?: number
    trade_price?: number
  },
): Promise<{ post: Post | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("user_posts")
      .insert({
        user_id: userId,
        game_id: gameId,
        content: postData.content,
        stock_symbol: postData.stock_symbol,
        trade_type: postData.trade_type,
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

    if (error) throw error

    return { post: data, error: null }
  } catch (error) {
    console.error("Error creating post:", error)
    return { post: null, error: error as Error }
  }
}

// Get posts for a game with real-time updates
export async function getGamePosts(
  gameId: string,
  limit = 20,
  offset = 0,
): Promise<{ posts: Post[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("user_posts")
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
    console.error("Error fetching game posts:", error)
    return { posts: [], error: error as Error }
  }
}

// Add comment to post with real-time updates
export async function addComment(
  userId: string,
  postId: string,
  content: string,
): Promise<{ comment: Comment | null; error: Error | null }> {
  try {
    // Start a transaction-like operation
    const { data: commentData, error: commentError } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content: content.trim(),
        created_at: new Date().toISOString(),
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

    if (commentError) throw commentError

    // Update comments count
    const { error: updateError } = await supabase.rpc("increment_comments_count", {
      post_id: postId,
    })

    if (updateError) {
      console.warn("Error updating comments count:", updateError)
      // Don't throw here, comment was still created
    }

    return { comment: commentData, error: null }
  } catch (error) {
    console.error("Error adding comment:", error)
    return { comment: null, error: error as Error }
  }
}

// Get comments for a post
export async function getPostComments(postId: string): Promise<{ comments: Comment[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("post_comments")
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
    console.error("Error fetching post comments:", error)
    return { comments: [], error: error as Error }
  }
}

// Like a post
export async function likePost(
  userId: string,
  postId: string,
): Promise<{ success: boolean; liked: boolean; error: Error | null }> {
  try {
    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from("post_likes")
      .select("*")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError
    }

    if (existingLike) {
      // Unlike - remove like
      const { error: unlikeError } = await supabase
        .from("post_likes")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId)

      if (unlikeError) throw unlikeError

      // Decrease likes count
      const { error: updateError } = await supabase.rpc("decrement_likes_count", {
        post_id: postId,
      })

      if (updateError) {
        console.warn("Error updating likes count:", updateError)
      }

      return { success: true, liked: false, error: null }
    } else {
      // Like - add like
      const { error: likeError } = await supabase.from("post_likes").insert({
        user_id: userId,
        post_id: postId,
        created_at: new Date().toISOString(),
      })

      if (likeError) throw likeError

      // Increase likes count
      const { error: updateError } = await supabase.rpc("increment_likes_count", {
        post_id: postId,
      })

      if (updateError) {
        console.warn("Error updating likes count:", updateError)
      }

      return { success: true, liked: true, error: null }
    }
  } catch (error) {
    console.error("Error liking post:", error)
    return { success: false, liked: false, error: error as Error }
  }
}

// Check if user has liked a post
export async function hasUserLikedPost(
  userId: string,
  postId: string,
): Promise<{ liked: boolean; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("post_likes")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return { liked: !!data, error: null }
  } catch (error) {
    console.error("Error checking like status:", error)
    return { liked: false, error: error as Error }
  }
}

// Record a trade and auto-create activity post
export async function recordTrade(
  userId: string,
  gameId: string,
  tradeData: {
    stock_symbol: string
    quantity: number
    price: number
    trade_type: "buy" | "sell"
  },
): Promise<{ trade: Trade | null; post: Post | null; error: Error | null }> {
  try {
    const totalValue = tradeData.quantity * tradeData.price

    // Record trade in trades table (you'll need to create this table)
    const tradeRecord: Trade = {
      id: crypto.randomUUID(),
      user_id: userId,
      game_id: gameId,
      stock_symbol: tradeData.stock_symbol,
      quantity: tradeData.quantity,
      price: tradeData.price,
      trade_type: tradeData.trade_type,
      timestamp: new Date().toISOString(),
      total_value: totalValue,
    }

    // Create activity post for the trade
    const postContent = `${tradeData.trade_type === "buy" ? "Bought" : "Sold"} ${tradeData.quantity} shares of ${tradeData.stock_symbol} for $${tradeData.price.toFixed(2)} each. Total: $${totalValue.toFixed(2)}`

    const { post, error: postError } = await createPost(userId, gameId, {
      content: postContent,
      stock_symbol: tradeData.stock_symbol,
      trade_type: tradeData.trade_type,
      trade_quantity: tradeData.quantity,
      trade_price: tradeData.price,
    })

    if (postError) throw postError

    return { trade: tradeRecord, post, error: null }
  } catch (error) {
    console.error("Error recording trade:", error)
    return { trade: null, post: null, error: error as Error }
  }
}

// Subscribe to real-time updates for posts
export function subscribeToGamePosts(gameId: string, callback: (posts: Post[]) => void) {
  const subscription = supabase
    .channel(`posts-${gameId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_posts",
        filter: `game_id=eq.${gameId}`,
      },
      () => {
        // Refetch posts when changes occur
        getGamePosts(gameId).then(({ posts }) => {
          callback(posts)
        })
      },
    )
    .subscribe()

  return subscription
}

// Subscribe to real-time updates for comments
export function subscribeToPostComments(postId: string, callback: (comments: Comment[]) => void) {
  const subscription = supabase
    .channel(`comments-${postId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "post_comments",
        filter: `post_id=eq.${postId}`,
      },
      () => {
        // Refetch comments when changes occur
        getPostComments(postId).then(({ comments }) => {
          callback(comments)
        })
      },
    )
    .subscribe()

  return subscription
}

// Subscribe to real-time updates for likes
export function subscribeToPostLikes(postId: string, callback: () => void) {
  const subscription = supabase
    .channel(`likes-${postId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "post_likes",
        filter: `post_id=eq.${postId}`,
      },
      callback,
    )
    .subscribe()

  return subscription
}
