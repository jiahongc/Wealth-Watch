'use client'

import { useState, useEffect } from 'react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown, Coins, RefreshCw, X } from 'lucide-react'
import { apiService, CryptoData, HistoricalData } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface CryptoDataWithIcon extends CryptoData {
  icon: string
}

export function Cryptocurrencies() {
  const [cryptos, setCryptos] = useState<CryptoDataWithIcon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoDataWithIcon | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('3M')
  const [chartData, setChartData] = useState<HistoricalData | null>(null)
  const [chartLoading, setChartLoading] = useState(false)

  const fetchCryptoData = async () => {
    try {
      setError(null)
      setLoading(true)
      const cryptoData = await apiService.getTopCryptocurrencies()
      
      // Map the API data to include icons
      const cryptoWithIcons: CryptoDataWithIcon[] = cryptoData.map(crypto => {
        return {
          ...crypto,
          icon: getCryptoIcon(crypto.symbol)
        }
      })
      
      setCryptos(cryptoWithIcons)
    } catch (error) {
      console.error('Error fetching crypto data:', error)
      setError('Failed to fetch cryptocurrency data')
    } finally {
      setLoading(false)
    }
  }

  const getCryptoIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'USDT': '₮',
      'BNB': '🪙',
      'SOL': '◎'
    }
    return icons[symbol] || '🪙'
  }

  const handleCryptoClick = (crypto: CryptoDataWithIcon) => {
    setSelectedCrypto(crypto)
    setSelectedPeriod('3M')
    loadChartData(crypto.symbol, '3M')
  }

  const loadChartData = async (symbol: string, period: string) => {
    setChartLoading(true)
    try {
      // For crypto, we need to append -USD to the symbol for Yahoo Finance
      const cryptoSymbol = symbol.endsWith('-USD') ? symbol : `${symbol}-USD`
      const data = await apiService.getStockHistory(cryptoSymbol, period)
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
    if (selectedCrypto) {
      loadChartData(selectedCrypto.symbol, period)
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
    fetchCryptoData()
  }, [])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Cryptocurrencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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
          <CardTitle className="text-sm font-medium">Top Cryptocurrencies</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCryptoData}
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
            {cryptos.length > 0 ? (
              cryptos.map((crypto) => {
                const isPositive = crypto.change >= 0
                
                return (
                  <div 
                    key={crypto.symbol} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleCryptoClick(crypto)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">{crypto.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{crypto.name}</p>
                          <p className="text-sm text-gray-500">{crypto.symbol}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(crypto.price)}
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
                          {isPositive ? '+' : ''}{formatCurrency(crypto.change)} ({isPositive ? '+' : ''}{formatPercent(crypto.change_percent)})
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Coins className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No cryptocurrency data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Crypto Chart Popup */}
      {selectedCrypto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg">
                  <span className="text-xl font-bold">{selectedCrypto.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedCrypto.name}</h2>
                  <p className="text-gray-600">{selectedCrypto.symbol}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCrypto(null)}
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
                  variant={period === selectedPeriod ? 'default' : 'outline'}
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
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: '#8b5cf6' }}
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