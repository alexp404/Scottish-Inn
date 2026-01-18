import { Router, Request, Response } from 'express'
import jwt, { SignOptions, Secret } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { pool } from '../utils/db'
import bcrypt from 'bcrypt'
import { validatePassword } from '../utils/passwordValidator'
import crypto from 'crypto'
import { loginRateLimit, resetRateLimit } from '../middleware/rateLimiter'

dotenv.config()

const router = Router()
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'supersecretjwt'
const JWT_EXPIRES = process.env.JWT_EXPIRES || '15m'
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '7d'
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15
const PASSWORD_HISTORY_COUNT = 5

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex')
}

function getExpiryDate(duration: string): Date {
  const match = duration.match(/^(\d+)([smhd])$/)
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const value = parseInt(match[1])
  const unit = match[2] as 's' | 'm' | 'h' | 'd'
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  return new Date(Date.now() + value * multipliers[unit])
}

async function checkAccountLocked(email: string): Promise<boolean> {
  const since = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000)
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM login_attempts WHERE email = $1 AND success = false AND created_at > $2',
    [email, since]
  )
  return parseInt(result.rows[0].count) >= MAX_FAILED_ATTEMPTS
}

async function checkPasswordHistory(userId: string, newPassword: string): Promise<boolean> {
  const result = await pool.query(
    'SELECT password_hash FROM password_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, PASSWORD_HISTORY_COUNT]
  )
  for (const row of result.rows) {
    if (await bcrypt.compare(newPassword, row.password_hash)) return false
  }
  return true
}

router.post('/api/auth/login', loginRateLimit, async (req: Request, res: Response) => {
  const { username, password, twoFactorCode } = req.body
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const userAgent = req.headers['user-agent'] || 'unknown'
  if (!username || !password) return res.status(400).json({ error: 'username and password required' })
  try {
    if (await checkAccountLocked(username)) {
      return res.status(429).json({ error: `Account locked due to too many failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.` })
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [username])
    if (result.rowCount === 0) {
      await pool.query('INSERT INTO login_attempts (email, ip_address, success) VALUES ($1, $2, false)', [username, ip])
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const user = result.rows[0]

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match){
      await pool.query('INSERT INTO login_attempts (email, ip_address, success) VALUES ($1, $2, false)', [username, ip])
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const twoFAResult = await pool.query('SELECT * FROM two_factor_auth WHERE user_id = $1 AND enabled = true', [user.id])
    if (twoFAResult.rowCount && twoFAResult.rowCount > 0 && !twoFactorCode) {
      return res.status(200).json({ requires2FA: true })
    }

    const role = user.is_admin ? 'admin' : user.is_staff ? 'staff' : 'guest'
    const token = jwt.sign({ sub: user.email, role, userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES } as SignOptions)
    const refreshToken = generateRefreshToken()
    const refreshExpiresAt = getExpiryDate(REFRESH_TOKEN_EXPIRES)

    await pool.query(
      'INSERT INTO user_sessions (user_id, refresh_token, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [user.id, refreshToken, ip, userAgent, refreshExpiresAt]
    )
    await pool.query('INSERT INTO login_attempts (email, ip_address, success) VALUES ($1, $2, true)', [username, ip])

    return res.json({ token, refreshToken, role, user: { email: user.email, firstName: user.first_name, lastName: user.last_name } })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Login failed' })
  }
})

router.post('/api/auth/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body || {}
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' })
  try {
    const result = await pool.query('SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > NOW()', [refreshToken])
    if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid or expired refresh token' })
    const session = result.rows[0]
    const newToken = jwt.sign({ sub: session.user_id, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES } as SignOptions)
    await pool.query('UPDATE sessions SET token = $1, updated_at = NOW() WHERE id = $2', [newToken, session.id])
    return res.json({ token: newToken })
  } catch (err) {
    console.error('Refresh token error:', err)
    return res.status(500).json({ error: 'Failed to refresh token' })
  }
})

router.post('/api/auth/logout', async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' })
  try{
    await pool.query('DELETE FROM user_sessions WHERE refresh_token = $1', [refreshToken])
    return res.json({ success: true })
  }catch(err){
    console.error('Logout error:', err)
    return res.status(500).json({ error: 'Logout failed' })
  }
})

router.post('/api/auth/register-admin', async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body
  if (!email || !password || !firstName || !lastName) return res.status(400).json({ error: 'All fields required' })
  const validation = validatePassword(password)
  if (!validation.isValid) return res.status(400).json({ error: 'Password does not meet requirements', errors: validation.errors })
  try{
    const hash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, is_admin, is_verified, is_active) VALUES ($1,$2,$3,$4,true,true,true) RETURNING id, email, first_name, last_name',
      [email, hash, firstName, lastName]
    )
    const created = result.rows[0]
    await pool.query('INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)', [created.id, hash])
    return res.status(201).json({ user: created })
  }catch(err:any){
    if (err?.code === '23505') return res.status(400).json({ error: 'Email already exists' })
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/api/auth/forgot-password', resetRateLimit, async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })
  try{
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (result.rowCount === 0) {
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' })
    }
    const userId = result.rows[0].id
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, resetToken, expiresAt]
    )
    // email sending disabled
    return res.json({ success: true, message: 'If the email exists, a reset link has been sent' })
  }catch(err){
    console.error('Forgot password error:', err)
    return res.status(500).json({ error: 'Failed to process request' })
  }
})

router.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and newPassword required' })
  const validation = validatePassword(newPassword)
  if (!validation.isValid) return res.status(400).json({ error: 'Password does not meet requirements', errors: validation.errors })
  try{
    const result = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW() AND used = false',
      [token]
    )
    if (result.rowCount === 0) return res.status(400).json({ error: 'Invalid or expired reset token' })
    const resetRecord = result.rows[0]
    const hash = await bcrypt.hash(newPassword, 10)
    if (!await checkPasswordHistory(resetRecord.user_id, newPassword)) {
      return res.status(400).json({ error: 'Cannot reuse recent passwords' })
    }
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, resetRecord.user_id])
    await pool.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [resetRecord.id])
    await pool.query('INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)', [resetRecord.user_id, hash])
    await pool.query('DELETE FROM user_sessions WHERE user_id = $1', [resetRecord.user_id])
    return res.json({ success: true, message: 'Password reset successfully' })
  }catch(err){
    console.error('Reset password error:', err)
    return res.status(500).json({ error: 'Failed to reset password' })
  }
})

router.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body
  if (!email || !password || !firstName || !lastName) return res.status(400).json({ error: 'All fields required' })
  const validation = validatePassword(password)
  if (!validation.isValid) return res.status(400).json({ error: 'Password does not meet requirements', errors: validation.errors })
  try{
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rowCount && existing.rowCount > 0) return res.status(400).json({ error: 'Email already exists' })
    const hash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, is_verified, is_active, is_staff, is_admin) VALUES ($1,$2,$3,$4,true,true,false,false) RETURNING id, email, first_name, last_name',
      [email, hash, firstName, lastName]
    )
    const created = result.rows[0]
    return res.status(201).json({ user: created })
  }catch(err:any){
    if (err?.code === '23505') return res.status(400).json({ error: 'Email already exists' })
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Registration failed' })
  }
})

export default router
