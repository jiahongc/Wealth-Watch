'use client'

import { Card } from '@/components/ui/card'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  month: string
  year: number
}

interface BudgetOverviewProps {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  budgets: Budget[]
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

export function BudgetOverview({ totalBudget, totalSpent, totalRemaining, budgets }: BudgetOverviewProps) {
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const pieData = budgets
    .filter(budget => budget.spent > 0) // Only include budgets with spending
    .map(budget => ({
      name: budget.category,
      value: budget.spent,
      percentage: totalSpent > 0 ? (budget.spent / totalSpent) * 100 : 0
    }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xs font-semibold">B</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatPercent(spentPercentage)} of budget
              </p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs font-semibold">S</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalRemaining)}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              totalRemaining >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className={`text-xs font-semibold ${
                totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                R
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{budgets.length}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-xs font-semibold">C</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Distribution Donut Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Distribution</h3>
          <div className="h-80">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), 'Amount']}
                    labelFormatter={(label) => `Category: ${label}`}
                  />
                  <Legend 
                    formatter={(value, entry) => `${value}: ${formatCurrency(entry.payload?.value || 0)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-lg font-medium">No expenses yet</p>
                  <p className="text-sm">Add some expenses to see the distribution</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Budget Progress */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
          <div className="space-y-4 h-80 overflow-y-auto">
            {budgets.map((budget) => {
              const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0
              const isOverBudget = percentage > 100
              
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{budget.category}</h4>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isOverBudget 
                          ? 'bg-red-500' 
                          : percentage > 80 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${
                      isOverBudget ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {formatPercent(percentage)}
                    </span>
                    {isOverBudget && (
                      <span className="text-xs text-red-600 font-medium">
                        Over by {formatCurrency(budget.spent - budget.limit)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
} 