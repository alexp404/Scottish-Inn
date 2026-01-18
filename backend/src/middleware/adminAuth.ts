import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import * as jwt from 'jsonwebtoken'

dotenv.config()

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret'
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'supersecretjwt'

interface AuthRequest extends Request {
  user?: {
    username: string
    role: string
    userId?: string
  }
}

export default function adminAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'] as string | undefined
  const headerToken = req.headers['x-admin-token'] as string | undefined
  let token: string | undefined

  // Extract token from Authorization header or x-admin-token header
  if (auth && auth.startsWith('Bearer ')) {
    token = auth.slice(7)
  } else if (headerToken) {
    token = headerToken
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' })
  }

  // Legacy static token support (for backward compatibility)
  if (token === ADMIN_TOKEN) {
    console.log('✅ Admin authenticated with static token')
    return next()
  }

  // JWT token verification
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token payload' })
    }

    // Check if user has admin role
    if (payload.role !== 'admin') {
      console.warn('❌ Access denied - User does not have admin role:', payload.role)
      return res.status(403).json({ error: 'Forbidden - Admin access required' })
    }

    // Attach user info to request for downstream middleware/routes
    (req as AuthRequest).user = {
      username: payload.sub,
      role: payload.role,
      userId: payload.userId
    }

    console.log('✅ Admin authenticated with JWT:', payload.sub)
    return next()
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    console.error('JWT verification error:', err)
    return res.status(401).json({ error: 'Authentication failed' })
  }
}
