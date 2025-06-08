"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, TrendingUp, DollarSign, Zap } from "lucide-react"
import { searchSymbols } from "@/lib/stock-symbols"
import { alphaVantageService } from "@/lib/alpha-vantage-service"

interface SearchResult {
  symbol: string
  name: string
  type: string
  price?: number
  change?: number
  changePercent?: number
}

interface SearchableStockInputProps {
  placeholder?: string
  onSelect?: (symbol: string) => void
  className?: string
}

export function SearchableStockInput({
  placeholder = "Search stocks (e.g., AAPL, Tesla, Bitcoin)...",
  onSelect,
  className = "",
}: SearchableStockInputProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const debounceTimeout = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    // Debounce search
    clearTimeout(debounceTimeout.current)
    debounceTimeout.current = setTimeout(async () => {
      await performSearch(query)
    }, 300)

    return () => clearTimeout(debounceTimeout.current)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      // First, search local symbols for instant results
      const localResults = searchSymbols(searchQuery)
      const enhancedResults: SearchResult[] = localResults.map((result) => ({
        ...result,
        price: undefined,
        change: undefined,
        changePercent: undefined,
      }))

      setResults(enhancedResults)
      setIsOpen(true)

      // Then try Alpha Vantage search for more comprehensive results
      try {
        const apiResults = await alphaVantageService.searchSymbols(searchQuery)
        const combinedResults = [
          ...enhancedResults,
          ...apiResults
            .filter((apiResult) => !enhancedResults.find((local) => local.symbol === apiResult.symbol))
            .map((apiResult) => ({
              symbol: apiResult.symbol,
              name: apiResult.name,
              type: apiResult.type || "Stock",
            })),
        ].slice(0, 10)

        setResults(combinedResults)
      } catch (apiError) {
        console.warn("API search failed, using local results:", apiError)
      }
    } catch (error) {
      console.error("Search failed:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStockSelect = (symbol: string) => {
    if (onSelect) {
      onSelect(symbol)
    } else {
      router.push(`/challenge/stock/${symbol}`)
    }
    setQuery("")
    setResults([])
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleInputFocus = () => {
    if (results.length > 0) {
      setIsOpen(true)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "cryptocurrency":
        return <Zap className="w-4 h-4 text-yellow-500" />
      case "etf":
        return <TrendingUp className="w-4 h-4 text-blue-500" />
      default:
        return <DollarSign className="w-4 h-4 text-green-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "cryptocurrency":
        return "text-yellow-600 bg-yellow-50"
      case "etf":
        return "text-blue-600 bg-blue-50"
      default:
        return "text-green-600 bg-green-50"
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && (results.length > 0 || isLoading) && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto mt-1"
        >
          {isLoading && results.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Searching...
            </div>
          )}

          {results.map((stock, index) => (
            <button
              key={`${stock.symbol}-${index}`}
              onClick={() => handleStockSelect(stock.symbol)}
              className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(stock.type)}
                  <div>
                    <div className="font-semibold text-gray-900">{stock.symbol}</div>
                    <div className="text-sm text-gray-600 truncate max-w-xs">{stock.name}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(stock.type)}`}>
                    {stock.type}
                  </span>
                  {stock.price && (
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${stock.price.toFixed(2)}</div>
                      {stock.changePercent && (
                        <div className={`text-sm ${stock.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {stock.changePercent >= 0 ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}

          {results.length === 0 && !isLoading && query.length >= 2 && (
            <div className="p-4 text-center text-gray-500">No results found for "{query}"</div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchableStockInput
