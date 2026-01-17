import { Router } from 'express'
import { query, queryOne } from '../utils/db'

const router = Router()

// GET /api/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&guests=2&roomType=double&page=1&pageSize=20
router.get('/api/availability', async (req, res) => {
  const checkIn = String(req.query.checkIn || '')
  const checkOut = String(req.query.checkOut || '')
  const guests = Number(req.query.guests || 1)
  const roomType = (req.query.roomType as string) || ''
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))

  if (!checkIn || !checkOut) {
    return res.status(400).json({ error: 'checkIn and checkOut are required' })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' })
  }
  if (checkInDate < today) {
    return res.status(400).json({ error: 'Check-in date cannot be in the past' })
  }
  if (checkOutDate <= checkInDate) {
    return res.status(400).json({ error: 'Check-out date must be after check-in date' })
  }

  try {
    // Convert dates to MySQL format (YYYY-MM-DD)
    const checkInStr = checkIn.split('T')[0]
    const checkOutStr = checkOut.split('T')[0]

    // Rooms that can fit guests and match type, and NOT booked overlapping the requested range
    const filters: string[] = ['r.capacity >= ?']
    const params: any[] = [guests]
    
    if (roomType) {
      filters.push('LOWER(r.room_type) = LOWER(?)')
      params.push(roomType)
    }

    const whereRooms = `WHERE ${filters.join(' AND ')}`

    // Map database columns to frontend interface (snake_case -> camelCase)
    const baseQuery = `
      SELECT 
        r.id,
        r.room_number as roomNumber,
        r.room_type as roomType,
        r.capacity,
        r.base_price as basePrice,
        r.status,
        COALESCE(r.images, JSON_ARRAY()) as images
      FROM rooms r
      ${whereRooms}
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.room_id = r.id
          AND b.status IN ('pending','confirmed','checked_in')
          AND b.check_in_date < ?
          AND b.check_out_date > ?
      )
      ORDER BY r.base_price ASC, r.room_number ASC
      LIMIT ? OFFSET ?
    `

    const offset = (page - 1) * pageSize
    params.push(checkOutStr, checkInStr, pageSize, offset)

    const rooms = await query(baseQuery, params) as any[]

    // Convert numeric strings to numbers for frontend
    const formattedRooms = rooms.map((r: any) => ({
      ...r,
      basePrice: Number(r.basePrice)
    }))

    // Total count (without pagination)
    const countQuery = `
      SELECT COUNT(*) AS total FROM rooms r
      ${whereRooms}
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.room_id = r.id
          AND b.status IN ('pending','confirmed','checked_in')
          AND b.check_in_date < ?
          AND b.check_out_date > ?
      )
    `
    // Only pass the base filter params (guests, roomType if present) + dates
    const countParams = params.slice(0, -4)
    countParams.push(checkOutStr, checkInStr)
    const totalResult = await queryOne(countQuery, countParams) as any
    const total = Number(totalResult?.total || 0)

    return res.json({ rooms: formattedRooms, page, pageSize, total })
  } catch (err) {
    console.error('Availability error:', err)
    return res.status(500).json({ error: 'Failed to load availability' })
  }
})

export default router
