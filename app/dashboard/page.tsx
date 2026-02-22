'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/Motion'
import { Skeleton, DashboardSkeleton } from '@/components/Skeleton'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

import dynamic from 'next/dynamic'

const DonutChart = dynamic(() => import('@/components/DonutChart'), {
  loading: () => <Skeleton className="size-[280px] rounded-full" />,
  ssr: false
})

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      try {
        // 1. Fetch Profile and Active Phase concurrently
        const [profileResponse, phasesResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, username, city, monthly_budget')
            .eq('id', user.id)
            .single(),
          supabase
            .from('life_phases')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
        ])

        if (profileResponse.data) setProfile(profileResponse.data)

        // 2. Fetch Expenses if phase found
        const phases = phasesResponse.data
        if (phases && phases.length > 0) {
          const { data: expenseData } = await supabase
            .from('expenses')
            .select('id, category, amount')
            .eq('user_id', user.id)
            .eq('phase_id', phases[0].id)

          if (expenseData) setExpenses(expenseData)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
  const budget = profile?.monthly_budget || 0
  const remaining = budget - totalExpenses
  const progress = Math.min((totalExpenses / (budget || 1)) * 100, 100)

  // Category totals for donut
  const catTotals: Record<string, number> = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount)
    return acc
  }, {} as Record<string, number>)

  const categories = [
    { name: 'Miete', amount: catTotals['miete'] || 0, color: '#6bae75', icon: 'home' },
    { name: 'Essen', amount: catTotals['essen'] || 0, color: '#8DCF98', icon: 'restaurant' },
    { name: 'Transport', amount: catTotals['transport'] || 0, color: '#B0E0B8', icon: 'directions_car' },
    { name: 'Sonstiges', amount: (catTotals['freizeit'] || 0) + (catTotals['versich'] || 0), color: '#D4F1D9', icon: 'more_horiz' },
  ].filter(c => c.amount > 0)

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex justify-center pt-8 pb-24 bg-background overflow-y-auto">
          <div className="w-full max-w-[1240px] px-6 lg:px-8 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
               <Skeleton className="h-4 w-32" />
               <Skeleton className="h-12 w-64" />
               <Skeleton className="h-6 w-96" />
            </div>
            <DashboardSkeleton />
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex justify-center pt-8 pb-24 bg-background overflow-y-auto relative">
        <div className="w-full max-w-[1240px] px-6 lg:px-8 flex flex-col gap-8 relative z-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1"
            >
              <p className="text-primary font-bold tracking-wider uppercase text-xs">Willkommen zurück</p>
              <h1 className="text-4xl md:text-5xl font-black text-primary-dark tracking-tight">Hallo, {profile?.username || 'User'}!</h1>
              <p className="text-text-muted font-medium">Hier ist deine Finanzübersicht für deinen Aufenthalt in {profile?.city || 'deiner Stadt'}.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Donut Chart Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1 bg-white rounded-[32px] p-8 shadow-soft-green flex flex-col items-center justify-center gap-8 border border-primary/5"
            >
              <DonutChart categories={categories} totalExpenses={totalExpenses} />
              
              <div className="grid grid-cols-2 gap-4 w-full">
                {categories.map((cat) => (
                  <div key={cat.name} className="flex flex-col gap-1 p-3 rounded-2xl bg-gray-50 border border-transparent hover:border-primary/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{cat.name}</span>
                    </div>
                    <span className="text-sm font-black text-text-primary mt-1">
                      € {cat.amount.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stats & Progress */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-3xl p-8 border border-primary/5 shadow-sm"
                >
                  <p className="text-text-muted text-sm font-bold uppercase tracking-widest mb-1">Monatliches Budget</p>
                  <h2 className="text-4xl font-black text-primary-dark">€ <AnimatedCounter value={budget} /></h2>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-3xl p-8 border border-primary/5 shadow-sm"
                >
                  <p className="text-text-muted text-sm font-bold uppercase tracking-widest mb-1">Übrig</p>
                  <h2 className={`text-4xl font-black ${remaining >= 0 ? 'text-primary' : 'text-red-500'}`}>€ <AnimatedCounter value={remaining} /></h2>
                </motion.div>
                {/* AI Assistant Card - GATED */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1 bg-primary-dark rounded-[32px] p-8 text-white relative overflow-hidden group shadow-xl"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  </div>
                  {profile?.subscription_tier !== 'premium' && (
                    <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Premium</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-black mb-2 tracking-tight">KI Finanz-Assistent</h3>
                <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed">
                  Lass dir von deiner persönlichen KI Optimierungsvorschläge für deine Ausgaben in {profile?.city} geben.
                </p>

                <div className="mt-auto">
                  {profile?.subscription_tier === 'premium' ? (
                    <div className="space-y-4">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-xs italic text-white/80">
                        "Hey {profile?.username}, du könntest diesen Monat ca. €45 sparen, wenn du deine Restaurant-Besuche um 20% reduzierst."
                      </div>
                      <button className="w-full bg-white text-primary-dark font-black py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02]">
                         Vorschlag anfragen
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => router.push('/pricing')}
                      className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-black/20 flex items-center justify-center gap-2 hover:bg-primary-light transition-all"
                    >
                      <span className="material-symbols-outlined">bolt</span>
                      Upgrade für KI
                    </button>
                  )}
                </div>
              </div>
              
              {/* Background Glow */}
              <div className="absolute -bottom-20 -right-20 size-64 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
            </motion.div>
          </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl p-8 border border-primary/10"
              >
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Budget Auslastung</h3>
                    <p className="text-text-muted text-sm">Deine Ausgaben im Verhältnis zum Limit.</p>
                  </div>
                  <span className="text-2xl font-black text-primary">{Math.round(progress)}%</span>
                </div>
                <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${remaining >= 0 ? 'bg-primary' : 'bg-red-500'}`}
                  ></motion.div>
                </div>
              </motion.div>

              {/* Recent Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * i, duration: 0.5 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 40px -10px rgba(107, 174, 117, 0.4)" }}
                    className="group bg-card rounded-2xl p-6 transition-all duration-300 relative overflow-hidden border border-primary/5"
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-[28px]">{cat.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-text-primary mb-0.5">{cat.name}</h4>
                          <p className="text-xs text-text-muted font-medium uppercase tracking-tighter">Bereits gezahlt</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-xl font-black text-text-primary">€ {cat.amount.toLocaleString('de-DE')}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
