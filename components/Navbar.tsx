'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      const currentSession: any = data.session
      setSession(currentSession)
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, newSession: any) => {
      setSession(newSession)
      if (newSession?.user) {
        fetchProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single()
      if (data) setProfile(data)
    } catch (err) {
      console.error('Error fetching profile in Navbar:', err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getTierLabel = (tier: string) => {
    if (tier === 'pro') return 'Pro'
    if (tier === 'premium') return 'Premium'
    return 'Free'
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/planner', label: 'Planung' },
    { href: '/community', label: 'Community' },
  ]

  return (
    <nav className="w-full bg-white/50 backdrop-blur-md border-b border-primary/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 h-full group">
            <div className="text-primary flex items-center">
              <span className="material-symbols-outlined text-3xl transition-transform group-hover:scale-110">spa</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-primary-dark">Pungo</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-10 h-full">
            {links.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`transition-colors h-full flex items-center relative font-display text-sm ${pathname === link.href ? 'text-primary font-bold' : 'text-text-muted hover:text-primary-dark font-medium'}`}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div 
                    layoutId="navbar-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* User Profile Placeholder */}
          <div className="flex items-center gap-6 h-full">
            {session ? (
              <>
                <button className="flex items-center justify-center size-10 text-text-muted hover:text-primary-dark transition-colors rounded-xl hover:bg-gray-50">
                  <span className="material-symbols-outlined text-[24px]">notifications</span>
                </button>
                <div className="flex items-center gap-4">
                  {/* Subscription Badge */}
                  {profile && (
                    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      profile.subscription_tier === 'premium' ? 'bg-primary-dark text-white border-white/20' : 
                      profile.subscription_tier === 'pro' ? 'bg-primary/10 text-primary border-primary/20' : 
                      'bg-gray-100 text-text-muted border-gray-200'
                    }`}>
                      <span className="material-symbols-outlined text-[12px]">
                        {profile.subscription_tier === 'premium' ? 'bolt' : profile.subscription_tier === 'pro' ? 'stars' : 'potted_plant'}
                      </span>
                      {getTierLabel(profile.subscription_tier)}
                    </div>
                  )}
                  
                  <div 
                    className="size-10 rounded-full bg-primary/20 bg-cover bg-center border-2 border-white shadow-sm ring-1 ring-primary/10 cursor-pointer hover:ring-primary/40 transition-all font-bold text-primary flex items-center justify-center text-xs"
                    style={{ backgroundImage: session?.user?.email ? `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}')` : 'none' }}
                  >
                    {!session?.user?.email && 'P'}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-bold text-text-muted hover:text-primary-dark transition-colors">
                  Login
                </Link>
                <Link href="/register" className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                  Registrieren
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
