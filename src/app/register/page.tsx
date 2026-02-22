'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Register() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-soft-green p-8 md:p-12 border border-primary/5"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">spa</span>
            <span className="font-display font-bold text-2xl text-primary-dark">Pungo</span>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Konto erstellen</h1>
          <p className="text-text-muted text-sm mt-2 text-center">
            Starte heute mit deiner finanziellen Zukunftsplanung.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 italic">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Benutzername</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-text-primary focus:ring-2 focus:ring-primary/50"
              placeholder="z.B. Alex"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-text-primary focus:ring-2 focus:ring-primary/50"
              placeholder="name@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Passwort</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-text-primary focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Passwort bestätigen</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-text-primary focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 mt-2 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Laden...' : 'Registrieren'}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          Bereits ein Konto?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Einloggen
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
