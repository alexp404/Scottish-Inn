import { Router } from 'express'
import { pool } from '../utils/db'
import adminAuth from '../middleware/adminAuth'

const router = Router()

// Admin stats: occupancy rate today, revenue today, bookings today
router.get('/api/admin/stats', adminAuth, async (req, res) => {
  try{
    const occupancyRes = await pool.query(`
      SELECT COUNT(*)::int AS occupied
      FROM bookings b
      WHERE b.status IN ('confirmed','checked_in')
        AND b.check_in_date <= CURRENT_DATE AND b.check_out_date > CURRENT_DATE
    `)
    const roomsRes = await pool.query(`SELECT COUNT(*)::int AS rooms FROM rooms`)
    const revenueRes = await pool.query(`
      SELECT COALESCE(SUM(amount),0)::numeric AS revenue
      FROM payments
      WHERE status = 'completed' AND CAST(created_at AS DATE) = CURRENT_DATE
    `)
    const bookingsTodayRes = await pool.query(`
      SELECT COUNT(*)::int AS bookings
      FROM bookings
      WHERE CAST(created_at AS DATE) = CURRENT_DATE
    `)

    const occupied = occupancyRes.rows[0]?.occupied || 0
    const rooms = roomsRes.rows[0]?.rooms || 0
    const occupancyRate = rooms > 0 ? Math.round((occupied / rooms) * 100) : 0
    const revenueToday = Number(revenueRes.rows[0]?.revenue || 0)
    const bookingsToday = bookingsTodayRes.rows[0]?.bookings || 0

    return res.json({ occupancyRate, revenueToday, bookingsToday })
  }catch(err){
    console.error('Admin stats error:', err)
    return res.status(500).json({ error: 'Failed to load stats' })
  }
})

// Daily revenue report (last 14 days)
router.get('/api/admin/reports/daily-revenue', adminAuth, async (req, res) => {
  try{
    const result = await pool.query(`
      SELECT CAST(created_at AS DATE) AS date, SUM(amount)::numeric AS revenue
      FROM payments
      WHERE status = 'completed'
      GROUP BY CAST(created_at AS DATE)
      ORDER BY date DESC
      LIMIT 14
    `)
    return res.json({ rows: result.rows })
  }catch(err){
    console.error('Daily revenue report error:', err)
    return res.status(500).json({ error: 'Failed to load report' })
  }
})

// Occupancy report: current occupancy by room
router.get('/api/admin/reports/occupancy', adminAuth, async (req, res) => {
  try{
    const result = await pool.query(`
      SELECT r.room_number,
             CASE WHEN b.id IS NOT NULL THEN 'occupied' ELSE 'vacant' END AS current_status,
             b.confirmation_id, b.first_name, b.last_name, b.check_out_date
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id
        AND b.status IN ('confirmed','checked_in')
        AND b.check_in_date <= CURRENT_DATE AND b.check_out_date > CURRENT_DATE
      ORDER BY r.room_number
    `)
    return res.json({ rows: result.rows })
  }catch(err){
    console.error('Occupancy report error:', err)
    return res.status(500).json({ error: 'Failed to load report' })
  }
})

export default router
