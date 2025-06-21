'use client'

import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

type Period = 'Daily' | 'Monthly' | 'YTD';
type Mode = 'Return' | 'Value';

const periodTabs: Period[] = ['Daily', 'Monthly', 'YTD']
const modeTabs: Mode[] = ['Return', 'Value']

const mockData: Record<Period, Record<Mode, any>> = {
  Daily: {
    Return: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [{ label: 'Return (%)', data: [0.5, 0.7, -0.2, 1.1, 0.3], borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 6, borderWidth: 2 }]
    },
    Value: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [{ label: 'Value ($)', data: [100000, 100700, 100500, 101600, 101900], borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 6, borderWidth: 2 }]
    }
  },
  Monthly: {
    Return: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{ label: 'Return (%)', data: [2.1, 1.8, 3.2, -0.5, 2.7, 1.3], borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 6, borderWidth: 2 }]
    },
    Value: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{ label: 'Value ($)', data: [95000, 97000, 100000, 99500, 102000, 103300], borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 6, borderWidth: 2 }]
    }
  },
  YTD: {
    Return: {
      labels: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
      datasets: [{ label: 'Return (%)', data: [0, 2.1, 3.9, 6.8, 7.3, 8.2], borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 6, borderWidth: 2 }]
    },
    Value: {
      labels: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
      datasets: [{ label: 'Value ($)', data: [90000, 95000, 98000, 102000, 105000, 110000], borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 6, borderWidth: 2 }]
    }
  }
}

export function PerformanceChart() {
  const [activePeriod, setActivePeriod] = useState<Period>('Monthly')
  const [activeMode, setActiveMode] = useState<Mode>('Return')

  const chartData = mockData[activePeriod][activeMode]

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            if (activeMode === 'Value') {
              return `Value: $${context.parsed.y.toLocaleString()}`
            } else {
              return `Return: ${context.parsed.y}%`
            }
          }
        }
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
          },
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            if (activeMode === 'Value') {
              return '$' + Math.round(value).toLocaleString()
            } else {
              return Math.round(value) + '%'
            }
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Portfolio Performance</h2>
          <p className="text-sm text-gray-500">View your {activeMode.toLowerCase()} {activePeriod === 'YTD' ? 'year-to-date' : activePeriod.toLowerCase()} performance</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <div className="flex rounded-lg bg-gray-100 p-1">
            {periodTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePeriod(tab)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activePeriod === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg bg-gray-100 p-1">
            {modeTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMode(tab)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeMode === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  )
} 