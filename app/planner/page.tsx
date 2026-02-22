'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Planner() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [category, setCategory] = useState('miete')
  const [amount, setAmount] = useState('850.00')
  const [type, setType] = useState('fix')
  const [interval, setInterval] = useState('monatlich')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        
        try {
          // Fetch active life phase
          const { data: phases } = await supabase
            .from('life_phases')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)

          if (phases && phases.length > 0) {
            setActivePhaseId(phases[0].id)
            fetchExpenses(user.id, phases[0].id)
          }
        } catch (error) {
          console.error('Error initializing planner:', error)
        }
      } else {
        router.push('/login')
      }
    }
    init()
  }, [router])

  const fetchExpenses = async (uid: string, pid: string) => {
    const { data } = await supabase
      .from('expenses')
      .select('id, category, amount, description, created_at')
      .eq('user_id', uid)
      .eq('phase_id', pid)
      .order('created_at', { ascending: false })

    if (data) setExpenses(data)
  }

  const handleSave = async () => {
    if (!userId || !activePhaseId) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: userId,
          phase_id: activePhaseId,
          category,
          amount: parseFloat(amount),
          type,
          interval,
          description,
        })

      if (error) throw error
      
      // Reset form and refresh list
      setAmount('')
      setDescription('')
      fetchExpenses(userId, activePhaseId)
    } catch (error) {
      console.error('Error saving expense:', error)
      alert('Fehler beim Speichern der Ausgabe.')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'miete', name: 'Miete', icon: 'home' },
    { id: 'essen', name: 'Essen', icon: 'restaurant' },
    { id: 'transport', name: 'Transport', icon: 'directions_car' },
    { id: 'freizeit', name: 'Freizeit', icon: 'wb_sunny' },
    { id: 'versich', name: 'Versich.', icon: 'shield' },
  ]

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col md:flex-row items-start justify-center pt-8 pb-24 px-6 relative bg-background gap-8">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-10 left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            className="absolute bottom-10 right-[10%] w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[80px]"
          ></motion.div>
        </div>

        {/* Centered Card (Form) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[600px] bg-white rounded-[24px] shadow-soft-green flex flex-col relative z-10"
        >
          {/* Card Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Neue Ausgabe hinzufügen</h1>
            <p className="text-text-muted text-sm">Kategorisiere und verfolge deine Ausgaben für eine genaue Zukunftsplanung.</p>
          </div>

          {/* Form Body */}
          <div className="p-8 pt-2 space-y-8">
            {/* Category Section */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">Kategorie</label>
              <div className="grid grid-cols-5 gap-3">
                {categories.map((cat) => (
                  <motion.button 
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${category === cat.id ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-gray-50'}`}
                  >
                    <div className={`p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform ${category === cat.id ? 'bg-white text-primary' : 'bg-gray-100 text-text-muted'}`}>
                      <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                    </div>
                    <span className={`text-xs font-semibold ${category === cat.id ? 'text-primary' : 'text-text-muted'}`}>{cat.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input & Toggles Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              {/* Amount Input */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">Betrag (€)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-text-muted text-lg font-medium">€</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-text-primary text-xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-primary/50 transition-shadow"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Type & Frequency */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded-xl">
                  <motion.button 
                    onClick={() => setType('fix')}
                    whileTap={{ scale: 0.98 }} 
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${type === 'fix' ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                  >Fix</motion.button>
                  <motion.button 
                    onClick={() => setType('variabel')}
                    whileTap={{ scale: 0.98 }} 
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${type === 'variabel' ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                  >Variabel</motion.button>
                </div>
                <div className="flex items-center gap-3">
                  <label onClick={() => setInterval('monatlich')} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`relative flex items-center justify-center size-5 rounded-full border ${interval === 'monatlich' ? 'border-primary bg-primary' : 'border-gray-300 bg-transparent group-hover:border-primary'}`}>
                      {interval === 'monatlich' && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                    </div>
                    <span className={`text-sm font-medium ${interval === 'monatlich' ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`}>Monatlich</span>
                  </label>
                  <label onClick={() => setInterval('einmalig')} className="flex items-center gap-2 cursor-pointer group ml-4">
                    <div className={`relative flex items-center justify-center size-5 rounded-full border ${interval === 'einmalig' ? 'border-primary bg-primary' : 'border-gray-300 bg-transparent group-hover:border-primary'}`}>
                      {interval === 'einmalig' && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                    </div>
                    <span className={`text-sm font-medium ${interval === 'einmalig' ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`}>Einmalig</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">Beschreibung <span className="font-normal normal-case text-gray-300 ml-1">(Optional)</span></label>
              <input 
                className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-text-primary text-base font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="z.B. Miete Wohnung"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Footer Action Area */}
          <div className="mt-4 bg-gray-50 rounded-b-[24px] px-8 py-6 border-t border-gray-100">
            <motion.button 
              onClick={handleSave}
              disabled={loading || !amount}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-lg h-14 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{loading ? 'Speichern...' : 'Ausgabe speichern'}</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Expense List Side Panel */}
        <div className="w-full max-w-[400px] space-y-4 z-10">
          <h2 className="text-xl font-bold text-text-primary px-2">Bisherige Ausgaben</h2>
          <div className="flex flex-col gap-3">
            {expenses.length === 0 ? (
              <div className="bg-white/50 border-2 border-dashed border-primary/20 rounded-2xl p-8 text-center">
                <p className="text-text-muted text-sm italic">Noch keine Ausgaben erfasst.</p>
              </div>
            ) : (
              expenses.map((exp) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={exp.id} 
                  className="bg-white p-4 rounded-2xl border border-primary/5 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">
                        {categories.find(c => c.id === exp.category)?.icon || 'payments'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{exp.description || 'Ohne Titel'}</p>
                      <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">{exp.category}</p>
                    </div>
                  </div>
                  <p className="font-bold text-text-primary">€ {exp.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  )
}
