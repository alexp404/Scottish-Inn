// Simple confirmation page showing success message and next steps.
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function Confirmation(){
  const { bookingId } = useParams()
  return (
    <Layout>
      <section className="section">
        <h1 style={{color:'var(--primary)'}}>Payment Successful</h1>
        <Card>
          <p>Your booking has been confirmed and payment processed.</p>
          <p><strong>Booking ID:</strong> {bookingId}</p>
          <div style={{marginTop:12}}>
            <Link to="/dashboard">Go to My Reservations</Link>
          </div>
        </Card>
      </section>
    </Layout>
  )
}
