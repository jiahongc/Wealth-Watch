'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { MoreHorizontal } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Dividend',
      data: [150, 400, 200, 300, 180, 400],
      backgroundColor: '#3B82F6',
      borderRadius: 6,
      borderSkipped: false,
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
      callbacks: {
        title: function() {
          return ''
        },
        label: function(context: any) {
          return `$${context.parsed.y}`
        },
      },
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
        stepSize: 100,
        callback: function(value: any) {
          return value
        },
      },
      max: 500,
    },
  },
}

export function DividendChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Dividend</h2>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
} 