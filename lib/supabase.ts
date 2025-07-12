import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

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
  // In-memory demo user for mock admin methods
  let demoUser: any = null

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
      // Mock onAuthStateChange to match Supabase API
      onAuthStateChange: (callback: any) => {
        setTimeout(() => callback("SIGNED_OUT", null), 0)
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        }
      },
      admin: {
        // Mock listUsers to return the demo user if created
        listUsers: async () => {
          return {
            data: {
              users: demoUser ? [demoUser] : [],
            },
            error: null,
          }
        },
        // Mock createUser to create the demo user in memory
        createUser: async ({ email, password, email_confirm }: any) => {
          demoUser = {
            id: "demo-user-id",
            email,
            email_confirmed_at: email_confirm ? new Date().toISOString() : null,
          }
          return {
            data: {
              user: demoUser,
            },
            error: null,
          }
        },
      },
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
  }

  return mockMethods as unknown as SupabaseClient
}

// Update the server client creation to be more robust too
export function createServerSupabaseClient() {
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
  })
}

// For backward compatibility - DO NOT USE THIS DIRECTLY
// This is only here to prevent breaking changes
export const supabase = createClientSupabaseClient()