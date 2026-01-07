import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { pool } from '../utils/db'
import adminAuth from '../middleware/adminAuth'
import { sendBookingConfirmation, sendBookingCancellation } from '../services/emailService'

const router = Router()

// Generate confirmation ID (you may already have this function)
function generateConfirmationId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Validate payload helper
function validateBookingPayload(body: any) {
  const errors: Record<string, string> = {}
  if (!body.room_id) errors.room_id = 'room_id is required'
  if (!body.first_name || String(body.first_name).trim() === '') errors.first_name = 'First name is required'
  if (!body.last_name || String(body.last_name).trim() === '') errors.last_name = 'Last name is required'
  if (!body.email || !/^\S+@\S+\.\S+$/.test(String(body.email))) errors.email = 'Valid email is required'
  if (!body.check_in_date) errors.check_in_date = 'check_in_date is required'
  if (!body.check_out_date) errors.check_out_date = 'check_out_date is required'
  if (body.check_in_date && body.check_out_date) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
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
  try {
    const [rows]: any = await pool.query('SELECT id FROM rooms WHERE id = ?', [body.room_id])
    if (rows.length === 0) {
      return res.status(400).json({ errors: { room_id: 'room_id does not exist' } })
    }
  } catch (err) {
    console.error('DB error checking room:', err)
    return res.status(500).json({ error: 'Database error' })
  }

  try {
    // Generate IDs
    const bookingId = uuidv4()
    const confirmationId = generateConfirmationId()

    const insertQuery = `
      INSERT INTO bookings (
        id, confirmation_id, room_id, user_id, check_in_date, check_out_date, guest_count,
        first_name, last_name, email, phone_number, special_requests,
        subtotal, tax, total_price, paid, payment_method, payment_reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const values = [
      bookingId,
      confirmationId,
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
      Number(body.subtotal),
      body.tax ?? 0,
      (Number(body.subtotal) + (body.tax ?? 0)),
      body.paid ?? false,
      body.payment_method || null,
      body.payment_reference || null
    ]

    await pool.query(insertQuery, values)

    // Fetch the created booking
    const [bookingRows]: any = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId])
    const booking = bookingRows[0]

    // Send confirmation email (async)
    sendBookingConfirmation(booking.email, booking).catch(console.error)

    return res.status(201).json(booking)
  } catch (err) {
    console.error('DB insert booking error:', err)
    return res.status(500).json({ error: 'Failed to create booking' })
  }
})

// List bookings - admin only, supports pagination & filters
router.get('/api/bookings', adminAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(100, Math.max(5, Number(req.query.pageSize) || 20))
    const status = req.query.status as string | undefined
    const search = req.query.search as string | undefined

    const where: string[] = []
    const params: any[] = []

    if (status) {
      where.push(`status = ?`)
      params.push(status)
    }
    if (search) {
      where.push(`(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`)
      const searchPattern = '%' + search + '%'
      params.push(searchPattern, searchPattern, searchPattern)
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const offset = (page - 1) * pageSize

    const query = `SELECT * FROM bookings ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    const queryParams = [...params, pageSize, offset]

    const [bookingRows]: any = await pool.query(query, queryParams)

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM bookings ${whereClause}`
    const [countRows]: any = await pool.query(countQuery, params)
    const total = Number(countRows[0].total)

    return res.json({ bookings: bookingRows, page, pageSize, total })
  } catch (err) {
    console.error('DB fetch bookings error:', err)
    return res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// Get booking by ID
router.get('/api/bookings/:id', adminAuth, async (req, res) => {
  const id = req.params.id
  try {
    const [rows]: any = await pool.query('SELECT * FROM bookings WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' })
    return res.json(rows[0])
  } catch (err) {
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

  try {
    const fields: string[] = []
    const values: any[] = []

    if (status) {
      fields.push(`status = ?`)
      values.push(status)
    }
    if (cancellation_reason !== undefined) {
      fields.push(`cancellation_reason = ?`)
      values.push(cancellation_reason)
    }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' })

    // Add updated_at
    fields.push(`updated_at = NOW()`)

    const updateQuery = `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`
    values.push(id)

    await pool.query(updateQuery, values)

    // Fetch updated booking
    const [rows]: any = await pool.query('SELECT * FROM bookings WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' })

    return res.json(rows[0])
  } catch (err) {
    console.error('DB update booking error:', err)
    return res.status(500).json({ error: 'Failed to update booking' })
  }
})

// Cancel booking - sets status to 'cancelled' and stores a reason
router.post('/api/bookings/:id/cancel', adminAuth, async (req, res) => {
  const id = req.params.id
  const { reason } = req.body

  try {
    // Check if booking exists
    const [existingRows]: any = await pool.query('SELECT * FROM bookings WHERE id = ?', [id])
    if (existingRows.length === 0) return res.status(404).json({ error: 'Booking not found' })

    const booking = existingRows[0]
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' })
    }

    // Update booking
    await pool.query(
      'UPDATE bookings SET status = ?, cancellation_reason = ?, updated_at = NOW() WHERE id = ?',
      ['cancelled', reason || 'Cancelled by admin', id]
    )

    // Fetch updated booking
    const [rows]: any = await pool.query('SELECT * FROM bookings WHERE id = ?', [id])
    const updatedBooking = rows[0]

    // Send cancellation email (async)
    sendBookingCancellation(updatedBooking.email, updatedBooking).catch(console.error)

    return res.json(updatedBooking)
  } catch (err) {
    console.error('DB cancel booking error:', err)
    return res.status(500).json({ error: 'Failed to cancel booking' })
  }
})

export default router
