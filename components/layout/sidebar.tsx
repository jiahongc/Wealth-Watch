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
  User,
  ChevronLeft,
  ChevronRight
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
  const [collapsed, setCollapsed] = useState(false)

  const toggleItem = (name: string) => {
    setOpenItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

  return (
    <div className={cn(
      "flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-200",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            className="p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <div className={cn("w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center", collapsed && "mx-auto")}> 
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          {!collapsed && <span className="text-xl font-bold text-gray-900">WealthFolio</span>}
        </div>
        {!collapsed && (
          <div className="flex items-center space-x-2">
            {/* Removed bell and moon icons */}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 px-6 pb-6 transition-all duration-200", collapsed && "px-2 pb-2")}> 
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          ))}
        </div>

        {/* Settings Section */}
        <div className={cn("mt-8 pt-6 border-t border-gray-200", collapsed && "mt-2 pt-2 border-t-0")}> 
          {!collapsed && (
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              SETTINGS
            </div>
          )}
          <div className="space-y-1">
            <Link
              href="/dashboard/settings"
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? 'Settings' : undefined}
            >
              <Settings className="mr-3 h-5 w-5" />
              {!collapsed && 'Settings'}
            </Link>
            <Link
              href="/dashboard/profile"
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? 'Profile' : undefined}
            >
              <User className="mr-3 h-5 w-5" />
              {!collapsed && 'Profile'}
            </Link>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className={cn("border-t border-gray-200 p-6 transition-all duration-200", collapsed && "p-2 border-t-0")}> 
        <div className="flex items-center space-x-3 justify-between">
          <div className={cn("h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center", collapsed && "mx-auto")}> 
            <span className="text-sm font-medium text-white">U</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">User</p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
          )}
          {!collapsed && <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </div>
    </div>
  )
} 