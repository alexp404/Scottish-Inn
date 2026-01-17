import { Router } from 'express'
import { query } from '../utils/db'

const router = Router()

// GET /api/rooms - fetch from MySQL database
router.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await query(`
      SELECT 
        id,
        room_number as roomNumber,
        room_type as roomType,
        capacity,
        base_price as basePrice,
        status,
        COALESCE(images, JSON_ARRAY()) as images
      FROM rooms
      ORDER BY room_number ASC
    `)
    
    // Convert room prices from strings to numbers
    const formatted = (rooms as any[]).map(r => ({
      ...r,
      basePrice: Number(r.basePrice)
    }))
    
    res.json({ rooms: formatted })
  } catch (err) {
    console.error('Error fetching rooms:', err)
    res.status(500).json({ error: 'Failed to fetch rooms' })
  }
})

// GET /api/rooms/:id - fetch specific room from database
router.get('/api/rooms/:id', async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        id,
        room_number as roomNumber,
        room_type as roomType,
        capacity,
        base_price as basePrice,
        status,
        COALESCE(images, JSON_ARRAY()) as images
      FROM rooms
      WHERE id = ?
    `, [req.params.id])
    const roomArr = rows as any[]
    const room = roomArr[0]
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }
    res.json({ ...room, basePrice: Number(room.basePrice) })
  } catch (err) {
    console.error('Error fetching room:', err)
    res.status(500).json({ error: 'Failed to fetch room' })
  }
})

export default router
