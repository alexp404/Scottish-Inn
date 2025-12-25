import { Router } from 'express'
import { rooms } from '../data/store'

const router = Router()

// GET /api/rooms
router.get('/api/rooms', (req, res) => {
  res.json({ rooms })
})

// GET /api/rooms/:id
router.get('/api/rooms/:id', (req, res) => {
  const r = rooms.find((x) => x.id === req.params.id)
  if (!r) return res.status(404).json({ error: 'Room not found' })
  res.json(r)
})

export default router
