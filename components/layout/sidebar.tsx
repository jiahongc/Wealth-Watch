'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  TrendingUp,
  Wallet,
  PieChart,
  Target,
  CreditCard,
  Settings,
  ChevronDown,
  Search,
  Bell,
  Moon,
  User
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Net Worth',
    href: '/dashboard/net-worth',
    icon: TrendingUp,
  },
  {
    name: 'Investments',
    href: '/dashboard/investments',
    icon: PieChart,
  },
  {
    name: 'Budget',
    href: '/dashboard/budget',
    icon: Wallet,
  },
  {
    name: 'Accounts',
    href: '/dashboard/accounts',
    icon: CreditCard,
  },
  {
    name: 'Goals',
    href: '/dashboard/goals',
    icon: Target,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (name: string) => {
    setOpenItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

  return (
    <div className="flex h-full w-72 flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Wealth-Watch</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-gray-500">
            <Search className="h-5 w-5" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-500">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-500">
            <Moon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search or type command..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">⌘K</kbd>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 pb-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            MENU
          </div>
          
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Settings Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            SETTINGS
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard/settings"
              className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <User className="mr-3 h-5 w-5" />
              Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">U</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">User</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  )
} 