'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AddStockFormProps {
  onSubmit: (data: StockFormData) => void
  onCancel: () => void
  loading?: boolean
}

export interface StockFormData {
  symbol: string
  shares: number
  averageCost: number
}

export function AddStockForm({ onSubmit, onCancel, loading = false }: AddStockFormProps) {
  const [formData, setFormData] = useState<StockFormData>({
    symbol: '',
    shares: 0,
    averageCost: 0
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Stock symbol is required'
    } else if (!/^[A-Z]{1,5}$/.test(formData.symbol.toUpperCase())) {
      newErrors.symbol = 'Invalid stock symbol format'
    }

    if (formData.shares <= 0) {
      newErrors.shares = 'Number of shares must be greater than 0'
    }

    if (formData.averageCost <= 0) {
      newErrors.averageCost = 'Average cost must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        symbol: formData.symbol.toUpperCase()
      })
    }
  }

  const handleInputChange = (field: keyof StockFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add Stock Holding</CardTitle>
        <CardDescription>
          Enter details for your stock investment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Stock Symbol</Label>
            <Input
              id="symbol"
              type="text"
              placeholder="e.g., AAPL"
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value)}
              className={errors.symbol ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.symbol && (
              <p className="text-sm text-red-600">{errors.symbol}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shares">Number of Shares</Label>
            <Input
              id="shares"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.shares || ''}
              onChange={(e) => handleInputChange('shares', parseFloat(e.target.value) || 0)}
              className={errors.shares ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.shares && (
              <p className="text-sm text-red-600">{errors.shares}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="averageCost">Average Cost per Share</Label>
            <Input
              id="averageCost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.averageCost || ''}
              onChange={(e) => handleInputChange('averageCost', parseFloat(e.target.value) || 0)}
              className={errors.averageCost ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.averageCost && (
              <p className="text-sm text-red-600">{errors.averageCost}</p>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Stock'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 