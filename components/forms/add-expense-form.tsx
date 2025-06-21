'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  month: string
  year: number
}

interface Expense {
  amount: number
  category: string
  description: string
  date: string
  budgetId?: string
}

interface AddExpenseFormProps {
  budgets: Budget[]
  onSubmit: (expense: Expense) => void
  onCancel: () => void
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Utilities',
  'Groceries',
  'Gas',
  'Insurance',
  'Subscriptions',
  'Other'
]

export function AddExpenseForm({ budgets, onSubmit, onCancel }: AddExpenseFormProps) {
  const [formData, setFormData] = useState<Expense>({
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    budgetId: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof Expense, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ ...prev, category }))
    
    // Auto-select budget if one exists for this category
    const matchingBudget = budgets.find(budget => budget.category === category)
    if (matchingBudget) {
      setFormData(prev => ({ ...prev, budgetId: matchingBudget.id }))
    } else {
      setFormData(prev => ({ ...prev, budgetId: '' }))
    }
    
    // Clear error
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const getBudgetOptions = () => {
    return budgets.filter(budget => budget.category === formData.category)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Add New Expense</h2>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.amount || ''}
            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
            className={errors.amount ? 'border-red-500' : ''}
          />
          {errors.amount && (
            <p className="text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {EXPENSE_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Budget Selection (if available for category) */}
        {formData.category && getBudgetOptions().length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="budgetId">Budget (Optional)</Label>
            <select
              id="budgetId"
              value={formData.budgetId}
              onChange={(e) => handleInputChange('budgetId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No budget selected</option>
              {getBudgetOptions().map(budget => (
                <option key={budget.id} value={budget.id}>
                  {budget.category} - {budget.month} {budget.year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            type="text"
            placeholder="Enter expense description..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className={errors.date ? 'border-red-500' : ''}
          />
          {errors.date && (
            <p className="text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
          >
            Add Expense
          </Button>
        </div>
      </form>
    </div>
  )
} 