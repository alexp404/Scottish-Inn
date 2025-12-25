import { Router } from 'express'
import { pool } from '../utils/db'
import adminAuth from '../middleware/adminAuth'

const router = Router()

// List all Fire TV devices
router.get('/api/devices', adminAuth, async (req, res) => {
  try{
    const result = await pool.query(`
      SELECT d.*, r.room_number
      FROM firetv_devices d
      JOIN rooms r ON r.id = d.room_id
      ORDER BY r.room_number
    `)
    return res.json({ devices: result.rows })
  }catch(err){
    console.error('List devices error:', err)
    return res.status(500).json({ error: 'Failed to list devices' })
  }
})

// Get a device by id
router.get('/api/devices/:id', adminAuth, async (req, res) => {
  try{
    const result = await pool.query('SELECT * FROM firetv_devices WHERE id = $1', [req.params.id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Device not found' })
    return res.json(result.rows[0])
  }catch(err){
    console.error('Get device error:', err)
    return res.status(500).json({ error: 'Failed to get device' })
  }
})

// Create / pair a device
router.post('/api/devices', adminAuth, async (req, res) => {
  const { room_id, firetv_device_id, device_token, device_name, model_name, serial_number, status } = req.body
  if (!room_id || !firetv_device_id || !device_token) {
    return res.status(400).json({ error: 'room_id, firetv_device_id and device_token are required' })
  }
  try{
    const result = await pool.query(`
      INSERT INTO firetv_devices (room_id, firetv_device_id, device_token, device_name, model_name, serial_number, status)
      VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,'online'))
      RETURNING *
    `, [room_id, firetv_device_id, device_token, device_name || null, model_name || null, serial_number || null, status || null])
    return res.status(201).json(result.rows[0])
  }catch(err:any){
    if (err?.code === '23505'){
      return res.status(400).json({ error: 'Room or device already paired' })
    }
    console.error('Create device error:', err)
    return res.status(500).json({ error: 'Failed to create device' })
  }
})

// Update device
router.patch('/api/devices/:id', adminAuth, async (req, res) => {
  const { device_name, model_name, serial_number, status, device_token } = req.body
  try{
    const result = await pool.query(`
      UPDATE firetv_devices
      SET device_name = COALESCE($1, device_name),
          model_name = COALESCE($2, model_name),
          serial_number = COALESCE($3, serial_number),
          status = COALESCE($4, status),
          device_token = COALESCE($5, device_token),
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [device_name ?? null, model_name ?? null, serial_number ?? null, status ?? null, device_token ?? null, req.params.id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Device not found' })
    return res.json(result.rows[0])
  }catch(err){
    console.error('Update device error:', err)
    return res.status(500).json({ error: 'Failed to update device' })
  }
})

// Unpair / delete device
router.delete('/api/devices/:id', adminAuth, async (req, res) => {
  try{
    const result = await pool.query('DELETE FROM firetv_devices WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Device not found' })
    return res.json({ success: true })
  }catch(err){
    console.error('Delete device error:', err)
    return res.status(500).json({ error: 'Failed to delete device' })
  }
})

// Get device mapping by room id
router.get('/api/rooms/:roomId/device', adminAuth, async (req, res) => {
  try{
    const result = await pool.query('SELECT * FROM firetv_devices WHERE room_id = $1', [req.params.roomId])
    if (result.rowCount === 0) return res.status(404).json({ error: 'No device for this room' })
    return res.json(result.rows[0])
  }catch(err){
    console.error('Room device error:', err)
    return res.status(500).json({ error: 'Failed to fetch device for room' })
  }
})

export default router
