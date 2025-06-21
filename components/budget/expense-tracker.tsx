'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Trash2, Calendar, DollarSign } from 'lucide-react'

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  month: string
  year: number
}

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  budgetId?: string
}

interface ExpenseTrackerProps {
  expenses: Expense[]
  budgets: Budget[]
  onDelete: (id: string) => void
}

export function ExpenseTracker({ expenses, budgets, onDelete }: ExpenseTrackerProps) {
  const handleDelete = (id: string, description: string) => {
    if (confirm(`Are you sure you want to delete the expense "${description}"?`)) {
      onDelete(id)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Food & Dining': 'bg-red-100 text-red-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Shopping': 'bg-green-100 text-green-800',
      'Healthcare': 'bg-pink-100 text-pink-800',
      'Utilities': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors['Other']
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-2">No expenses recorded yet</p>
          <p className="text-sm">Start adding expenses to track your spending.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
              </p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  expenses
                    .filter(expense => {
                      const expenseDate = new Date(expense.date)
                      const now = new Date()
                      return expenseDate.getMonth() === now.getMonth() && 
                             expenseDate.getFullYear() === now.getFullYear()
                    })
                    .reduce((sum, expense) => sum + expense.amount, 0)
                )}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs font-semibold">#</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedExpenses.map((expense) => (
            <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(expense.date)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {expense.description}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(expense.id, expense.description)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 