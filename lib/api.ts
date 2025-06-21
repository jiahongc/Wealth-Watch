const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo'

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
  }

  private async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      return response.ok
    } catch {
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
    // Try Alpha Vantage if backend is not available
    if (!this.useMockData) {
      const isBackendHealthy = await this.checkBackendHealth()
      if (!isBackendHealthy) {
        try {
          const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
          const response = await fetch(url)
          const data = await response.json()
          const quote = data["Global Quote"]
          if (quote && quote["05. price"]) {
            return {
              symbol: quote["01. symbol"],
              name: symbol,
              price: parseFloat(quote["05. price"]),
              change: parseFloat(quote["09. change"]),
              change_percent: parseFloat(quote["10. change percent"]),
              last_updated: new Date().toISOString(),
            }
          }
        } catch (e) {
          // fallback to mock
        }
        this.useMockData = true
        console.log('Backend and Alpha Vantage not available, using mock data')
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
    // Try Alpha Vantage if backend is not available
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
        console.log('Backend and Alpha Vantage not available, using mock data')
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
}

export const apiService = new ApiService() 