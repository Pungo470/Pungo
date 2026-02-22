import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore - version mismatch between sdk and types
  apiVersion: '2024-12-18.acacia', 
  typescript: true,
})
