import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret'
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt'

export default function adminAuth(req: Request, res: Response, next: NextFunction){
  const auth = req.headers['authorization'] as string | undefined
  const headerToken = req.headers['x-admin-token'] as string | undefined
  let token: string | undefined
  if (auth && auth.startsWith('Bearer ')) token = auth.slice(7)
  if (!token && headerToken) token = headerToken

  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  // Legacy static token support
  if (token === ADMIN_TOKEN) return next()

  // JWT support
  try{
    const payload = jwt.verify(token, JWT_SECRET) as any
    if (!payload || payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    // attach user info for downstream
    ;(req as any).user = { username: payload.sub, role: payload.role }
    return next()
  }catch(err){
    return res.status(401).json({ error: 'Invalid token' })
  }
}
