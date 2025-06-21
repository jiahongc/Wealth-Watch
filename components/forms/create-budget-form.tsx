'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

interface Budget {
  category: string
  limit: number
  month: string
  year: number
}

interface CreateBudgetFormProps {
  onSubmit: (budget: Budget) => void
  onCancel: () => void
}

const CATEGORIES = [
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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function CreateBudgetForm({ onSubmit, onCancel }: CreateBudgetFormProps) {
  const [formData, setFormData] = useState<Budget>({
    category: '',
    limit: 0,
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear()
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof Budget, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    if (!formData.limit || formData.limit <= 0) {
      newErrors.limit = 'Budget limit must be greater than 0'
    }
    
    if (!formData.month) {
      newErrors.month = 'Month is required'
    }
    
    if (!formData.year || formData.year < 2020 || formData.year > 2030) {
      newErrors.year = 'Please enter a valid year (2020-2030)'
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Create New Budget</h2>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Budget Limit */}
        <div className="space-y-2">
          <Label htmlFor="limit">Budget Limit ($)</Label>
          <Input
            id="limit"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.limit || ''}
            onChange={(e) => handleInputChange('limit', parseFloat(e.target.value) || 0)}
            className={errors.limit ? 'border-red-500' : ''}
          />
          {errors.limit && (
            <p className="text-sm text-red-600">{errors.limit}</p>
          )}
        </div>

        {/* Month and Year */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <select
              id="month"
              value={formData.month}
              onChange={(e) => handleInputChange('month', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {MONTHS.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            {errors.month && (
              <p className="text-sm text-red-600">{errors.month}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              min="2020"
              max="2030"
              value={formData.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
              className={errors.year ? 'border-red-500' : ''}
            />
            {errors.year && (
              <p className="text-sm text-red-600">{errors.year}</p>
            )}
          </div>
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
            Create Budget
          </Button>
        </div>
      </form>
    </div>
  )
} 