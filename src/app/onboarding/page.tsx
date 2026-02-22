'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Onboarding() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [phase, setPhase] = useState('studium')
  const [city, setCity] = useState('München')
  const [budget, setBudget] = useState('1600')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      } else {
        router.push('/login')
      }
    }
    getUser()
  }, [router])

  const phases = [
    { id: 'studium', name: 'Studium', icon: 'school' },
    { id: 'auslandsjahr', name: 'Auslandsjahr', icon: 'flight' },
    { id: 'elternzeit', name: 'Elternzeit', icon: 'child_care' },
    { id: 'umzug', name: 'Umzug', icon: 'local_shipping' },
    { id: 'gapyear', name: 'Gap Year', icon: 'explore' },
  ]

  const handleFinish = async () => {
    if (!userId) return
    setLoading(true)

    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          city: city,
          monthly_budget: parseFloat(budget),
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // 2. Create Life Phase
      const selectedPhase = phases.find(p => p.id === phase)
      const { error: phaseError } = await supabase
        .from('life_phases')
        .insert({
          user_id: userId,
          name: selectedPhase?.name || phase,
          type: phase,
          city: city,
        })

      if (phaseError) throw phaseError

      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
      alert('Fehler beim Speichern der Daten. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-soft-green p-10 space-y-8">
        {step === 1 && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-primary-dark">Willkommen bei Pungo</h1>
              <p className="text-text-muted">In welcher Lebensphase befindest du dich gerade?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {phases.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPhase(p.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${phase === p.id ? 'border-primary bg-primary/5 text-primary-dark' : 'border-gray-100 hover:border-primary/30 text-text-muted'}`}
                >
                  <span className="material-symbols-outlined text-2xl">{p.icon}</span>
                  <span className="font-bold">{p.name}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setStep(2)}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-primary-dark transition-all"
            >
              Weiter
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-primary-dark">Details festlegen</h1>
              <p className="text-text-muted">Wo wohnst du und wie hoch ist dein monatliches Budget?</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-muted uppercase tracking-wider">Stadt</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="z.B. München"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 text-text-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-muted uppercase tracking-wider">Monatliches Budget (€)</label>
                <input 
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 font-bold text-xl text-text-primary"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-text-muted font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
              >
                Zurück
              </button>
              <button 
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {loading ? 'Speichern...' : 'Fertigstellen'}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
