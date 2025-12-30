import React, { useEffect, useState, lazy, Suspense } from 'react'
import Layout from '../components/Layout'
import { fetchBookings, cancelBooking } from '../services/api'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Table from '../components/ui/Table'
import { useNavigate } from 'react-router-dom'
import { useToasts } from '../context/ToastContext'

// Lazy load stats component to reduce initial bundle
const AdminStats = lazy(() => import('../components/admin/AdminStats'))

export default function AdminDashboard(){
  const [bookings, setBookings] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
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

  useEffect(()=>{ load() }, [page, statusFilter, search])

  async function handleRemove(id: string){
    if (!confirm('Cancel this booking?')) return
    try{
      await cancelBooking(id, 'Cancelled via admin UI')
      push({ type: 'success', message: 'Booking cancelled' })
      load()
    }catch(err:any){
      push({ type: 'error', message: err?.message || 'Failed to cancel booking' })
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

        {/* Lazy load stats component */}
        <Suspense fallback={
          <div className="animate-pulse space-y-4 mt-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        }>
          <AdminStats />
        </Suspense>

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
