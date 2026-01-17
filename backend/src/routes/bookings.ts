import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { query, getPool } from '../utils/db'
import adminAuth from '../middleware/adminAuth'
import { sendBookingConfirmation, sendBookingCancellation } from '../services/emailService'

const router = Router()

// Validate payload helper
function validateBookingPayload(body: any){
  const errors: Record<string,string> = {}
  if (!body.room_id) errors.room_id = 'room_id is required'
  if (!body.first_name || String(body.first_name).trim() === '') errors.first_name = 'First name is required'
  if (!body.last_name || String(body.last_name).trim() === '') errors.last_name = 'Last name is required'
  if (!body.email || !/^\S+@\S+\.\S+$/.test(String(body.email))) errors.email = 'Valid email is required'
  if (!body.check_in_date) errors.check_in_date = 'check_in_date is required'
  if (!body.check_out_date) errors.check_out_date = 'check_out_date is required'
  if (body.check_in_date && body.check_out_date){
    const today = new Date(); today.setHours(0,0,0,0)
    const inDate = new Date(body.check_in_date)
    const outDate = new Date(body.check_out_date)
    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) errors.check_in_date = 'Invalid date format'
    else {
      if (inDate < today) errors.check_in_date = 'check_in_date cannot be in the past'
      if (outDate <= inDate) errors.check_out_date = 'check_out_date must be after check_in_date'
    }
  }
  if (typeof body.guest_count === 'undefined' || body.guest_count === null) errors.guest_count = 'guest_count is required'
  else if (Number(body.guest_count) < 1) errors.guest_count = 'guest_count must be at least 1'
  if (typeof body.subtotal === 'undefined' || isNaN(Number(body.subtotal))) errors.subtotal = 'subtotal is required and must be a number'
  return errors
}

// Create booking - persist to MySQL
router.post('/api/bookings', async (req, res) => {
  const body = req.body
  const errors = validateBookingPayload(body)
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors })
  }

  // Ensure room exists
  try{
    const rooms = await query('SELECT id FROM rooms WHERE id = ?', [body.room_id])
    if (!rooms || rooms.length === 0){
      return res.status(400).json({ errors: { room_id: 'room_id does not exist' } })
    }
  }catch(err){
    console.error('DB error checking room:', err)
    return res.status(500).json({ error: 'Database error' })
  }

  try{
    const id = uuidv4()
    const TAX_RATE = 0.0825 // 8.25% tax
    const subtotal = Number(body.subtotal)
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100 // Round to 2 decimals
    const totalPrice = subtotal + tax

    const insertQuery = `
      INSERT INTO bookings (
        id, room_id, user_id, check_in_date, check_out_date, guest_count,
        first_name, last_name, email, phone_number, special_requests,
        subtotal, tax, total_price, paid, payment_method, payment_reference,
        confirmation_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const values = [
      id,
      body.room_id,
      body.user_id || null,
      body.check_in_date,
      body.check_out_date,
      Number(body.guest_count),
      body.first_name,
      body.last_name,
      body.email,
      body.phone_number || null,
      body.special_requests || null,
      subtotal,
      tax,
      totalPrice,
      body.paid ?? false,
      body.payment_method || null,
      body.payment_reference || null,
      `CONF-${Date.now()}`,
      'pending'
    ]

    await query(insertQuery, values)

    // Fetch the created booking
    const bookingResult = await query('SELECT * FROM bookings WHERE id = ?', [id])
    const booking = bookingResult[0]

    // Send confirmation email (async)
    sendBookingConfirmation(booking.email, booking).catch(console.error)

    return res.status(201).json(booking)
  }catch(err){
    console.error('DB insert booking error:', err)
    return res.status(500).json({ error: 'Failed to create booking' })
  }
})

// List bookings - admin only, supports pagination & filters
router.get('/api/bookings', adminAuth, async (req, res) => {
  try{
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(100, Math.max(5, Number(req.query.pageSize) || 20))
    const status = req.query.status as string | undefined
    const search = req.query.search as string | undefined

    const where: string[] = []
    const params: any[] = []
    if (status){ where.push(`status = ?`); params.push(status) }
    if (search){ where.push(`(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`); params.push(`%${search}%`, `%${search}%`, `%${search}%`) }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const offset = (page - 1) * pageSize

    const q = `SELECT * FROM bookings ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    const countParams = params.slice()
    params.push(pageSize, offset)

    const result = await query(q, params)
    const countQuery = `SELECT COUNT(*) as total FROM bookings ${whereClause}`
    const countResult = await query(countQuery, countParams)
    const total = Number(countResult[0]?.total || 0)

    return res.json({ bookings: result, page, pageSize, total })
  }catch(err){
    console.error('DB fetch bookings error:', err)
    return res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// Get booking
router.get('/api/bookings/:id', adminAuth, async (req, res) => {
  const id = req.params.id
  try{
    const result = await query('SELECT * FROM bookings WHERE id = ?', [id])
    if (!result || result.length === 0) return res.status(404).json({ error: 'Booking not found' })
    return res.json(result[0])
  }catch(err){
    console.error('DB get booking error:', err)
    return res.status(500).json({ error: 'Failed to fetch booking' })
  }
})

// Update booking (partial) - allow status updates and cancellation reason
router.patch('/api/bookings/:id', adminAuth, async (req, res) => {
  const id = req.params.id
  const { status, cancellation_reason } = req.body
  const allowedStatus = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']
  if (status && !allowedStatus.includes(status)) return res.status(400).json({ error: 'Invalid status' })

  try{
    const fields: string[] = []
    const values: any[] = []
    if (status){ fields.push(`status = ?`); values.push(status) }
    if (typeof cancellation_reason !== 'undefined'){ fields.push(`cancellation_reason = ?`); values.push(cancellation_reason) }
    if (fields.length === 0) return res.status(400).json({ error: 'No updatable fields provided' })

    values.push(id)
    const q = `UPDATE bookings SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`
    const result = await query(q, values)
    if (!result || result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' })

    const updated = await query('SELECT * FROM bookings WHERE id = ?', [id])
    if (status === 'confirmed'){
      sendBookingConfirmation(updated.email, updated).catch(console.error)
    }

    return res.json(updated[0])
  }catch(err){
    console.error('DB update booking error:', err)
    return res.status(500).json({ error: 'Failed to update booking' })
  }
})

// Cancel booking (convenience endpoint)
router.post('/api/bookings/:id/cancel', adminAuth, async (req, res) => {
  const id = req.params.id
  const reason = req.body?.reason || 'Cancelled by admin'
  try{
    const result = await query('UPDATE bookings SET status = ?, cancellation_reason = ?, updated_at = NOW() WHERE id = ?', ['cancelled', reason, id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' })

    const booking = await query('SELECT * FROM bookings WHERE id = ?', [id])

    // Send cancellation email (async)
    sendBookingCancellation(booking.email, booking).catch(console.error)

    return res.json(booking[0])
  }catch(err){
    console.error('DB cancel booking error:', err)
    return res.status(500).json({ error: 'Failed to cancel booking' })
  }
})

// Add to your backend routes
router.post('/api/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body
    // Handle contact form submission (email, database storage, etc.)
    res.json({ success: true })
})

export default router
