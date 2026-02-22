'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Cancel() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[32px] p-12 shadow-soft text-center"
        >
          <div className="size-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-red-500 text-5xl">cancel</span>
          </div>
          <h1 className="text-3xl font-black text-text-primary mb-4 tracking-tight">Zahlung abgebrochen</h1>
          <p className="text-text-muted mb-10 leading-relaxed font-medium">
            Kein Problem! Du kannst dein Upgrade jederzeit später abschließen.
          </p>
          <Link 
            href="/pricing"
            className="block w-full bg-gray-100 text-text-primary font-bold py-4 rounded-2xl transition-all hover:bg-gray-200"
          >
            Zurück zur Preisübersicht
          </Link>
        </motion.div>
      </main>
    </>
  )
}
