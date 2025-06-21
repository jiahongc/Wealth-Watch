import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react'

interface PortfolioSummaryProps {
  totalValue: number
  totalGainLoss: number
  gainLossPercent: number
  totalInvested: number
}

export function PortfolioSummary({
  totalValue,
  totalGainLoss,
  gainLossPercent,
  totalInvested
}: PortfolioSummaryProps) {
  const isPositive = totalGainLoss >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Portfolio Value */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Total Invested */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Invested</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(totalInvested)}
            </p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Target className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Total Gain/Loss */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
            <p className={cn(
              "text-2xl font-bold mt-1",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              {isPositive ? '+' : ''}{formatCurrency(totalGainLoss)}
            </p>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            isPositive ? "bg-green-100" : "bg-red-100"
          )}>
            {isPositive ? (
              <TrendingUp className="h-6 w-6 text-green-600" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600" />
            )}
          </div>
        </div>
      </div>

      {/* Gain/Loss Percentage */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Return</p>
            <p className={cn(
              "text-2xl font-bold mt-1",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              {isPositive ? '+' : ''}{formatPercent(gainLossPercent)}
            </p>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            isPositive ? "bg-green-100" : "bg-red-100"
          )}>
            {isPositive ? (
              <TrendingUp className="h-6 w-6 text-green-600" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 