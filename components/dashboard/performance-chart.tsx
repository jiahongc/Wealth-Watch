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

const tabs = ['Monthly', 'Quarterly', 'Annually']

const data = {
  labels: ['Jun \'25', 'Jul \'25', 'Aug \'25', 'Sep \'25', 'Oct \'25', 'Nov \'25', 'Dec \'25', '2026', 'Feb \'26', 'Mar \'26', 'Apr'],
  datasets: [
    {
      label: 'Portfolio Performance',
      data: [30, 32, 34, 35, 33, 32, 30, 31, 34, 36, 38],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: 2,
    },
  ],
}

const options = {
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
          return value + '.00'
        },
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
}

export function PerformanceChart() {
  const [activeTab, setActiveTab] = useState('Monthly')

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Portfolio Performance</h2>
          <p className="text-sm text-gray-500">Here is your performance stats of each month</p>
        </div>
        
        <div className="flex rounded-lg bg-gray-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  )
} 