import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt'

export default function userAuth(req: Request, res: Response, next: NextFunction){
  const auth = req.headers['authorization'] as string | undefined
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = auth.slice(7)
  try{
    const payload = jwt.verify(token, JWT_SECRET) as any
    if (!payload) return res.status(401).json({ error: 'Invalid token' })
    ;(req as any).user = { username: payload.sub, role: payload.role, userId: payload.userId }
    return next()
  }catch(err){
    return res.status(401).json({ error: 'Invalid token' })
  }
}
