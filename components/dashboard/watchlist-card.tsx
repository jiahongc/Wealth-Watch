'use client'

import React, { useState, useEffect } from 'react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown, Plus, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiService, StockData, HistoricalData } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WatchlistStock {
  ticker: string
  company: string
  price: number
  change: number
  changePercent: number
  icon: string
}

interface WatchlistCardProps {
  title?: string
}

export default function WatchlistCard({ title = "Watchlist" }: WatchlistCardProps) {
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
  const [error, setError] = useState<string | null>(null)
  const [selectedStock, setSelectedStock] = useState<WatchlistStock | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('3M')
  const [chartData, setChartData] = useState<HistoricalData | null>(null)
  const [chartLoading, setChartLoading] = useState(false)

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
    setError(null)
    setLoading(true)
    try {
      const symbols = watchlistStocks.map(stock => stock.ticker)
      if (symbols.length === 0) return
      
      const quotes = await apiService.getMultipleQuotes(symbols)
      
      setWatchlistStocks(prevStocks => {
        return prevStocks.map(stock => {
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
      })
    } catch (error) {
      console.error('Error refreshing prices:', error)
      setError('Failed to refresh prices')
    } finally {
      setLoading(false)
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

  const handleStockClick = (stock: WatchlistStock) => {
    setSelectedStock(stock)
    setSelectedPeriod('3M')
    loadChartData(stock.ticker, '3M')
  }

  const loadChartData = async (symbol: string, period: string) => {
    setChartLoading(true)
    try {
      const data = await apiService.getStockHistory(symbol, period)
      setChartData(data)
    } catch (error) {
      console.error('Error loading chart data:', error)
      setError('Failed to load chart data')
    } finally {
      setChartLoading(false)
    }
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (selectedStock) {
      loadChartData(selectedStock.ticker, period)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const isPositive = data.day_change >= 0
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Price: <span className="font-medium">{formatCurrency(data.close)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Change: <span className={cn('font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
              {isPositive ? '+' : ''}{formatCurrency(data.day_change)} ({isPositive ? '+' : ''}{formatPercent(Math.abs(data.day_change_percent))})
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Volume: {data.volume.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshPrices}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Add Stock Form */}
          {showAddForm && (
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Label htmlFor="new-symbol" className="sr-only">Stock Symbol</Label>
                <Input
                  id="new-symbol"
                  placeholder="Enter stock symbol (e.g., AAPL)"
                  value={newStockSymbol}
                  onChange={(e) => setNewStockSymbol(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && addStock()}
                  className="text-sm"
                />
              </div>
              <Button onClick={addStock} size="sm" className="px-3">
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false)
                  setNewStockSymbol('')
                  setError(null)
                }}
                className="px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
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
                  <div 
                    key={stock.ticker} 
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
                    onClick={() => handleStockClick(stock)}
                  >
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
                        onClick={(e) => {
                          e.stopPropagation()
                          removeStock(stock.ticker)
                        }}
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
        </CardContent>
      </Card>

      {/* Stock Chart Popup */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                  {selectedStock.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedStock.ticker}</h2>
                  <p className="text-gray-600">{selectedStock.company}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStock(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Time Period Selector */}
            <div className="flex space-x-2 mb-4">
              {['1M', '3M', '6M', 'YTD', '1Y', '3Y'].map((period) => (
                <Button
                  key={period}
                  variant={period === '3M' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => handlePeriodChange(period)}
                >
                  {period}
                </Button>
              ))}
            </div>
            
            {/* Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              {chartLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Loading chart data...</p>
                  </div>
                </div>
              ) : chartData && chartData.data.length > 0 ? (
                <div className="space-y-4">
                  {/* Price Chart */}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          fontSize={12}
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          tickFormatter={(value) => formatCurrency(value)}
                          domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="close" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: '#3b82f6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* RSI Chart */}
                  <div className="h-32">
                    <div className="text-sm font-medium text-gray-700 mb-2">RSI (14)</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          fontSize={10}
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={10}
                          domain={[0, 100]}
                          ticks={[0, 30, 50, 70, 100]}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-lg text-xs">
                                  <p className="font-semibold text-gray-900">{label}</p>
                                  <p className="text-gray-600">
                                    RSI: <span className="font-medium">{data.rsi?.toFixed(2) || 'N/A'}</span>
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rsi" 
                          stroke="#8b5cf6" 
                          strokeWidth={1.5}
                          dot={false}
                          activeDot={{ r: 3, fill: '#8b5cf6' }}
                        />
                        {/* Overbought line (70) */}
                        <Line 
                          type="monotone" 
                          dataKey={() => 70} 
                          stroke="#ef4444" 
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                        {/* Oversold line (30) */}
                        <Line 
                          type="monotone" 
                          dataKey={() => 30} 
                          stroke="#ef4444" 
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-gray-500">No chart data available</p>
                    <p className="text-sm text-gray-400 mt-1">Try selecting a different time period</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 