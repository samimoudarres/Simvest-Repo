interface Window {
  ENV?: {
    SUPABASE_URL?: string
    SUPABASE_ANON_KEY?: string
    SUPABASE_SERVICE_ROLE_KEY?: string
    [key: string]: string | undefined
  }
}
