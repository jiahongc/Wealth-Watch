const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// NOTE: All live market data is now provided by yfinance (Yahoo Finance) through the backend API. Alpha Vantage is no longer used.

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  change_percent: number
  market_cap?: number
  volume?: number
  last_updated: string
}

export interface CryptoData {
  symbol: string
  name: string
  price: number
  change: number
  change_percent: number
  market_cap?: number
  volume?: number
  last_updated: string
}

export interface StockHolding {
  id?: number
  user_id: string
  symbol: string
  shares: number
  average_cost: number
  current_price: number
  total_value: number
  gain_loss: number
  gain_loss_percent: number
  created_at?: string
}

export interface Account {
  id?: string
  user_id: string
  name: string
  type: string
  balance: number
  currency: string
  last_updated: string
}

export interface HoldingsSummary {
  total_value: number
  total_gain_loss: number
  total_gain_loss_percent: number
  total_invested: number
  holdings_count: number
}

export interface AccountsSummary {
  total_balance: number
  accounts_count: number
  accounts: Array<{
    name: string
    type: string
    balance: number
  }>
}

export interface HistoricalDataPoint {
  date: string
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  day_change: number
  day_change_percent: number
  rsi?: number
}

export interface HistoricalData {
  symbol: string
  period: string
  data: HistoricalDataPoint[]
}

// Mock stock data for when backend is not available
const mockStockData: { [key: string]: StockData } = {
  'AAPL': {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.23,
    change: 2.45,
    change_percent: 1.42,
    last_updated: new Date().toISOString()
  },
  'GOOGL': {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    change: 0.89,
    change_percent: 0.63,
    last_updated: new Date().toISOString()
  },
  'TSLA': {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 248.42,
    change: 5.67,
    change_percent: 2.34,
    last_updated: new Date().toISOString()
  },
  'MSFT': {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: -1.23,
    change_percent: -0.32,
    last_updated: new Date().toISOString()
  },
  'AMZN': {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 156.78,
    change: 3.21,
    change_percent: 2.09,
    last_updated: new Date().toISOString()
  },
  'NVDA': {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 485.09,
    change: 12.45,
    change_percent: 2.64,
    last_updated: new Date().toISOString()
  },
  'META': {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    price: 334.92,
    change: -2.18,
    change_percent: -0.65,
    last_updated: new Date().toISOString()
  },
  'NFLX': {
    symbol: 'NFLX',
    name: 'Netflix, Inc.',
    price: 567.34,
    change: 8.76,
    change_percent: 1.57,
    last_updated: new Date().toISOString()
  }
}

class ApiService {
  private baseUrl: string
  private useMockData: boolean = false

  constructor() {
    this.baseUrl = API_BASE_URL
    console.log('API Service initialized with base URL:', this.baseUrl)
  }

  private async checkBackendHealth(): Promise<boolean> {
    try {
      console.log('Checking backend health at:', `${this.baseUrl}/health`)
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('Backend health response:', response.status, response.statusText)
      return response.ok
    } catch (error) {
      console.error('Backend health check failed:', error)
      return false
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }

  async getStockQuote(symbol: string): Promise<StockData> {
    // Check if backend is available
    if (!this.useMockData) {
      const isBackendHealthy = await this.checkBackendHealth()
      if (!isBackendHealthy) {
        this.useMockData = true
        console.log('Backend not available, using mock data')
      }
    }

    if (this.useMockData) {
      const mockData = mockStockData[symbol.toUpperCase()]
      if (mockData) {
        // Add some randomness to simulate real-time data
        const randomChange = (Math.random() - 0.5) * 2
        const randomPrice = mockData.price + randomChange
        return {
          ...mockData,
          price: Math.round(randomPrice * 100) / 100,
          change: Math.round(randomChange * 100) / 100,
          change_percent: Math.round((randomChange / mockData.price) * 10000) / 100,
          last_updated: new Date().toISOString()
        }
      }
      throw new Error(`Stock symbol ${symbol} not found`)
    }

    return this.request<StockData>(`/api/stocks/quote/${symbol.toUpperCase()}`)
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockData[]> {
    // Check if backend is available
    if (!this.useMockData) {
      const isBackendHealthy = await this.checkBackendHealth()
      if (!isBackendHealthy) {
        const results: StockData[] = []
        for (const symbol of symbols) {
          try {
            const quote = await this.getStockQuote(symbol)
            results.push(quote)
          } catch {
            continue
          }
        }
        if (results.length > 0) return results
        this.useMockData = true
        console.log('Backend not available, using mock data')
      }
    }

    if (this.useMockData) {
      const results: StockData[] = []
      for (const symbol of symbols) {
        try {
          const quote = await this.getStockQuote(symbol)
          results.push(quote)
        } catch {
          // Skip invalid symbols
          continue
        }
      }
      return results
    }

    return this.request<StockData[]>('/api/stocks/quotes', {
      method: 'POST',
      body: JSON.stringify(symbols),
    })
  }

  async getCryptoQuote(symbol: string): Promise<CryptoData> {
    try {
      return this.request<CryptoData>(`/api/stocks/crypto/quote/${symbol.toUpperCase()}`)
    } catch (error) {
      console.error('Error fetching crypto data:', error)
      throw error
    }
  }

  async getTopCryptocurrencies(): Promise<CryptoData[]> {
    try {
      return this.request<CryptoData[]>('/api/stocks/crypto/top')
    } catch (error) {
      console.error('Error fetching top cryptocurrencies:', error)
      throw error
    }
  }

  async getHoldingsSummary(userId: string): Promise<HoldingsSummary> {
    try {
      console.log('Fetching holdings summary for user:', userId)
      console.log('API URL:', `${this.baseUrl}/api/assets/holdings/${userId}/summary`)
      const result = await this.request<HoldingsSummary>(`/api/assets/holdings/${userId}/summary`)
      console.log('Holdings summary result:', result)
      return result
    } catch (error) {
      console.error('Error fetching holdings summary:', error)
      throw error
    }
  }

  async getAccountsSummary(userId: string): Promise<AccountsSummary> {
    try {
      console.log('Fetching accounts summary for user:', userId)
      console.log('API URL:', `${this.baseUrl}/api/accounts/${userId}/summary`)
      const result = await this.request<AccountsSummary>(`/api/accounts/${userId}/summary`)
      console.log('Accounts summary result:', result)
      return result
    } catch (error) {
      console.error('Error fetching accounts summary:', error)
      throw error
    }
  }

  async getUserHoldings(userId: string): Promise<StockHolding[]> {
    try {
      return this.request<StockHolding[]>(`/api/assets/holdings/${userId}`)
    } catch (error) {
      console.error('Error fetching user holdings:', error)
      throw error
    }
  }

  async getUserAccounts(userId: string): Promise<Account[]> {
    try {
      return await this.request<Account[]>(`/api/accounts/${userId}`)
    } catch (error) {
      console.error('Error fetching user accounts:', error)
      return []
    }
  }

  async getStockHistory(symbol: string, period: string = '3M'): Promise<HistoricalData> {
    try {
      return await this.request<HistoricalData>(`/api/stocks/history/${symbol}?period=${period}`)
    } catch (error) {
      console.error('Error fetching stock history:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()