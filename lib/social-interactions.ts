import { createClientSupabaseClient } from "./supabase"
import { v4 as uuidv4 } from "uuid"

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

export type Like = {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

const supabase = createClientSupabaseClient()

// LIKE FUNCTIONALITY - COMPLETELY FIXED
export async function toggleLike(
  userId: string,
  postId: string,
): Promise<{ success: boolean; liked: boolean; error?: string }> {
  try {
    console.log("🔄 Toggling like:", { userId, postId })

    // Check if user already liked this post
    const { data: existingLike, error: checkError } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("❌ Error checking existing like:", checkError)
      return { success: false, liked: false, error: checkError.message }
    }

    if (existingLike) {
      // UNLIKE - Remove the like
      console.log("👎 Removing like")
      const { error: deleteError } = await supabase.from("likes").delete().eq("id", existingLike.id)

      if (deleteError) {
        console.error("❌ Error removing like:", deleteError)
        return { success: false, liked: false, error: deleteError.message }
      }

      // Decrease likes count
      const { error: updateError } = await supabase
        .from("activity_posts")
        .update({ likes_count: Math.max(0, (await getCurrentLikesCount(postId)) - 1) })
        .eq("id", postId)

      if (updateError) {
        console.error("❌ Error updating likes count:", updateError)
      }

      console.log("✅ Like removed successfully")
      return { success: true, liked: false }
    } else {
      // LIKE - Add new like
      console.log("👍 Adding like")
      const { error: insertError } = await supabase.from("likes").insert({
        user_id: userId,
        post_id: postId,
      })

      if (insertError) {
        console.error("❌ Error adding like:", insertError)
        return { success: false, liked: false, error: insertError.message }
      }

      // Increase likes count
      const { error: updateError } = await supabase
        .from("activity_posts")
        .update({ likes_count: (await getCurrentLikesCount(postId)) + 1 })
        .eq("id", postId)

      if (updateError) {
        console.error("❌ Error updating likes count:", updateError)
      }

      console.log("✅ Like added successfully")
      return { success: true, liked: true }
    }
  } catch (error) {
    console.error("💥 Unexpected error in toggleLike:", error)
    return { success: false, liked: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Get current likes count from database
async function getCurrentLikesCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId)

  if (error) {
    console.error("Error getting likes count:", error)
    return 0
  }

  return count || 0
}

// Check if user has liked a post
export async function hasUserLikedPost(userId: string, postId: string): Promise<{ liked: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking like status:", error)
      return { liked: false, error: error.message }
    }

    return { liked: !!data }
  } catch (error) {
    console.error("Error checking like status:", error)
    return { liked: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// COMMENT FUNCTIONALITY - COMPLETELY FIXED
export async function addComment(
  userId: string,
  postId: string,
  commentText: string,
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    console.log("🔄 Adding comment:", { userId, postId, commentText })

    if (!commentText.trim()) {
      return { success: false, error: "Comment cannot be empty" }
    }

    // Insert the comment
    const { data: comment, error: insertError } = await supabase
      .from("comments")
      .insert({
        user_id: userId,
        post_id: postId,
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

    if (insertError) {
      console.error("❌ Error inserting comment:", insertError)
      return { success: false, error: insertError.message }
    }

    // Update comments count
    const { error: updateError } = await supabase
      .from("activity_posts")
      .update({ comments_count: (await getCurrentCommentsCount(postId)) + 1 })
      .eq("id", postId)

    if (updateError) {
      console.error("❌ Error updating comments count:", updateError)
    }

    console.log("✅ Comment added successfully:", comment)
    return { success: true, comment }
  } catch (error) {
    console.error("💥 Unexpected error in addComment:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Get current comments count from database
async function getCurrentCommentsCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId)

  if (error) {
    console.error("Error getting comments count:", error)
    return 0
  }

  return count || 0
}

// Get all comments for a post
export async function getPostComments(postId: string): Promise<{ comments: Comment[]; error?: string }> {
  try {
    console.log("🔄 Fetching comments for post:", postId)

    const { data: comments, error } = await supabase
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

    if (error) {
      console.error("❌ Error fetching comments:", error)
      return { comments: [], error: error.message }
    }

    console.log("✅ Comments fetched successfully:", comments?.length || 0)
    return { comments: comments || [] }
  } catch (error) {
    console.error("💥 Unexpected error in getPostComments:", error)
    return { comments: [], error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// ACTIVITY POSTS - COMPLETELY FIXED
export async function getActivityPosts(gameId: string): Promise<{ posts: ActivityPost[]; error?: string }> {
  try {
    console.log("🔄 Fetching activity posts for game:", gameId)

    const { data: posts, error } = await supabase
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

    if (error) {
      console.error("❌ Error fetching activity posts:", error)
      return { posts: [], error: error.message }
    }

    console.log("✅ Activity posts fetched successfully:", posts?.length || 0)
    return { posts: posts || [] }
  } catch (error) {
    console.error("💥 Unexpected error in getActivityPosts:", error)
    return { posts: [], error: error instanceof Error ? error.message : "Unknown error" }
  }
}

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
): Promise<{ success: boolean; post?: ActivityPost; error?: string }> {
  try {
    console.log("🔄 Creating activity post:", { userId, gameId, postData })

    const postId = uuidv4() // Generate UUID

    const { data: post, error } = await supabase
      .from("activity_posts")
      .insert({
        id: postId, // Use generated UUID
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
      return { success: false, error: error.message }
    }

    console.log("✅ Activity post created successfully:", post)
    return { success: true, post }
  } catch (error) {
    console.error("💥 Unexpected error in createActivityPost:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// REAL-TIME SUBSCRIPTIONS
export function subscribeToActivityPosts(gameId: string, callback: (posts: ActivityPost[]) => void) {
  const subscription = supabase
    .channel(`activity-posts-${gameId}`)
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
