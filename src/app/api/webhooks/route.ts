import { NextResponse } from 'next/server'
import { stripe } from '@/utils/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables in webhook')
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Helper to map Price IDs to Tiers
  const getTierFromPriceId = (priceId: string): string => {
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 
        priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY) return 'pro'
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY || 
        priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY) return 'premium'
    return 'free'
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const userId = session.metadata.userId
    const priceId = session.line_items?.data?.[0]?.price?.id || session.metadata.priceId
    
    const tier = getTierFromPriceId(priceId)

    const { error } = await supabase
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', userId)

    if (error) console.error('Error updating profile on completion:', error)
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any
    // We'd typically store userId in subscription metadata or look it up
    // For now, assuming we can find it via a query or metadata
    const userId = subscription.metadata.userId

    if (userId) {
      await supabase
        .from('profiles')
        .update({ subscription_tier: 'free' })
        .eq('id', userId)
    }
  }

  return NextResponse.json({ received: true })
}
