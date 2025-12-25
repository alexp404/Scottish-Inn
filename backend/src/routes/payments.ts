import { Router } from 'express'
import Stripe from 'stripe'
import dotenv from 'dotenv'
import { pool } from '../utils/db'
import bodyParser from 'body-parser'

dotenv.config()

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' })

// Create PaymentIntent for a booking
router.post('/api/payments/intent', async (req, res) => {
  const { amount, currency = 'usd', bookingId, idempotencyKey } = req.body
  if (!amount || !bookingId) return res.status(400).json({ error: 'amount and bookingId required' })

  try{
    // Optionally verify booking exists
    const bRes = await pool.query('SELECT id, email FROM bookings WHERE id = $1', [bookingId])
    if (bRes.rowCount === 0) return res.status(404).json({ error: 'Booking not found' })

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      metadata: { bookingId },
      receipt_email: bRes.rows[0].email,
      automatic_payment_methods: { enabled: true }
    }, idempotencyKey ? { idempotencyKey } : undefined)

    // Persist payment record
    await pool.query(
      'INSERT INTO payments (booking_id, payment_method, amount, status, payment_processor_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (payment_processor_id) DO NOTHING',
      [bookingId, 'card', Number(amount), 'pending', intent.id]
    )

    return res.json({ clientSecret: intent.client_secret, intentId: intent.id })
  }catch(err:any){
    console.error('Create intent error:', err)
    return res.status(500).json({ error: 'Failed to create payment intent' })
  }
})

// Stripe webhook for payment updates
router.post('/api/payments/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event

  try{
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret || '')
  }catch(err:any){
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Basic logging for webhook events
  console.log('Stripe webhook event received:', event.type)

  switch(event.type){
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.log('Payment succeeded for PI:', pi.id, 'Booking:', pi.metadata?.bookingId)
      pool.query('UPDATE payments SET status = $1, updated_at = NOW() WHERE payment_processor_id = $2', ['completed', pi.id]).catch(console.error)
      pool.query('UPDATE bookings SET paid = true, updated_at = NOW() WHERE id = $1', [pi.metadata?.bookingId]).catch(console.error)
      break
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.warn('Payment failed for PI:', pi.id)
      pool.query('UPDATE payments SET status = $1, updated_at = NOW() WHERE payment_processor_id = $2', ['failed', pi.id]).catch(console.error)
      break
    }
    default:
      console.log('Unhandled Stripe event type:', event.type)
      break
  }

  res.json({ received: true })
})

export default router
