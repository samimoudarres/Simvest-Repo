"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function SetupEnvironment() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("")
  const [serviceRoleKey, setServiceRoleKey] = useState("")
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  // Check if we already have environment variables
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize window.ENV if it doesn't exist
      window.ENV = window.ENV || {}

      // Check if we have stored values
      const storedUrl = localStorage.getItem("SUPABASE_URL")
      const storedAnonKey = localStorage.getItem("SUPABASE_ANON_KEY")
      const storedServiceKey = localStorage.getItem("SUPABASE_SERVICE_ROLE_KEY")

      if (storedUrl) setSupabaseUrl(storedUrl)
      if (storedAnonKey) setSupabaseAnonKey(storedAnonKey)
      if (storedServiceKey) setServiceRoleKey(storedServiceKey)
    }
  }, [])

  const saveEnvironmentVariables = async () => {
    setStatus("testing")
    setMessage("Testing connection...")

    try {
      // Save to localStorage
      localStorage.setItem("SUPABASE_URL", supabaseUrl)
      localStorage.setItem("SUPABASE_ANON_KEY", supabaseAnonKey)
      localStorage.setItem("SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey)

      // Set in window.ENV for immediate use
      if (typeof window !== "undefined") {
        window.ENV = {
          ...window.ENV,
          SUPABASE_URL: supabaseUrl,
          SUPABASE_ANON_KEY: supabaseAnonKey,
          SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
        }
      }

      // Test the connection
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase.from("users").select("count()", { count: "exact" }).limit(1)

      if (error) throw error

      setStatus("success")
      setMessage("Connection successful! You can now use the app.")

      // Reload after 2 seconds to apply changes
      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
    } catch (error) {
      console.error("Connection test failed:", error)
      setStatus("error")
      setMessage(`Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>SimVest Environment Setup</CardTitle>
          <CardDescription>Configure your Supabase connection to enable backend functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supabaseUrl">Supabase URL</Label>
            <Input
              id="supabaseUrl"
              placeholder="https://your-project.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabaseAnonKey">Supabase Anon Key</Label>
            <Input
              id="supabaseAnonKey"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">This is your public API key (anon/public)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceRoleKey">Service Role Key (Optional)</Label>
            <Input
              id="serviceRoleKey"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={serviceRoleKey}
              onChange={(e) => setServiceRoleKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">For server-side operations (keep this secret)</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={saveEnvironmentVariables}
            className="w-full"
            disabled={status === "testing" || !supabaseUrl || !supabaseAnonKey}
          >
            {status === "testing" ? "Testing..." : "Save and Test Connection"}
          </Button>
          {message && (
            <p
              className={`text-sm ${status === "success" ? "text-green-600" : status === "error" ? "text-red-600" : "text-gray-600"}`}
            >
              {message}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
