import { Router } from 'express'
import { pool } from '../utils/db'
import adminAuth from '../middleware/adminAuth'

const router = Router()

// List bookings for current user (guest)
router.get('/api/guests/me/bookings', adminAuth, async (req, res) => {
  const user = (req as any).user
  const status = (req.query.status as string) || '' // 'upcoming' | 'past' | ''
  try{
    let where = 'b.user_id = $1'
    const params: any[] = [user.userId]
    if (status === 'upcoming'){
      where += " AND b.check_out_date >= CURRENT_DATE AND b.status IN ('pending','confirmed','checked_in')"
    }else if (status === 'past'){
      where += " AND b.check_out_date < CURRENT_DATE"
    }

    const result = await pool.query(
      `SELECT b.id, b.confirmation_id, b.room_id, b.check_in_date, b.check_out_date, b.guest_count, b.status, b.total_price
       FROM bookings b
       WHERE ${where}
       ORDER BY b.check_in_date DESC`,
      params
    )

    return res.json({ bookings: result.rows })
  }catch(err){
    console.error('Get guest bookings error:', err)
    return res.status(500).json({ error: 'Failed to get bookings' })
  }
})

export default router
