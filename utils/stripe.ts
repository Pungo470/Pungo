import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY || ''

export const stripe = new Stripe(key, {
  // @ts-ignore - version mismatch between sdk and types
  apiVersion: '2024-12-18.acacia', 
  typescript: true,
})
