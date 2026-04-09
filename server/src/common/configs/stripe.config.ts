import Stripe from 'stripe'
import { envConfig } from './configs'

export const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-03-25.dahlia' // Use the version expected by the installed SDK
})
