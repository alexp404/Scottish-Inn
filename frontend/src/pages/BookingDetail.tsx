import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { fetchBooking, updateBooking, cancelBooking } from '../services/api'
import Modal from '../components/ui/Modal'
import { useToasts } from '../context/ToastContext'

export default function BookingDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const { push } = useToasts()

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      try{
        if (!id) throw new Error('Missing id')
        const data = await fetchBooking(id)
        if (!mounted) return
        setBooking(data)
      }catch(err:any){
        if (mounted) setError(err?.message || 'Failed to load booking')
      }finally{
        if (mounted) setLoading(false)
      }
    }
    load()
    return ()=>{ mounted = false }
  },[id])

  async function handleCancel(reason?:string){
    if (!booking) return
    setActionLoading(true)
    try{
      const updated = await cancelBooking(booking.id, reason || 'Cancelled via admin UI')
      setBooking(updated)
      setShowCancelConfirm(false)
      push({ type: 'success', message: 'Booking cancelled. Cancellation email sent.' })
    }catch(err:any){
      setError(err?.message || 'Failed to cancel booking')
    }finally{
      setActionLoading(false)
    }
  }

  async function handleSetStatus(status:string){
    if (!booking) return
    const prev = booking
    setBooking({...booking, status})
    try{
      const updated = await updateBooking(booking.id, { status })
      setBooking(updated)
      if (status === 'confirmed'){
        push({ type: 'success', message: 'Booking confirmed. Confirmation email sent.' })
      }
    }catch(err:any){
      setBooking(prev)
      setError(err?.message || 'Failed to update status')
    }
  }

  if (loading) return <Layout><div className="container"><LoadingSpinner/></div></Layout>
  if (!booking) return <Layout><div className="container">Booking not found</div></Layout>

  return (
    <Layout>
      <section className="section">
        <h1 style={{color:'var(--primary)'}}>Reservation Details</h1>
        <div className="columns" style={{marginTop:12}}>
          <Card>
            <h3>Guest Information</h3>
            <div className="summary">
              <div className="row"><span>Name</span><strong>{booking.first_name} {booking.last_name}</strong></div>
              <div className="row"><span>Email</span><strong>{booking.email}</strong></div>
              <div className="row"><span>Guests</span><strong>{booking.guest_count}</strong></div>
            </div>

            <h3 style={{marginTop:16}}>Status</h3>
            <div>
              <span className={`chip ${booking.status==='cancelled'?'offline':'online'}`}>{booking.status}</span>
            </div>

            <div style={{marginTop:12,display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="button" onClick={() => handleSetStatus('confirmed')} disabled={actionLoading}>Confirm</button>
              <button className="button" onClick={() => handleSetStatus('checked_in')} disabled={actionLoading}>Check-in</button>
              <button className="button" onClick={() => handleSetStatus('checked_out')} disabled={actionLoading}>Check-out</button>
              <button className="button button-secondary" onClick={() => setShowCancelConfirm(true)} disabled={actionLoading}>Cancel</button>
            </div>

            {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
          </Card>

          <Card>
            <h3>Booking Summary</h3>
            <div className="summary">
              <div className="row"><span>Confirmation</span><strong>{booking.confirmation_id ?? booking.id}</strong></div>
              <div className="row"><span>Room</span><strong>{booking.room_id}</strong></div>
              <div className="row"><span>Check-in</span><strong>{booking.check_in_date}</strong></div>
              <div className="row"><span>Check-out</span><strong>{booking.check_out_date}</strong></div>
              <div className="row total"><span>Total</span><strong>${Number(booking.subtotal).toFixed(2)}</strong></div>
            </div>
          </Card>
        </div>

        <div style={{marginTop:12}}>
          <button className="button" onClick={() => navigate('/admin')}>Back to Admin</button>
        </div>

        {showCancelConfirm && (
          <Modal title="Confirm cancellation" onClose={() => setShowCancelConfirm(false)}>
            <p>Are you sure you want to cancel this booking?</p>
            <div style={{display:'flex',gap:8,marginTop:12}}>
              <button className="button button-secondary" onClick={() => handleCancel('Cancelled by admin via UI')} disabled={actionLoading}>Yes, cancel</button>
              <button className="button" onClick={() => setShowCancelConfirm(false)}>No, go back</button>
            </div>
          </Modal>
        )}
      </section>
    </Layout>
  )
}
