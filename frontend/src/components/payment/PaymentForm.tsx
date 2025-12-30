import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface CheckoutBookingSummary {
  roomLabel: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  subtotal: number
  tax: number
  bookingId?: string
}

interface PaymentFormProps {
  bookingId?: string
}

/**
 * Stripe payment form component - lazy loaded to reduce initial bundle
 * This component is split from Checkout.tsx to avoid loading Stripe upfront
 */
function PaymentForm({ bookingId }: PaymentFormProps) {
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()

  const [summary, setSummary] = useState<CheckoutBookingSummary | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const total = useMemo(() => (summary ? (summary.subtotal + summary.tax) : 0), [summary])

  async function initialize() {
    setError(null)
    // In a real app, fetch booking by id to fill summary
    const mock: CheckoutBookingSummary = {
      roomLabel: 'Room 102 – Double',
      checkIn: '2025-01-04',
      checkOut: '2025-01-06',
      nights: 2,
      guests: 2,
      subtotal: 239.98,
      tax: 19.20,
      bookingId: bookingId
    }
    setSummary(mock)
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://scottish-inn-backend.onrender.com') + '/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: mock.subtotal + mock.tax, currency: 'usd', bookingId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Payment intent failed')
      setClientSecret(data.clientSecret)
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize payment')
    }
  }

  React.useEffect(() => { initialize() }, [bookingId])

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setStatus(null)
    if (!stripe || !elements || !clientSecret) return
    setLoading(true)
    try {
      const card = elements.getElement(CardElement)
      if (!card) throw new Error('Card element not ready')
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      })
      if (stripeError) throw new Error(stripeError.message || 'Payment failed')
      if (paymentIntent?.status === 'succeeded') {
        setStatus('Payment succeeded')
        setTimeout(() => navigate(`/confirmation/${bookingId}`), 500)
      } else {
        setError('Payment not completed')
      }
    } catch (err: any) {
      setError(err?.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section">
      <h1 style={{ color: 'var(--primary)' }}>Checkout</h1>
      <div className="columns" style={{ marginTop: 12 }}>
        <Card>
          <h3>Payment Details</h3>
          <form onSubmit={handlePay}>
            <div style={{ marginTop: 8, padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
              <CardElement options={{ hidePostalCode: true }} />
            </div>
            {error && <div role="alert" style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            {status && <div role="status" style={{ color: 'green', marginTop: 8 }}>{status}</div>}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Button type="submit" variant="secondary" disabled={loading || !clientSecret}>
                {loading ? 'Processing...' : 'Pay now'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </Card>

        <Card>
          <h3>Booking Summary</h3>
          {summary ? (
            <div className="summary">
              <div className="row"><span>Room</span><strong>{summary.roomLabel}</strong></div>
              <div className="row"><span>Dates</span><strong>{summary.checkIn} ? {summary.checkOut}</strong></div>
              <div className="row"><span>Nights</span><strong>{summary.nights}</strong></div>
              <div className="row"><span>Guests</span><strong>{summary.guests}</strong></div>
              <div className="row"><span>Subtotal</span><strong>${summary.subtotal.toFixed(2)}</strong></div>
              <div className="row"><span>Tax</span><strong>${summary.tax.toFixed(2)}</strong></div>
              <div className="row total"><span>Total</span><strong>${(summary.subtotal + summary.tax).toFixed(2)}</strong></div>
            </div>
          ) : (
            <div className="muted">Loading summary…</div>
          )}
        </Card>
      </div>
    </section>
  )
}

export default PaymentForm
