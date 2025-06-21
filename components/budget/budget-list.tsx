'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Trash2, AlertTriangle } from 'lucide-react'

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  month: string
  year: number
}

interface BudgetListProps {
  budgets: Budget[]
  onDelete: (id: string) => void
}

export function BudgetList({ budgets, onDelete }: BudgetListProps) {
  const handleDelete = (id: string, category: string) => {
    if (confirm(`Are you sure you want to delete the budget for ${category}?`)) {
      onDelete(id)
    }
  }

  if (budgets.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">No budgets created yet</p>
          <p className="text-sm">Create your first budget to start tracking your spending.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {budgets.map((budget) => {
        const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0
        const remaining = budget.limit - budget.spent
        const isOverBudget = percentage > 100
        const isNearLimit = percentage > 80

        return (
          <Card key={budget.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{budget.category}</h3>
                <p className="text-sm text-gray-500">{budget.month} {budget.year}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(budget.id, budget.category)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Amount Information */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Spent</span>
                  <span className="font-medium text-gray-900">{formatCurrency(budget.spent)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Budget</span>
                  <span className="font-medium text-gray-900">{formatCurrency(budget.limit)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(remaining)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className={`text-sm font-medium ${
                    isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {formatPercent(percentage)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isOverBudget 
                        ? 'bg-red-500' 
                        : isNearLimit 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Alerts */}
              {(isOverBudget || isNearLimit) && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                  isOverBudget ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <AlertTriangle className={`h-4 w-4 ${
                    isOverBudget ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isOverBudget ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {isOverBudget 
                      ? `Over budget by ${formatCurrency(budget.spent - budget.limit)}`
                      : 'Approaching budget limit'
                    }
                  </span>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
} 