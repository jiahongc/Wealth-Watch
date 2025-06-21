'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AddStockForm, StockFormData } from '@/components/forms/add-stock-form'
import { StockHoldingsList } from '@/components/investments/stock-holdings-list'
import { PortfolioSummary } from '@/components/investments/portfolio-summary'
import { Plus, TrendingUp } from 'lucide-react'
import { apiService, StockData } from '@/lib/api'

interface StockHolding {
  id: string
  symbol: string
  name: string
  shares: number
  averageCost: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number
}

export default function InvestmentsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [holdings, setHoldings] = useState<StockHolding[]>([
    {
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 10,
      averageCost: 150,
      currentPrice: 175,
      totalValue: 1750,
      gainLoss: 250,
      gainLossPercent: 16.67
    },
    {
      id: '2',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 5,
      averageCost: 120,
      currentPrice: 140,
      totalValue: 700,
      gainLoss: 100,
      gainLossPercent: 16.67
    }
  ])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Function to update stock prices with real-time data
  const refreshStockPrices = async () => {
    setRefreshing(true)
    setApiError(null)
    try {
      const symbols = Array.from(new Set(holdings.map(h => h.symbol)))
      if (symbols.length === 0) {
        setRefreshing(false)
        return
      }
      const quotes = await apiService.getMultipleQuotes(symbols)
      setHoldings(prevHoldings => 
        prevHoldings.map(holding => {
          const quote = quotes.find(q => q.symbol === holding.symbol)
          if (quote) {
            const newCurrentPrice = quote.price
            const newTotalValue = holding.shares * newCurrentPrice
            const newGainLoss = newTotalValue - (holding.shares * holding.averageCost)
            const newGainLossPercent = ((newCurrentPrice - holding.averageCost) / holding.averageCost) * 100
            return {
              ...holding,
              name: quote.name,
              currentPrice: newCurrentPrice,
              totalValue: newTotalValue,
              gainLoss: newGainLoss,
              gainLossPercent: newGainLossPercent
            }
          }
          return holding
        })
      )
    } catch (error) {
      setApiError('Failed to refresh stock prices. Please try again.')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    refreshStockPrices()
  }, [])

  const handleAddStock = async (formData: StockFormData) => {
    setLoading(true)
    setApiError(null)
    try {
      const stockQuote = await apiService.getStockQuote(formData.symbol)
      const newHolding: StockHolding = {
        id: Date.now().toString(),
        symbol: formData.symbol.toUpperCase(),
        name: stockQuote.name,
        shares: formData.shares,
        averageCost: formData.averageCost,
        currentPrice: stockQuote.price,
        totalValue: formData.shares * stockQuote.price,
        gainLoss: (formData.shares * stockQuote.price) - (formData.shares * formData.averageCost),
        gainLossPercent: ((stockQuote.price - formData.averageCost) / formData.averageCost) * 100
      }
      setHoldings(prev => [...prev, newHolding])
      setShowAddForm(false)
    } catch (error) {
      setApiError('Failed to add stock. Please check the symbol and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveStock = (id: string) => {
    setHoldings(prev => prev.filter(holding => holding.id !== id))
  }

  const totalPortfolioValue = holdings.reduce((sum, holding) => sum + holding.totalValue, 0)
  const totalGainLoss = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0)
  const totalInvested = holdings.reduce((sum, holding) => sum + (holding.shares * holding.averageCost), 0)
  const overallGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investments</h1>
          <p className="text-gray-600 mt-1">Manage your stock portfolio with real-time data</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={refreshStockPrices}
            disabled={refreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <span>{refreshing ? 'Updating...' : 'Refresh Prices'}</span>
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2"
          >
            <span>Add Stock</span>
          </Button>
        </div>
      </div>
      {/* API Error Message */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-800">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Summary */}
      <PortfolioSummary
        totalValue={totalPortfolioValue}
        totalGainLoss={totalGainLoss}
        gainLossPercent={overallGainLossPercent}
        totalInvested={totalInvested}
      />

      {/* Add Stock Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <AddStockForm
              onSubmit={handleAddStock}
              onCancel={() => setShowAddForm(false)}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Holdings List */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Your Holdings</h2>
        </div>
        
        {holdings.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No investments yet</h3>
              <p className="text-sm">Add your first stock to start tracking your portfolio</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="mt-4"
              >
                Add Your First Stock
              </Button>
            </div>
          </div>
        ) : (
          <StockHoldingsList
            holdings={holdings}
            onRemove={handleRemoveStock}
          />
        )}
      </div>
    </div>
  )
} 