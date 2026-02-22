'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface DonutChartProps {
  categories: {
    name: string
    amount: number
    color: string
    icon: string
  }[]
  totalExpenses: number
}

export default function DonutChart({ categories, totalExpenses }: DonutChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="size-[280px] rounded-full bg-gray-100 animate-pulse" />

  return (
    <div className="relative size-[280px] flex items-center justify-center">
      <svg className="size-full -rotate-90" viewBox="0 0 100 100">
        {/* Simplified SVG logic for optimization */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="#f3f4f6"
          strokeWidth="12"
        />
        {categories.map((cat, i) => {
          let offset = 0
          for (let j = 0; j < i; j++) {
            offset += (categories[j].amount / totalExpenses) * 100
          }
          const percentage = (cat.amount / totalExpenses) * 100
          
          return (
            <motion.circle
              key={cat.name}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={cat.color}
              strokeWidth="14"
              strokeDasharray={`${percentage * 2.51} 251.2`}
              strokeDashoffset={-offset * 2.51}
              initial={{ strokeDasharray: `0 251.2` }}
              animate={{ strokeDasharray: `${percentage * 2.51} 251.2` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black text-text-primary">
          € {totalExpenses.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
        </span>
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Ausgegeben</span>
      </div>
    </div>
  )
}
