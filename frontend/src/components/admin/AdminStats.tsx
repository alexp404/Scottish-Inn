import React, { useEffect, useState } from 'react'
import Card from '../ui/Card'
import { getAdminStats, getDailyRevenue, getOccupancyReport } from '../../services/api'

/**
 * Admin Statistics Dashboard - Lazy loaded component
 * Shows occupancy rate, revenue, and occupancy reports
 * Split from AdminDashboard to reduce initial load
 */
export default function AdminStats() {
  const [stats, setStats] = useState<{ occupancyRate: number; revenueToday: number; bookingsToday: number } | null>(null)
  const [revenueRows, setRevenueRows] = useState<{ date: string; revenue: number }[]>([])
  const [occupancyRows, setOccupancyRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      try {
        const [statsData, revenueData, occupancyData] = await Promise.all([
          getAdminStats(),
          getDailyRevenue(),
          getOccupancyReport()
        ])
        setStats(statsData)
        setRevenueRows(revenueData.rows)
        setOccupancyRows(occupancyData.rows)
      } catch (err) {
        console.error('Failed to load stats:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  return (
    <>
      {/* Stats tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: 12, marginTop: 12 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Occupancy Rate</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{stats ? `${stats.occupancyRate}%` : '…'}</div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Revenue Today</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{stats ? `$${stats.revenueToday.toFixed(2)}` : '…'}</div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Bookings Today</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{stats ? stats.bookingsToday : '…'}</div>
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
            {occupancyRows.map((o: any, idx: number) => (
              <tr key={idx}>
                <td>{o.room_number}</td>
                <td><span className={`chip ${o.current_status === 'occupied' ? 'online' : 'offline'}`}>{o.current_status}</span></td>
                <td>
                  {o.first_name && o.last_name ? (
                    <div>
                      {o.first_name} {o.last_name}
                      <br />
                      <small className="muted">{o.confirmation_id}</small>
                    </div>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td>{o.check_out_date || <span className="muted">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}
