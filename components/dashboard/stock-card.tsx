import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StockCardProps {
  company: string
  ticker: string
  price: number
  change: number
  changePercent: number
  icon: string
}

export function StockCard({
  company,
  ticker,
  price,
  change,
  changePercent,
  icon
}: StockCardProps) {
  const isPositive = change >= 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{ticker}</h3>
            <p className="text-sm text-gray-500">{company}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(price)}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={cn(
            'flex items-center space-x-1 text-sm font-medium',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{formatPercent(Math.abs(changePercent))}</span>
          </div>
          
          <span className={cn(
            'text-sm font-medium',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {isPositive ? '+' : ''}{formatCurrency(change)}
          </span>
        </div>
      </div>
    </div>
  )
} 