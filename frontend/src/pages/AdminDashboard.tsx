import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { fetchBookings, cancelBooking, getAdminStats, getDailyRevenue, getOccupancyReport } from '../services/api'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Table from '../components/ui/Table'
import { useNavigate } from 'react-router-dom'
import { useToasts } from '../context/ToastContext'

export default function AdminDashboard(){
  const [bookings, setBookings] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<{ occupancyRate: number; revenueToday: number; bookingsToday: number } | null>(null)
  const [revenueRows, setRevenueRows] = useState<{ date: string; revenue: number }[]>([])
  const [occupancyRows, setOccupancyRows] = useState<any[]>([])
  const navigate = useNavigate()
  const { push } = useToasts()

  async function load(){
    setLoading(true)
    try{
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)

      const data = await fetchBookings(params)
      setBookings(data.bookings)
      setTotal(data.total ?? 0)
    }catch(err:any){
      setError(err?.message || 'Failed to load bookings')
      push({ type: 'error', message: err?.message || 'Failed to load bookings' })
    }finally{
      setLoading(false)
    }
  }

  async function loadStats(){
    try{
      const s = await getAdminStats()
      setStats(s)
      const r = await getDailyRevenue()
      setRevenueRows(r.rows)
      const o = await getOccupancyReport()
      setOccupancyRows(o.rows)
    }catch(err:any){
      console.error('Failed to load stats/reports', err)
    }
  }

  useEffect(()=>{ load(); loadStats() }, [page, statusFilter])

  useEffect(()=>{
    function handler(e:any){
      const id = e.detail?.id
      if (id) setBookings(prev => prev ? prev.filter(b=>b.id !== id) : prev)
    }
    window.addEventListener('booking-cancelled', handler as EventListener)
    return ()=> window.removeEventListener('booking-cancelled', handler as EventListener)
  },[])

  async function handleRemove(id: string){
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setBookings(prev => prev ? prev.filter(b => b.id !== id) : prev)
    try{
      await cancelBooking(id, 'Cancelled via admin dashboard')
      push({ type: 'success', message: 'Booking cancelled' })
      window.dispatchEvent(new CustomEvent('booking-cancelled', { detail: { id } }))
    }catch(err:any){
      push({ type: 'error', message: err?.message || 'Failed to cancel booking' })
      load()
    }
  }

  const columns = [
    { key: 'confirmation_id', header: 'Confirmation', render: (b:any) => b.confirmation_id ?? b.id },
    { key: 'guest', header: 'Guest', render: (b:any) => <div>{b.first_name} {b.last_name}<br/><small className="muted">{b.email}</small></div> },
    { key: 'room', header: 'Room', render: (b:any) => b.room_id },
    { key: 'check_in', header: 'Check-in', render: (b:any) => b.check_in_date },
    { key: 'check_out', header: 'Check-out', render: (b:any) => b.check_out_date },
    { key: 'guests', header: 'Guests', render: (b:any) => b.guest_count },
    { key: 'subtotal', header: 'Subtotal', render: (b:any) => `$${Number(b.subtotal).toFixed(2)}` },
    { key: 'status', header: 'Status', render: (b:any) => <span className={`chip ${b.status==='cancelled'?'offline':'online'}`}>{b.status ?? 'pending'}</span> },
    { key: 'actions', header: 'Actions', render: (b:any) => (
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button className="button" onClick={() => navigate(`/admin/bookings/${b.id}`)}>View</button>
        <button className="button button-secondary" onClick={() => handleRemove(b.id)} disabled={b.status === 'cancelled'}>Cancel</button>
      </div>
    )}
  ]

  return (
    <Layout>
      <section className="section">
        <h1 style={{color:'var(--primary)'}}>Admin Dashboard</h1>

        {/* Stats tiles */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(1,1fr)',gap:12,marginTop:12}}>
          <Card>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div className="muted" style={{fontSize:12}}>Occupancy Rate</div>
                <div style={{fontSize:24,fontWeight:800}}>{stats ? `${stats.occupancyRate}%` : '—'}</div>
              </div>
              <div>
                <div className="muted" style={{fontSize:12}}>Revenue Today</div>
                <div style={{fontSize:24,fontWeight:800}}>{stats ? `$${stats.revenueToday.toFixed(2)}` : '—'}</div>
              </div>
              <div>
                <div className="muted" style={{fontSize:12}}>Bookings Today</div>
                <div style={{fontSize:24,fontWeight:800}}>{stats ? stats.bookingsToday : '—'}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue table */}
        <Card>
          <h3>Daily Revenue (Last 14 days)</h3>
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {revenueRows.map(r => (
                <tr key={r.date}><td>{r.date}</td><td>${Number(r.revenue).toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Occupancy table */}
        <Card>
          <h3>Current Occupancy by Room</h3>
          <table className="table">
            <thead>
              <tr><th>Room</th><th>Status</th><th>Guest</th><th>Checkout</th></tr>
            </thead>
            <tbody>
              {occupancyRows.map((o:any, idx:number) => (
                <tr key={idx}>
                  <td>{o.room_number}</td>
                  <td><span className={`chip ${o.current_status==='occupied'?'online':'offline'}`}>{o.current_status}</span></td>
                  <td>{o.first_name ? `${o.first_name} ${o.last_name}` : '-'}</td>
                  <td>{o.check_out_date ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
            <select className="input" value={statusFilter||''} onChange={(e)=>setStatusFilter(e.target.value||undefined)} style={{maxWidth:200}}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input className="input" placeholder="Search guest or email" value={search} onChange={(e)=>setSearch(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter'){ setPage(1); load() } }} style={{flex:1,minWidth:240}} />
            <button className="button" onClick={()=>{ setPage(1); load() }}>Apply</button>
          </div>

          {loading && <LoadingSpinner />}
          {error && <div style={{color:'red'}}>{error}</div>}
          {!loading && bookings && bookings.length === 0 && <div>No bookings found</div>}
          {!loading && bookings && bookings.length > 0 && (
            <div>
              <Table columns={columns} data={bookings} />
              <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
                <div>Page {page} / {Math.max(1, Math.ceil(total / pageSize))}</div>
                <div>
                  <button className="button" onClick={()=> setPage(p => Math.max(1, p-1))} disabled={page<=1}>Prev</button>
                  <button className="button" onClick={()=> setPage(p => p+1)} style={{marginLeft:8}}>Next</button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </section>
    </Layout>
  )
}
