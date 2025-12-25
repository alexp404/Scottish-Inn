// Clean, utilitarian guest dashboard listing upcoming and past reservations as cards and a simple profile section.
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import React, { useEffect, useState } from 'react'
import { getMyBookings } from '../services/api'
import { useToasts } from '../context/ToastContext'

interface Reservation {
  id: string
  confirmation_id: string
  roomLabel?: string
  room_id?: string
  check_in_date: string
  check_out_date: string
  guest_count: number
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  total_price: number
}

export default function GuestDashboard(){
  const [upcoming, setUpcoming] = useState<Reservation[]>([])
  const [past, setPast] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const { push } = useToasts()

  useEffect(()=>{
    async function load(){
      setLoading(true)
      try{
        const u = await getMyBookings('upcoming')
        const p = await getMyBookings('past')
        setUpcoming(u.bookings)
        setPast(p.bookings)
      }catch(err:any){
        push({ type: 'error', message: err?.message || 'Failed to load reservations' })
      }finally{
        setLoading(false)
      }
    }
    load()
  },[])

  function ReservationCard({ r }: { r: Reservation }){
    return (
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontWeight:800,color:'var(--primary)'}}>{r.roomLabel ?? r.room_id}</div>
            <div className="muted" style={{fontSize:12}}>Confirmation: {r.confirmation_id}</div>
            <div className="muted" style={{fontSize:12}}>{r.check_in_date} ? {r.check_out_date} · Guests: {r.guest_count}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div><span className={`chip ${r.status==='cancelled'?'offline':'online'}`}>{r.status}</span></div>
            <div style={{marginTop:6,fontWeight:800}}>${r.total_price.toFixed(2)}</div>
          </div>
        </div>
        <div style={{marginTop:12,display:'flex',gap:8}}>
          <Button variant="secondary">View details</Button>
          {r.status !== 'cancelled' && <Button variant="ghost">Cancel</Button>}
        </div>
      </Card>
    )
  }

  return (
    <Layout>
      <section className="section">
        <h1 style={{color:'var(--primary)'}}>My Reservations</h1>
        {loading ? (<div className="loading">Loading…</div>) : (
          <>
            <h2 style={{marginTop:12}}>Upcoming</h2>
            <div className="grid" style={{marginTop:8}}>
              {upcoming.length === 0 ? (<div className="muted">No upcoming reservations</div>) : upcoming.map(r => (
                <ReservationCard key={r.id} r={r} />
              ))}
            </div>

            <h2 style={{marginTop:24}}>Past</h2>
            <div className="grid" style={{marginTop:8}}>
              {past.length === 0 ? (<div className="muted">No past reservations</div>) : past.map(r => (
                <ReservationCard key={r.id} r={r} />
              ))}
            </div>
          </>)}
      </section>
    </Layout>
  )
}
