import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { DividendChart } from '@/components/dashboard/dividend-chart'
import { WatchlistCard } from '@/components/dashboard/watchlist-card'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <div>
          <DividendChart />
        </div>
      </div>

      {/* Bottom Row - Watchlist and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WatchlistCard />
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">Portfolio Overview</p>
            <p className="text-sm">Track your investments and performance</p>
          </div>
        </div>
      </div>
    </div>
  )
} 