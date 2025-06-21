import { PerformanceChart } from '@/components/dashboard/performance-chart'
import WatchlistCard from '@/components/dashboard/watchlist-card'
import { PortfolioOverview } from '@/components/dashboard/portfolio-overview'
import { MarketIndices } from '@/components/dashboard/market-indices'
import { Cryptocurrencies } from '@/components/dashboard/cryptocurrencies'

export default function DashboardPage() {
  // Mock portfolio data - in a real app, this would come from your portfolio state
  const portfolioData = {
    totalValue: 125000,
    totalGainLoss: 8500,
    gainLossPercent: 7.3,
    totalInvested: 116500
  }

  return (
    <div className="p-6 space-y-6">
      {/* First Row - Portfolio Overview and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <PortfolioOverview
            totalValue={portfolioData.totalValue}
            totalGainLoss={portfolioData.totalGainLoss}
            gainLossPercent={portfolioData.gainLossPercent}
            totalInvested={portfolioData.totalInvested}
          />
        </div>
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
      </div>

      {/* Second Row - Watchlist, Market Indices, and Cryptocurrencies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WatchlistCard />
        <MarketIndices />
        <Cryptocurrencies />
      </div>
    </div>
  )
} 