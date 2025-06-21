'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BudgetOverview } from '@/components/budget/budget-overview'
import { BudgetList } from '@/components/budget/budget-list'
import { ExpenseTracker } from '@/components/budget/expense-tracker'
import { CreateBudgetForm } from '@/components/forms/create-budget-form'
import { AddExpenseForm } from '@/components/forms/add-expense-form'
import { Plus, TrendingDown, Wallet } from 'lucide-react'

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

export default function BudgetPage() {
  const [showCreateBudget, setShowCreateBudget] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'budgets' | 'expenses'>('overview')
  
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: '1',
      category: 'Food & Dining',
      limit: 800,
      spent: 650,
      month: 'December',
      year: 2024
    },
    {
      id: '2',
      category: 'Transportation',
      limit: 400,
      spent: 320,
      month: 'December',
      year: 2024
    },
    {
      id: '3',
      category: 'Entertainment',
      limit: 300,
      spent: 180,
      month: 'December',
      year: 2024
    },
    {
      id: '4',
      category: 'Shopping',
      limit: 500,
      spent: 420,
      month: 'December',
      year: 2024
    }
  ])

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      amount: 45.50,
      category: 'Food & Dining',
      description: 'Lunch at Italian restaurant',
      date: '2024-12-15',
      budgetId: '1'
    },
    {
      id: '2',
      amount: 25.00,
      category: 'Transportation',
      description: 'Uber ride to airport',
      date: '2024-12-14',
      budgetId: '2'
    },
    {
      id: '3',
      amount: 15.99,
      category: 'Entertainment',
      description: 'Netflix subscription',
      date: '2024-12-13',
      budgetId: '3'
    }
  ])

  const handleCreateBudget = (budgetData: Omit<Budget, 'id' | 'spent'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: Date.now().toString(),
      spent: 0
    }
    setBudgets(prev => [...prev, newBudget])
    setShowCreateBudget(false)
  }

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString()
    }
    
    setExpenses(prev => [...prev, newExpense])
    
    // Update budget spent amount
    if (expenseData.budgetId) {
      setBudgets(prev => prev.map(budget => 
        budget.id === expenseData.budgetId
          ? { ...budget, spent: budget.spent + expenseData.amount }
          : budget
      ))
    }
    
    setShowAddExpense(false)
  }

  const handleDeleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id))
  }

  const handleDeleteExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id)
    if (expense && expense.budgetId) {
      setBudgets(prev => prev.map(budget => 
        budget.id === expense.budgetId
          ? { ...budget, spent: Math.max(0, budget.spent - expense.amount) }
          : budget
      ))
    }
    setExpenses(prev => prev.filter(expense => expense.id !== id))
  }

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const totalRemaining = totalBudget - totalSpent

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-600 mt-1">Track your spending and manage budgets</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowAddExpense(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <TrendingDown className="h-4 w-4" />
            <span>Add Expense</span>
          </Button>
          <Button
            onClick={() => setShowCreateBudget(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Budget</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Wallet },
            { id: 'budgets', label: 'Budgets', icon: Plus },
            { id: 'expenses', label: 'Expenses', icon: TrendingDown }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <BudgetOverview
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          totalRemaining={totalRemaining}
          budgets={budgets}
        />
      )}

      {activeTab === 'budgets' && (
        <BudgetList
          budgets={budgets}
          onDelete={handleDeleteBudget}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpenseTracker
          expenses={expenses}
          budgets={budgets}
          onDelete={handleDeleteExpense}
        />
      )}

      {/* Create Budget Modal */}
      {showCreateBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <CreateBudgetForm
              onSubmit={handleCreateBudget}
              onCancel={() => setShowCreateBudget(false)}
            />
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <AddExpenseForm
              budgets={budgets}
              onSubmit={handleAddExpense}
              onCancel={() => setShowAddExpense(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
} 