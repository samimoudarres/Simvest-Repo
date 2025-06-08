export const GET_USER = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      username
      email
      displayName
      avatarUrl
      createdAt
      updatedAt
    }
  }
`

export const GET_USER_BY_USERNAME = `
  query GetUserByUsername($username: String!) {
    userByUsername(username: $username) {
      id
      username
      email
      displayName
      avatarUrl
      createdAt
      updatedAt
    }
  }
`

export const GET_GAME = `
  query GetGame($gameCode: String!) {
    game(gameCode: $gameCode) {
      id
      gameCode
      name
      description
      creatorId
      status
      startingBalance
      createdAt
      participants {
        id
        userId
        joinedAt
        currentBalance
        user {
          username
          displayName
          avatarUrl
        }
      }
    }
  }
`

export const GET_USER_GAMES = `
  query GetUserGames($userId: ID!) {
    userGames(userId: $userId) {
      id
      gameCode
      name
      description
      status
      startingBalance
      createdAt
      participants {
        id
        userId
        currentBalance
        user {
          username
          displayName
          avatarUrl
        }
      }
    }
  }
`

export const GET_PORTFOLIO = `
  query GetPortfolio($userId: ID!, $gameId: ID!) {
    portfolio(userId: $userId, gameId: $gameId) {
      id
      userId
      gameId
      totalValue
      totalGainLoss
      totalGainLossPercent
      stocks {
        id
        symbol
        quantity
        averagePrice
        currentPrice
        totalValue
        gainLoss
        gainLossPercent
      }
      updatedAt
    }
  }
`

export const GET_TRADES = `
  query GetTrades($userId: ID!, $gameId: ID!) {
    trades(userId: $userId, gameId: $gameId) {
      id
      symbol
      type
      quantity
      price
      totalValue
      createdAt
    }
  }
`

export const GET_ACTIVITY_FEED = `
  query GetActivityFeed($gameId: ID!, $limit: Int, $offset: Int) {
    activityFeed(gameId: $gameId, limit: $limit, offset: $offset) {
      id
      userId
      content
      type
      metadata
      createdAt
      user {
        username
        displayName
        avatarUrl
      }
      likes {
        id
        userId
      }
      comments {
        id
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
  }
`

export const GET_LEADERBOARD = `
  query GetLeaderboard($gameId: ID!) {
    leaderboard(gameId: $gameId) {
      id
      userId
      currentBalance
      totalGainLoss
      totalGainLossPercent
      rank
      user {
        username
        displayName
        avatarUrl
      }
    }
  }
`

export const GET_STOCK_DATA = `
  query GetStockData($symbol: String!) {
    stockData(symbol: $symbol) {
      symbol
      name
      price
      change
      changePercent
      volume
      marketCap
      peRatio
      dividendYield
      high52Week
      low52Week
      updatedAt
    }
  }
`

export const SEARCH_STOCKS = `
  query SearchStocks($query: String!, $limit: Int) {
    searchStocks(query: $query, limit: $limit) {
      symbol
      name
      price
      change
      changePercent
      exchange
    }
  }
`
