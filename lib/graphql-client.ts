import { supabase } from "./supabase"

export class GraphQLClient {
  private endpoint: string

  constructor(endpoint = "/api/graphql") {
    this.endpoint = endpoint
  }

  async query<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}`,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "GraphQL query failed")
      }

      return result.data
    } catch (error) {
      console.error("GraphQL query error:", error)
      throw error
    }
  }

  async mutate<T = any>(mutation: string, variables?: Record<string, any>): Promise<T> {
    return this.query<T>(mutation, variables)
  }
}

export const graphqlClient = new GraphQLClient()
