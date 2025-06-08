"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchResult {
  symbol: string
  name: string
  type: string
  region: string
  matchScore: number
}

interface StockSearchProps {
  onStockSelect?: (symbol: string) => void
  placeholder?: string
  className?: string
}

export function StockSearch({ onStockSelect, placeholder = "Search stocks...", className = "" }: StockSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchStocks(query)
      }, 300)
    } else {
      setResults([])
      setShowResults(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const searchStocks = async (searchQuery: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`)
      const result = await response.json()

      if (result.success) {
        setResults(result.data)
        setShowResults(true)
      } else {
        setError(result.error)
        setResults([])
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("Search failed")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleStockSelect = (symbol: string) => {
    setQuery("")
    setResults([])
    setShowResults(false)
    if (onStockSelect) {
      onStockSelect(symbol)
    }
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setShowResults(false)
    setError(null)
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true)
            }
          }}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Searching...</span>
            </div>
          )}

          {error && <div className="p-4 text-center text-red-600 text-sm">{error}</div>}

          {!loading && !error && results.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-gray-500 text-sm">No stocks found for "{query}"</div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((stock) => (
                <button
                  key={stock.symbol}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  onClick={() => handleStockSelect(stock.symbol)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{stock.symbol}</div>
                      <div className="text-sm text-gray-600 truncate">{stock.name}</div>
                      <div className="text-xs text-gray-400">
                        {stock.type} • {stock.region}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Match: {(stock.matchScore * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
