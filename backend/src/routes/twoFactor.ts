import { Router } from 'express'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { pool } from '../utils/db'
import adminAuth from '../middleware/adminAuth'
import { send2FASetupEmail } from '../services/emailService'
import crypto from 'crypto'

const router = Router()
const APP_NAME = process.env.APP_NAME || 'Hotel Management'

// Setup 2FA - generates secret and QR code
router.post('/api/2fa/setup', adminAuth, async (req, res) => {
  try{
    const userId = (req as any).user.userId
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${APP_NAME} (${(req as any).user.username})`,
      length: 32
    })

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'))

    // Store in database (not enabled yet)
    await pool.query(
      'INSERT INTO two_factor_auth (user_id, secret, backup_codes) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET secret = $2, backup_codes = $3, enabled = false',
      [userId, secret.base32, JSON.stringify(backupCodes)]
    )

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    return res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes
    })
  }catch(err){
    console.error('2FA setup error:', err)
    return res.status(500).json({ error: 'Failed to setup 2FA' })
  }
})

// Verify and enable 2FA
router.post('/api/2fa/verify', adminAuth, async (req, res) => {
  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'Verification code required' })

  try{
    const userId = (req as any).user.userId
    
    const result = await pool.query('SELECT secret FROM two_factor_auth WHERE user_id = $1', [userId])
    if (result.rowCount === 0) return res.status(404).json({ error: '2FA not setup' })

    const secret = result.rows[0].secret
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2
    })

    if (!verified) {
      return res.status(400).json({ error: 'Invalid verification code' })
    }

    // Enable 2FA
    await pool.query('UPDATE two_factor_auth SET enabled = true, enabled_at = NOW() WHERE user_id = $1', [userId])
    
    // Get user email
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId])
    if ((userResult.rowCount || 0) > 0) {
      send2FASetupEmail(userResult.rows[0].email).catch(console.error)
    }

    return res.json({ success: true, message: '2FA enabled successfully' })
  }catch(err){
    console.error('2FA verify error:', err)
    return res.status(500).json({ error: 'Failed to verify 2FA' })
  }
})

// Disable 2FA
router.post('/api/2fa/disable', adminAuth, async (req, res) => {
  const { password } = req.body
  if (!password) return res.status(400).json({ error: 'Password required' })

  try{
    const userId = (req as any).user.userId
    
    // Verify password
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId])
    if (userResult.rowCount === 0) return res.status(404).json({ error: 'User not found' })

    const bcrypt = require('bcrypt')
    const match = await bcrypt.compare(password, userResult.rows[0].password_hash)
    if (!match) return res.status(401).json({ error: 'Invalid password' })

    // Disable 2FA
    await pool.query('DELETE FROM two_factor_auth WHERE user_id = $1', [userId])

    return res.json({ success: true, message: '2FA disabled successfully' })
  }catch(err){
    console.error('2FA disable error:', err)
    return res.status(500).json({ error: 'Failed to disable 2FA' })
  }
})

// Get 2FA status
router.get('/api/2fa/status', adminAuth, async (req, res) => {
  try{
    const userId = (req as any).user.userId
    
    const result = await pool.query('SELECT enabled, enabled_at FROM two_factor_auth WHERE user_id = $1', [userId])
    
    if (result.rowCount === 0) {
      return res.json({ enabled: false })
    }

    return res.json({
      enabled: result.rows[0].enabled,
      enabledAt: result.rows[0].enabled_at
    })
  }catch(err){
    console.error('2FA status error:', err)
    return res.status(500).json({ error: 'Failed to get 2FA status' })
  }
})

export default router
