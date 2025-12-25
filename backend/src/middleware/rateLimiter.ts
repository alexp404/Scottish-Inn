import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible'
import { Request, Response, NextFunction } from 'express'

// Rate limiter for login attempts (5 attempts per 15 minutes)
const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60,
  blockDuration: 15 * 60
})

// Rate limiter for password reset requests (3 per hour)
const resetLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60 * 60,
  blockDuration: 60 * 60
})

// General auth endpoint limiter (10 per minute)
const authLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60
})

export function loginRateLimit(req: Request, res: Response, next: NextFunction){
  const key = req.body?.username || req.ip
  loginLimiter.consume(key)
    .then(() => next())
    .catch((rej: RateLimiterRes) => {
      const secs = Math.round(rej.msBeforeNext / 1000) || 1
      res.set('Retry-After', String(secs))
      res.status(429).json({ 
        error: 'Too many login attempts',
        retryAfter: secs
      })
    })
}

export function resetRateLimit(req: Request, res: Response, next: NextFunction){
  const key = req.body?.email || req.ip
  resetLimiter.consume(key)
    .then(() => next())
    .catch((rej: RateLimiterRes) => {
      const secs = Math.round(rej.msBeforeNext / 1000) || 1
      res.set('Retry-After', String(secs))
      res.status(429).json({ 
        error: 'Too many password reset requests',
        retryAfter: secs
      })
    })
}

export function authRateLimit(req: Request, res: Response, next: NextFunction){
  const ip = req.ip || req.connection.remoteAddress || 'unknown'
  authLimiter.consume(ip)
    .then(() => next())
    .catch((rej: RateLimiterRes) => {
      const secs = Math.round((rej.msBeforeNext || 1000) / 1000) || 1
      res.set('Retry-After', String(secs))
      res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: secs
      })
    })
}
