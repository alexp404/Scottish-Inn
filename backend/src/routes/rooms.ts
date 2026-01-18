import { Router } from 'express'
import { query } from '../utils/db'

const router = Router()

router.get('/api/rooms', async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        id, room_number as roomNumber, room_type as roomType,
        capacity, base_price as basePrice, status,
        COALESCE(images, JSON_ARRAY()) as images
      FROM rooms ORDER BY room_number ASC
    `)
    const formatted = (rows as any[]).map((r: any) => ({ ...r, basePrice: Number(r.basePrice) }))
    res.json({ rooms: formatted })
  } catch (err) {
    console.error('Error fetching rooms:', err)
    res.status(500).json({ error: 'Failed to fetch rooms' })
  }
})

router.get('/api/rooms/:id', async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        id, room_number as roomNumber, room_type as roomType,
        capacity, base_price as basePrice, status,
        COALESCE(images, JSON_ARRAY()) as images
      FROM rooms WHERE id = ?
    `, [req.params.id])
    const roomsArray = rows as any[]
    if (roomsArray.length === 0) return res.status(404).json({ error: 'Room not found' })
    const room = roomsArray[0]
    res.json({ ...room, basePrice: Number(room.basePrice) })
  } catch (err) {
    console.error('Error fetching room:', err)
    res.status(500).json({ error: 'Failed to fetch room' })
  }
})

export default router
