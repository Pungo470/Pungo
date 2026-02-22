import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url === 'YOUR_SUPABASE_URL' || key === 'YOUR_SUPABASE_ANON_KEY') {
    if (typeof window !== 'undefined') {
      console.error('Supabase configuration is missing or invalid. Please check your .env.local file.')
    }
    // Return a dummy client or handle gracefully to prevent crashes
    return {} as any 
  }

  return createBrowserClient(url, key)
}
