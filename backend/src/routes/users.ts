import { Router } from 'express'
import { pool } from '../utils/db'
import userAuth from '../middleware/userAuth'

const router = Router()

// Get current user profile (JWT required)
router.get('/api/users/me', userAuth, async (req, res) => {
  const user = (req as any).user
  try{
    const result = await pool.query('SELECT id, email, first_name, last_name, phone_number, preferences FROM users WHERE id = $1', [user.userId])
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' })
    return res.json({ user: result.rows[0] })
  }catch(err){
    console.error('Get profile error:', err)
    return res.status(500).json({ error: 'Failed to get profile' })
  }
})

// Update current user profile
router.put('/api/users/me', userAuth, async (req, res) => {
  const user = (req as any).user
  const { firstName, lastName, phoneNumber, preferences } = req.body
  try{
    const result = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, phone_number = $3, preferences = COALESCE($4::jsonb, preferences), updated_at = NOW() WHERE id = $5 RETURNING id, email, first_name, last_name, phone_number, preferences',
      [firstName, lastName, phoneNumber, preferences ? JSON.stringify(preferences) : null, user.userId]
    )
    return res.json({ user: result.rows[0] })
  }catch(err){
    console.error('Update profile error:', err)
    return res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
