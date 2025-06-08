import { createServerSupabaseClient } from "./supabase"

export async function getServerData(
  table: string,
  options?: {
    select?: string
    eq?: [string, any]
    order?: string
    limit?: number
  },
) {
  try {
    const supabase = createServerSupabaseClient()

    let query = supabase.from(table)

    if (options?.select) {
      query = query.select(options.select)
    } else {
      query = query.select("*")
    }

    if (options?.eq) {
      query = query.eq(options.eq[0], options.eq[1])
    }

    if (options?.order) {
      query = query.order(options.order)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error fetching from ${table}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error(`Server data fetch error:`, error)
    return null
  }
}
