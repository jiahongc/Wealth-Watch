'use client'

import { useState, useEffect } from 'react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, X } from 'lucide-react'
import { apiService, StockData, HistoricalData } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface IndexData extends StockData {
  fullName: string
}

export function MarketIndices() {
  const [indices, setIndices] = useState<IndexData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<IndexData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('3M')
  const [chartData, setChartData] = useState<HistoricalData | null>(null)
  const [chartLoading, setChartLoading] = useState(false)

  const fetchIndexData = async () => {
    try {
      setError(null)
      setLoading(true)
      // Fetch data for major market indices
      const symbols = ['^GSPC', '^DJI', '^IXIC', '^RUT']
      const indexData = await apiService.getMultipleQuotes(symbols)
      
      // Map the API data to include full names
      const indicesWithNames: IndexData[] = indexData.map(index => {
        return {
          ...index,
          fullName: getIndexFullName(index.symbol)
        }
      })
      
      setIndices(indicesWithNames)
    } catch (error) {
      console.error('Error fetching index data:', error)
      setError('Failed to fetch market index data')
    } finally {
      setLoading(false)
    }
  }

  const getIndexFullName = (symbol: string) => {
    const names: { [key: string]: string } = {
      '^GSPC': 'S&P 500',
      '^DJI': 'Dow Jones',
      '^IXIC': 'NASDAQ',
      '^RUT': 'Russell 2000'
    }
    return names[symbol] || symbol
  }

  const handleIndexClick = (index: IndexData) => {
    setSelectedIndex(index)
    setSelectedPeriod('3M')
    loadChartData(index.symbol, '3M')
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
    if (selectedIndex) {
      loadChartData(selectedIndex.symbol, period)
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

  useEffect(() => {
    fetchIndexData()
  }, [])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Market Indices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Market Indices</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchIndexData}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {indices.length > 0 ? (
              indices.map((index) => {
                const isPositive = index.change >= 0
                
                return (
                  <div 
                    key={index.symbol} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleIndexClick(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{index.fullName}</p>
                          <p className="text-sm text-gray-500">{index.symbol}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(index.price)}
                      </p>
                      <div className="flex items-center space-x-1">
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <p className={cn(
                          "text-sm font-medium",
                          isPositive ? "text-green-600" : "text-red-600"
                        )}>
                          {isPositive ? '+' : ''}{formatCurrency(index.change)} ({isPositive ? '+' : ''}{formatPercent(index.change_percent)})
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No market index data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Index Chart Popup */}
      {selectedIndex && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedIndex.fullName}</h2>
                  <p className="text-gray-600">{selectedIndex.symbol}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIndex(null)}
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