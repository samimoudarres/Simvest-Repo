export const CREATE_USER = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      username
      email
      displayName
      avatarUrl
      createdAt
    }
  }
`

export const UPDATE_USER = `
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      username
      email
      displayName
      avatarUrl
      updatedAt
    }
  }
`

export const CREATE_GAME = `
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
      id
      gameCode
      name
      description
      creatorId
      status
      startingBalance
      createdAt
    }
  }
`

export const JOIN_GAME = `
  mutation JoinGame($gameCode: String!, $userId: ID!) {
    joinGame(gameCode: $gameCode, userId: $userId) {
      id
      gameId
      userId
      joinedAt
      currentBalance
    }
  }
`

export const CREATE_TRADE = `
  mutation CreateTrade($input: CreateTradeInput!) {
    createTrade(input: $input) {
      id
      userId
      gameId
      symbol
      type
      quantity
      price
      totalValue
      createdAt
    }
  }
`

export const CREATE_POST = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      userId
      gameId
      content
      type
      metadata
      createdAt
      user {
        username
        displayName
        avatarUrl
      }
    }
  }
`

export const LIKE_POST = `
  mutation LikePost($postId: ID!, $userId: ID!) {
    likePost(postId: $postId, userId: $userId) {
      id
      postId
      userId
      createdAt
    }
  }
`

export const UNLIKE_POST = `
  mutation UnlikePost($postId: ID!, $userId: ID!) {
    unlikePost(postId: $postId, userId: $userId)
  }
`

export const CREATE_COMMENT = `
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      postId
      userId
      content
      createdAt
      user {
        username
        displayName
        avatarUrl
      }
    }
  }
`

export const UPDATE_PORTFOLIO = `
  mutation UpdatePortfolio($input: UpdatePortfolioInput!) {
    updatePortfolio(input: $input) {
      id
      userId
      gameId
      totalValue
      totalGainLoss
      totalGainLossPercent
      updatedAt
    }
  }
`
