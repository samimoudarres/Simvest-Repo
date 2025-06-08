// Define types
export interface Post {
  id: string
  user_id: string
  game_id: string
  content: string
  created_at: string
  likes: number
  comments: number
  user: {
    name: string
    avatar?: string
  }
  liked_by_user: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user: {
    name: string
    avatar?: string
  }
}

// Mock data
const mockPosts: Post[] = [
  {
    id: "post_1",
    user_id: "user_1",
    game_id: "november-2024",
    content: "Just bought 10 shares of AAPL. Looking bullish for the next quarter!",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    likes: 5,
    comments: 2,
    user: {
      name: "John Trader",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    liked_by_user: false,
  },
  {
    id: "post_2",
    user_id: "user_2",
    game_id: "november-2024",
    content: "TSLA is on fire today! Up 5% already. Anyone else riding this wave?",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    likes: 12,
    comments: 4,
    user: {
      name: "Sarah Investor",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    liked_by_user: true,
  },
]

const mockComments: Record<string, Comment[]> = {
  post_1: [
    {
      id: "comment_1",
      post_id: "post_1",
      user_id: "user_3",
      content: "Good call! I think Apple's new product line will boost their stock.",
      created_at: new Date(Date.now() - 1800000).toISOString(),
      user: {
        name: "Mike Analyst",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    },
  ],
  post_2: [
    {
      id: "comment_2",
      post_id: "post_2",
      user_id: "user_4",
      content: "I sold too early! 😭",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user: {
        name: "Alex Trader",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    },
  ],
}

// Social interactions service
export const getActivityPosts = async (gameId: string, userId: string) => {
  try {
    // Filter posts by game ID
    const posts = mockPosts.filter((post) => post.game_id === gameId)

    return {
      success: true,
      posts,
    }
  } catch (error) {
    console.error("Error fetching posts:", error)
    return {
      success: false,
      error: "Failed to fetch posts",
      posts: [],
    }
  }
}

export const createPost = async (gameId: string, userId: string, content: string) => {
  try {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      user_id: userId,
      game_id: gameId,
      content,
      created_at: new Date().toISOString(),
      likes: 0,
      comments: 0,
      user: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      liked_by_user: false,
    }

    // Add to mock posts
    mockPosts.unshift(newPost)

    return {
      success: true,
      post: newPost,
    }
  } catch (error) {
    console.error("Error creating post:", error)
    return {
      success: false,
      error: "Failed to create post",
    }
  }
}

export const likePost = async (postId: string, userId: string) => {
  try {
    const post = mockPosts.find((p) => p.id === postId)

    if (!post) {
      return {
        success: false,
        error: "Post not found",
      }
    }

    if (post.liked_by_user) {
      post.likes -= 1
      post.liked_by_user = false
    } else {
      post.likes += 1
      post.liked_by_user = true
    }

    return {
      success: true,
      liked: post.liked_by_user,
      likes: post.likes,
    }
  } catch (error) {
    console.error("Error liking post:", error)
    return {
      success: false,
      error: "Failed to like post",
    }
  }
}

export const addComment = async (postId: string, userId: string, content: string) => {
  try {
    const post = mockPosts.find((p) => p.id === postId)

    if (!post) {
      return {
        success: false,
        error: "Post not found",
      }
    }

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      post_id: postId,
      user_id: userId,
      content,
      created_at: new Date().toISOString(),
      user: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    }

    // Initialize comments array if it doesn't exist
    if (!mockComments[postId]) {
      mockComments[postId] = []
    }

    // Add comment
    mockComments[postId].push(newComment)

    // Update comment count
    post.comments += 1

    return {
      success: true,
      comment: newComment,
    }
  } catch (error) {
    console.error("Error adding comment:", error)
    return {
      success: false,
      error: "Failed to add comment",
    }
  }
}

export const getPostComments = async (postId: string) => {
  try {
    const comments = mockComments[postId] || []

    return {
      success: true,
      comments,
    }
  } catch (error) {
    console.error("Error fetching comments:", error)
    return {
      success: false,
      error: "Failed to fetch comments",
      comments: [],
    }
  }
}

export const hasUserLikedPost = async (postId: string, userId: string) => {
  try {
    const post = mockPosts.find((p) => p.id === postId)
    return post?.liked_by_user || false
  } catch (error) {
    console.error("Error checking if user liked post:", error)
    return false
  }
}
