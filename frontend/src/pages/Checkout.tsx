// Clean, utilitarian checkout UI focusing on clarity, totals, and a simple payment form.
import Layout from '../components/Layout'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import React, { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

// Lazy load the payment form to avoid loading Stripe upfront
// This reduces the initial bundle size significantly
const PaymentForm = lazy(() => import('../components/payment/PaymentForm'))

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

export default function Checkout() {
  const { bookingId } = useParams()

  return (
    <Layout>
      <Elements stripe={stripePromise}>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner />
          </div>
        }>
          <PaymentForm bookingId={bookingId} />
        </Suspense>
      </Elements>
    </Layout>
  )
}
