import { supabase } from "./supabase"
import type { Tables } from "./database.types"

export type Post = Tables<"user_posts">
export type Comment = Tables<"post_comments">

// Create a post
export async function createPost(
  userId: string,
  gameId: string,
  postData: {
    content: string
    stock_symbol?: string
    trade_type?: string
  },
): Promise<{ post: Post | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("user_posts")
      .insert({
        user_id: userId,
        game_id: gameId,
        ...postData,
      })
      .select()
      .single()

    if (error) throw error

    return { post: data, error: null }
  } catch (error) {
    console.error("Error creating post:", error)
    return { post: null, error: error as Error }
  }
}

// Get posts for a game
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
        users:user_id (
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

// Like a post
export async function likePost(userId: string, postId: string): Promise<{ success: boolean; error: Error | null }> {
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
      return { success: true, error: null } // Already liked
    }

    // Add like
    const { error: likeError } = await supabase.from("post_likes").insert({
      user_id: userId,
      post_id: postId,
    })

    if (likeError) throw likeError

    // Update likes count
    const { error: updateError } = await supabase.rpc("increment_likes_count", {
      post_id: postId,
    })

    if (updateError) throw updateError

    return { success: true, error: null }
  } catch (error) {
    console.error("Error liking post:", error)
    return { success: false, error: error as Error }
  }
}

// Unlike a post
export async function unlikePost(userId: string, postId: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Remove like
    const { error: unlikeError } = await supabase
      .from("post_likes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId)

    if (unlikeError) throw unlikeError

    // Update likes count
    const { error: updateError } = await supabase.rpc("decrement_likes_count", {
      post_id: postId,
    })

    if (updateError) throw updateError

    return { success: true, error: null }
  } catch (error) {
    console.error("Error unliking post:", error)
    return { success: false, error: error as Error }
  }
}

// Comment on a post
export async function commentOnPost(
  userId: string,
  postId: string,
  content: string,
): Promise<{ comment: Comment | null; error: Error | null }> {
  try {
    // Add comment
    const { data, error: commentError } = await supabase
      .from("post_comments")
      .insert({
        user_id: userId,
        post_id: postId,
        content,
      })
      .select()
      .single()

    if (commentError) throw commentError

    // Update comments count
    const { error: updateError } = await supabase.rpc("increment_comments_count", {
      post_id: postId,
    })

    if (updateError) throw updateError

    return { comment: data, error: null }
  } catch (error) {
    console.error("Error commenting on post:", error)
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
        users:user_id (
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
