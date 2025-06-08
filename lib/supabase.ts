import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Create a singleton instance for client-side
let clientInstance: SupabaseClient | null = null

export function createClientSupabaseClient() {
  if (clientInstance) return clientInstance

  // Get environment variables with fallbacks
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || (typeof window !== "undefined" ? window.ENV?.SUPABASE_URL : "")
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (typeof window !== "undefined" ? window.ENV?.SUPABASE_ANON_KEY : "")

  // Check if we have the required variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables. Using mock client.")
    // Return a mock client that won't throw errors but won't connect to Supabase
    return createMockClient()
  }

  // Create with consistent storage key
  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: "simvest-auth-storage",
      persistSession: true,
    },
  })

  return clientInstance
}

// Add this mock client function
function createMockClient() {
  // This creates a mock client that won't throw errors when methods are called
  // It allows the app to function without Supabase connection
  const mockMethods = {
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      upsert: () => ({ data: null, error: null }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
  }

  return mockMethods as unknown as SupabaseClient
}

// Update the server client creation to be more robust too
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables for server client.")
    return createMockClient() as unknown as SupabaseClient
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  })
}

// For backward compatibility - DO NOT USE THIS DIRECTLY
// This is only here to prevent breaking changes
export const supabase = createClientSupabaseClient()
