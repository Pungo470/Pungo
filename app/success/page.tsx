'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Success() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[32px] p-12 shadow-soft-green text-center"
        >
          <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="material-symbols-outlined text-primary text-5xl"
            >
              verified
            </motion.span>
          </div>
          <h1 className="text-3xl font-black text-text-primary mb-4 tracking-tight">Vielen Dank!</h1>
          <p className="text-text-muted mb-10 leading-relaxed font-medium">
            Deine Zahlung war erfolgreich. Dein Account wurde aktualisiert und alle Pro-Features sind jetzt freigeschaltet.
          </p>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href="/dashboard"
              className="block w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark"
            >
              Zum Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </>
  )
}
