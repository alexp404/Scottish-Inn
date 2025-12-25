import { Router } from 'express'
import { pool } from '../utils/db'
import adminAuth from '../middleware/adminAuth'

const router = Router()

// Get all active sessions for current user
router.get('/api/sessions', adminAuth, async (req, res) => {
  try{
    const userId = (req as any).user.userId
    
    const result = await pool.query(
      'SELECT id, ip_address, user_agent, created_at, last_activity, expires_at FROM user_sessions WHERE user_id = $1 AND expires_at > NOW() ORDER BY last_activity DESC',
      [userId]
    )

    return res.json({ sessions: result.rows })
  }catch(err){
    console.error('Get sessions error:', err)
    return res.status(500).json({ error: 'Failed to get sessions' })
  }
})

// Revoke a specific session
router.delete('/api/sessions/:sessionId', adminAuth, async (req, res) => {
  const { sessionId } = req.params
  const userId = (req as any).user.userId

  try{
    const result = await pool.query(
      'DELETE FROM user_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [sessionId, userId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Session not found' })
    }

    return res.json({ success: true, message: 'Session revoked' })
  }catch(err){
    console.error('Revoke session error:', err)
    return res.status(500).json({ error: 'Failed to revoke session' })
  }
})

// Revoke all sessions except current
router.post('/api/sessions/revoke-all', adminAuth, async (req, res) => {
  const { currentRefreshToken } = req.body
  const userId = (req as any).user.userId

  try{
    const result = await pool.query(
      'DELETE FROM user_sessions WHERE user_id = $1 AND refresh_token != $2 RETURNING id',
      [userId, currentRefreshToken || '']
    )

    return res.json({ 
      success: true, 
      message: `${result.rowCount} session(s) revoked`,
      count: result.rowCount
    })
  }catch(err){
    console.error('Revoke all sessions error:', err)
    return res.status(500).json({ error: 'Failed to revoke sessions' })
  }
})

export default router
