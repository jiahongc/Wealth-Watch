'use client'

import { useState, useEffect } from 'react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown, Plus, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiService, StockData } from '@/lib/api'

interface WatchlistStock {
  ticker: string
  company: string
  price: number
  change: number
  changePercent: number
  icon: string
}

export function WatchlistCard() {
  const [watchlistStocks, setWatchlistStocks] = useState<WatchlistStock[]>([
    {
      ticker: 'AAPL',
      company: 'Apple Inc.',
      price: 175.23,
      change: 2.45,
      changePercent: 1.42,
      icon: '🍎'
    },
    {
      ticker: 'GOOGL',
      company: 'Alphabet Inc.',
      price: 142.56,
      change: 0.89,
      changePercent: 0.63,
      icon: '🔍'
    },
    {
      ticker: 'TSLA',
      company: 'Tesla, Inc.',
      price: 248.42,
      change: 5.67,
      changePercent: 2.34,
      icon: '🚗'
    }
  ])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newStockSymbol, setNewStockSymbol] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getStockIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      'AAPL': '🍎',
      'MSFT': '💻',
      'GOOGL': '🔍',
      'TSLA': '🚗',
      'AMZN': '📦',
      'NVDA': '🎮',
      'META': '📘',
      'NFLX': '📺',
      'SPOT': '🎵',
      'ABNB': '🏠'
    }
    return icons[symbol] || '📈'
  }

  const refreshPrices = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const symbols = watchlistStocks.map(stock => stock.ticker)
      if (symbols.length === 0) {
        setRefreshing(false)
        return
      }
      
      const quotes = await apiService.getMultipleQuotes(symbols)
      setWatchlistStocks(prevStocks => 
        prevStocks.map(stock => {
          const quote = quotes.find(q => q.symbol === stock.ticker)
          if (quote) {
            return {
              ...stock,
              company: quote.name,
              price: quote.price,
              change: quote.change,
              changePercent: quote.change_percent
            }
          }
          return stock
        })
      )
    } catch (error) {
      setError('Failed to refresh prices. Please try again.')
    } finally {
      setRefreshing(false)
    }
  }

  const addStock = async () => {
    if (!newStockSymbol.trim()) return
    
    setLoading(true)
    setError(null)
    try {
      const stockQuote = await apiService.getStockQuote(newStockSymbol.trim())
      
      const newStock: WatchlistStock = {
        ticker: stockQuote.symbol,
        company: stockQuote.name,
        price: stockQuote.price,
        change: stockQuote.change,
        changePercent: stockQuote.change_percent,
        icon: getStockIcon(stockQuote.symbol)
      }
      
      setWatchlistStocks(prev => [...prev, newStock])
      setNewStockSymbol('')
      setShowAddForm(false)
    } catch (error) {
      setError('Failed to add stock. Please check the symbol and try again.')
    } finally {
      setLoading(false)
    }
  }

  const removeStock = (ticker: string) => {
    setWatchlistStocks(prev => prev.filter(stock => stock.ticker !== ticker))
  }

  useEffect(() => {
    refreshPrices()
  }, [])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">My Watchlist</h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={refreshPrices}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="flex items-center space-x-1"
          >
            <Plus className="h-3 w-3" />
            <span>Add</span>
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Add Stock Form */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={newStockSymbol}
              onChange={(e) => setNewStockSymbol(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && addStock()}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={addStock} disabled={loading || !newStockSymbol.trim()}>
              {loading ? 'Adding...' : 'Add'}
            </Button>
            <Button
              onClick={() => {
                setShowAddForm(false)
                setNewStockSymbol('')
                setError(null)
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Watchlist Stocks */}
      <div className="space-y-4">
        {watchlistStocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No stocks in watchlist</p>
            <p className="text-xs">Add stocks to start tracking</p>
          </div>
        ) : (
          watchlistStocks.map((stock) => {
            const isPositive = stock.change >= 0
            
            return (
              <div key={stock.ticker} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                    {stock.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{stock.ticker}</div>
                    <div className="text-sm text-gray-500">{stock.company}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(stock.price)}
                    </div>
                    <div className={cn(
                      'flex items-center space-x-1 text-sm font-medium',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{formatPercent(Math.abs(stock.changePercent))}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeStock(stock.ticker)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
} 