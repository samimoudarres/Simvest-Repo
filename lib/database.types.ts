export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          display_name: string
          profile_picture_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          display_name: string
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          display_name?: string
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      games: {
        Row: {
          id: string
          game_code: string
          title: string
          host_id: string | null
          start_date: string | null
          end_date: string | null
          buy_in_amount: number | null
          prize_pool: number | null
          max_players: number | null
          status: string
          created_at: string
          description: string | null
          current_players: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          game_code: string
          title: string
          host_id?: string | null
          start_date?: string | null
          end_date?: string | null
          buy_in_amount?: number | null
          prize_pool?: number | null
          max_players?: number | null
          status?: string
          created_at?: string
          description?: string | null
          current_players?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          game_code?: string
          title?: string
          host_id?: string | null
          start_date?: string | null
          end_date?: string | null
          buy_in_amount?: number | null
          prize_pool?: number | null
          max_players?: number | null
          status?: string
          created_at?: string
          description?: string | null
          current_players?: number | null
          updated_at?: string | null
        }
      }
      game_participants: {
        Row: {
          id: string
          game_id: string
          user_id: string
          joined_at: string
          initial_balance: number
          current_balance: number
          total_return: number
          daily_return: number
          rank: number | null
        }
        Insert: {
          id?: string
          game_id: string
          user_id: string
          joined_at?: string
          initial_balance?: number
          current_balance?: number
          total_return?: number
          daily_return?: number
          rank?: number | null
        }
        Update: {
          id?: string
          game_id?: string
          user_id?: string
          joined_at?: string
          initial_balance?: number
          current_balance?: number
          total_return?: number
          daily_return?: number
          rank?: number | null
        }
      }
      user_portfolios: {
        Row: {
          id: string
          user_id: string
          game_id: string
          stock_symbol: string
          shares_owned: number
          purchase_price: number
          purchase_date: string
          current_value: number | null
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          stock_symbol: string
          shares_owned: number
          purchase_price: number
          purchase_date?: string
          current_value?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          stock_symbol?: string
          shares_owned?: number
          purchase_price?: number
          purchase_date?: string
          current_value?: number | null
        }
      }
      user_posts: {
        Row: {
          id: string
          user_id: string
          game_id: string
          content: string
          stock_symbol: string | null
          trade_type: string | null
          likes_count: number
          comments_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          content: string
          stock_symbol?: string | null
          trade_type?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          content?: string
          stock_symbol?: string | null
          trade_type?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_game_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
