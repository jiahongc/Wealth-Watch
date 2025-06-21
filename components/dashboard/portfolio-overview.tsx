'use client'

import { useState, useEffect } from 'react'
import { cn, formatCurrency } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import { apiService, HoldingsSummary, AccountsSummary } from '@/lib/api'

export function PortfolioOverview() {
  const [investments, setInvestments] = useState<number | null>(null)
  const [accounts, setAccounts] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        console.log('Portfolio Overview: Starting to fetch data')
        setLoading(true)
        setError(null)
        
        // Fetch both holdings and accounts summaries
        console.log('Portfolio Overview: Fetching holdings and accounts summaries')
        const [holdingsSummary, accountsSummary] = await Promise.all([
          apiService.getHoldingsSummary('demo'),
          apiService.getAccountsSummary('demo')
        ])
        
        console.log('Portfolio Overview: Received data:', { holdingsSummary, accountsSummary })
        setInvestments(holdingsSummary.total_value)
        setAccounts(accountsSummary.total_balance)
        console.log('Portfolio Overview: Set state with investments:', holdingsSummary.total_value, 'accounts:', accountsSummary.total_balance)
      } catch (error) {
        console.error('Portfolio Overview: Error fetching portfolio data:', error)
        setError('Failed to fetch portfolio data')
        setInvestments(null)
        setAccounts(null)
      } finally {
        setLoading(false)
        console.log('Portfolio Overview: Finished loading')
      }
    }

    fetchPortfolioData()
  }, [])

  const totalValue =
    investments !== null && accounts !== null ? investments + accounts : null

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[180px] flex flex-col justify-center">
        <div className="h-8 bg-gray-100 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-100 rounded w-1/4 mb-2 animate-pulse"></div>
        <div className="h-6 bg-gray-100 rounded w-1/4 animate-pulse"></div>
      </div>
    )
  }

  if (error || totalValue === null) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6 flex flex-col items-center justify-center min-h-[180px]">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-700 font-semibold mb-1">Error loading portfolio</p>
        <p className="text-sm text-red-500">{error || 'Unable to fetch portfolio data.'}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <p className="text-sm text-gray-600">Total Value</p>
        <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Investments</p>
          <p className="text-xl font-semibold text-gray-800">{formatCurrency(investments!)}</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Accounts</p>
          <p className="text-xl font-semibold text-gray-800">{formatCurrency(accounts!)}</p>
        </div>
      </div>
    </div>
  )
} 