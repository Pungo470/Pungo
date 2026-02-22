'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { BenchmarkSkeleton, Skeleton } from '@/components/Skeleton'

const BenchmarkChart = dynamic(() => import('@/components/BenchmarkChart'), {
  loading: () => <Skeleton className="h-40 w-full rounded-2xl" />,
  ssr: false
})

export default function Community() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [myExpenses, setMyExpenses] = useState<any[]>([])
  const [cityBenchmarks, setCityBenchmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, city')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)

          const [myExpResponse, cityExpResponse] = await Promise.all([
            supabase
              .from('expenses')
              .select('category, amount')
              .eq('user_id', user.id),
            supabase
              .from('expenses')
              .select('category, amount, user_id')
              .not('user_id', 'eq', user.id)
          ])

          if (myExpResponse.data) setMyExpenses(myExpResponse.data)

          if (cityExpResponse.data) {
            const othersData = cityExpResponse.data
            const categoriesToFetch = ['miete', 'essen', 'transport', 'freizeit']
            
            const benchmarks = categoriesToFetch.map(cat => {
              const catExpenses = othersData.filter((e: any) => e.category === cat)
              const total = catExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0)
              const avg = catExpenses.length > 0 ? total / catExpenses.length : 0
              
              return {
                category: cat,
                avg_amount: avg
              }
            })
            setCityBenchmarks(benchmarks)
          }
        }
      } catch (error) {
        console.error('Error fetching community data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const categories = [
    { id: 'miete', name: 'Miete', icon: 'home', color: '#6bae75' },
    { id: 'essen', name: 'Essen', icon: 'restaurant', color: '#8DCF98' },
    { id: 'transport', name: 'Transport', icon: 'directions_car', color: '#B0E0B8' },
    { id: 'freizeit', name: 'Freizeit', icon: 'wb_sunny', color: '#D4F1D9' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-background pt-12 pb-24 px-6 md:px-12 flex justify-center">
          <div className="w-full max-w-4xl space-y-12">
            <div className="text-center space-y-4">
              <Skeleton className="h-4 w-48 mx-auto" />
              <Skeleton className="h-12 w-96 mx-auto" />
            </div>
            <BenchmarkSkeleton />
          </div>
        </main>
      </>
    )
  }

  const city = profile?.city || 'Deiner Stadt'

  return (
    <>
      <Navbar />
      <main className="flex-1 flex justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 bg-background overflow-y-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[960px] flex flex-col gap-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider">
                <span className="material-symbols-outlined text-lg">bar_chart</span>
                <span>Einblicke</span>
              </div>
              <h1 className="text-text-primary text-3xl md:text-4xl font-black leading-tight tracking-tight">Community Vergleich</h1>
              <p className="text-text-muted text-base md:text-lg font-normal">
                Vergleiche deine monatlichen Ausgaben mit anderen in <span className="text-primary font-bold">{city}</span>.
              </p>
            </div>
            <div className="bg-white border border-gray-200 px-6 py-3 rounded-xl shadow-sm flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span className="font-bold text-text-primary">{city}</span>
            </div>
          </div>

          <div className="flex flex-col gap-6 relative">
            {categories.map((cat, idx) => {
              const myCatExpenses = myExpenses.filter(e => e.category === cat.id)
              const userValue = myCatExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
              const bench = cityBenchmarks.find(b => b.category === cat.id)
              const avgValue = bench?.avg_amount || 0
              const maxAmount = Math.max(userValue, avgValue, 100) * 1.2

              const diff = avgValue > 0 ? ((userValue - avgValue) / avgValue) * 100 : 0
              const isGood = diff <= 5

              const isLocked = idx > 0 && profile?.subscription_tier === 'free'

              return (
                <motion.div 
                  key={cat.id} 
                  variants={itemVariants}
                  whileHover={!isLocked ? { scale: 1.01 } : {}}
                  className={`bg-white rounded-2xl p-6 shadow-sm border border-primary/5 transition-all relative overflow-hidden ${isLocked ? 'blur-sm pointer-events-none select-none' : ''}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">{cat.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-text-primary text-lg font-bold">{cat.name}</h3>
                        <p className="text-text-muted text-sm">Monatlicher Trend</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${isGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      <span className="material-symbols-outlined text-sm">{isGood ? 'thumb_up' : 'trending_up'}</span>
                      {diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`} vs. Avg
                    </div>
                  </div>

                  <BenchmarkChart 
                    userValue={userValue}
                    avgValue={avgValue}
                    maxAmount={maxAmount}
                    color={cat.color}
                  />
                </motion.div>
              )
            })}

            {/* Overlay for Free Users */}
            {profile?.subscription_tier === 'free' && (
              <div className="absolute inset-x-0 bottom-0 top-[200px] bg-linear-to-t from-background via-background/80 to-transparent flex flex-col items-center justify-center z-20 pb-20 pt-40 px-6">
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   className="bg-white p-8 rounded-3xl shadow-2xl border border-primary/20 max-w-sm w-full text-center"
                >
                  <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-primary text-3xl">lock</span>
                  </div>
                  <h3 className="text-xl font-black text-text-primary mb-3">Detaillierte Einblicke freischalten</h3>
                  <p className="text-text-muted mb-8 text-sm font-medium leading-relaxed">
                    Vergleiche alle Kategorien und erhalte tiefere Einblicke in dein Konsumverhalten mit <span className="text-primary font-bold">Pungo Pro</span>.
                  </p>
                  <button 
                    onClick={() => router.push('/pricing')}
                    className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                  >
                    Pro freischalten
                  </button>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </>
  )
}
