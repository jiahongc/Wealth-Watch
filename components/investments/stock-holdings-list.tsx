import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

interface StockHoldingsListProps {
  holdings: StockHolding[]
  onRemove: (id: string) => void
}

export function StockHoldingsList({ holdings, onRemove }: StockHoldingsListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shares
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {holdings.map((holding) => {
              const isPositive = holding.gainLoss >= 0
              
              return (
                <tr key={holding.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {holding.symbol}
                      </div>
                      <div className="text-sm text-gray-500">
                        {holding.name}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {holding.shares}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(holding.averageCost)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(holding.currentPrice)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(holding.totalValue)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "flex items-center space-x-1",
                        isPositive ? "text-green-600" : "text-red-600"
                      )}>
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {isPositive ? '+' : ''}{formatCurrency(holding.gainLoss)}
                        </span>
                      </div>
                      <span className={cn(
                        "text-sm",
                        isPositive ? "text-green-600" : "text-red-600"
                      )}>
                        ({isPositive ? '+' : ''}{formatPercent(holding.gainLossPercent)})
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(holding.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
} 