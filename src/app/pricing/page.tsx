'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Pricing() {
  const router = useRouter()
  const supabase = createClient()
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const plans = [
    { 
      id: 'free',
      name: 'Free', 
      price: '0', 
      description: 'Perfekt für den Einstieg in die persönlichen Finanzen.', 
      features: ['Grundlegende Ausgabenverfolgung', '1 Finanzziel', 'Manuelle Transaktionseingabe'], 
      color: 'border-gray-200' 
    },
    { 
      id: 'pro',
      name: 'Pro', 
      price: isYearly ? '3.25' : '4.99', 
      originalPrice: isYearly ? '4.99' : null,
      description: 'Fortgeschrittene Tools für ernsthafte Finanzplanung.', 
      features: ['Alles in Free, plus:', 'Automatischer Bank-Sync', 'Unbegrenzte Finanzziele', 'Net Worth Vorhersage'], 
      color: 'border-primary bg-primary/5', 
      recommended: true,
      priceId: isYearly ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
    },
    { 
      id: 'premium',
      name: 'Premium', 
      price: isYearly ? '6.58' : '9.99', 
      originalPrice: isYearly ? '9.99' : null,
      description: 'Ganzheitliches Vermögensmanagement mit KI-Support.', 
      features: ['Alles in Pro, plus:', 'KI Finanz-Assistent', 'Steuerplanungs-Modul', 'Prioritäts-Support'], 
      color: 'bg-primary-dark text-white',
      priceId: isYearly ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY : process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY
    },
  ]

  const handleUpgrade = async (plan: any) => {
    if (plan.id === 'free') {
      router.push('/register')
      return
    }

    setLoadingPlan(plan.id)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?next=/pricing')
      return
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.id,
          email: user.email
        }),
      })

      const { url, error } = await response.json()
      if (url) window.location.href = url
      if (error) throw new Error(error)
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Es gab ein Problem beim Starten des Checkouts. Bitte versuche es später erneut.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 bg-background overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-4"
            >
              <p className="text-primary font-bold tracking-widest uppercase text-xs">Preise</p>
              <h1 className="text-4xl md:text-6xl font-black text-text-primary mb-6 tracking-tight">
                Ein Investment für dein <span className="text-primary">Wohlbefinden</span>.
              </h1>
              <p className="text-lg text-text-muted mb-10 leading-relaxed font-medium">
                Wähle den Plan, der zu deiner finanziellen Reise passt. <br className="hidden md:block" /> Jederzeit kündbar, keine versteckten Kosten.
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-bold ${!isYearly ? 'text-text-primary' : 'text-text-muted'}`}>Monatlich</span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                className="w-14 h-8 bg-gray-200 rounded-full relative p-1 transition-colors hover:bg-gray-300"
              >
                <motion.div 
                  animate={{ x: isYearly ? 24 : 0 }}
                  className="w-6 h-6 bg-white rounded-full shadow-sm"
                />
              </button>
              <span className={`text-sm font-bold ${isYearly ? 'text-text-primary' : 'text-text-muted'}`}>
                Jährlich <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px]">-35%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-stretch">
            {plans.map((plan, idx) => (
              <motion.div 
                key={plan.name} 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative flex flex-col rounded-[32px] p-8 shadow-soft-green transition-all duration-300 hover:shadow-xl ${plan.color} ${plan.id === 'premium' ? 'ring-2 ring-primary/20' : ''}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                    Beliebteste Wahl
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-black tracking-tight">{plan.name}</h3>
                  <div className="mt-6 flex flex-col">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-black tracking-tighter">€{plan.price}</span>
                      <span className={`ml-1 text-sm font-bold opacity-60`}>/Monat</span>
                    </div>
                    {isYearly && plan.id !== 'free' && (
                      <span className="text-xs font-bold text-text-muted mt-1">Abrechnung jährlich (€{plan.id === 'pro' ? '39' : '79'}/Jahr)</span>
                    )}
                  </div>
                  <p className="mt-6 text-sm font-medium opacity-80 leading-relaxed">{plan.description}</p>
                </div>
                <ul className="mb-10 space-y-4 text-sm flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className={`material-symbols-outlined text-[20px] ${plan.id === 'premium' ? 'text-primary' : 'text-primary'}`}>
                        {feat.includes('plus') ? 'stars' : 'check_circle'}
                      </span>
                      <span className="font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleUpgrade(plan)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                    plan.id === 'premium' 
                      ? 'bg-white text-primary-dark hover:bg-gray-100 shadow-lg' 
                      : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    plan.id === 'free' ? 'Loslegen' : 'Upgrade sichern'
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
