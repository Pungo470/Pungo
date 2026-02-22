'use client'

import { motion } from 'framer-motion'

interface BenchmarkChartProps {
  userValue: number
  avgValue: number
  maxAmount: number
  color: string
}

export default function BenchmarkChart({ userValue, avgValue, maxAmount, color }: BenchmarkChartProps) {
  const userWidth = (userValue / maxAmount) * 100
  const avgWidth = (avgValue / maxAmount) * 100

  return (
    <div className="space-y-6">
      {/* User Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Du</span>
          <span className="text-sm font-black text-text-primary">€ {userValue.toLocaleString('de-DE')}</span>
        </div>
        <div className="h-8 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: `${userWidth}%` }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ backgroundColor: color }}
            className="h-full rounded-r-lg shadow-sm"
          />
        </div>
      </div>

      {/* Average Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Durchschnitt</span>
          <span className="text-sm font-bold text-text-muted">€ {avgValue.toLocaleString('de-DE')}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: `${avgWidth}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="h-full bg-gray-300 rounded-full"
          />
        </div>
      </div>
    </div>
  )
}
